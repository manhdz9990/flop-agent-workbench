"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { LocalIdentitySession } from "../lib/identity";
import type { InputResolution } from "../lib/input";
import type { ReadResult, RoomObservation, RoomsDiscoveryPayload } from "../lib/live";
import { publishPreparedMessage, type PublishAttemptResult, type PublishAttemptSession } from "../lib/publish";
import { assertProtocolName, canonicalSignedPayload, sweepSingleLine } from "../lib/protocol";
import { verifyPublishedReadback, type ReadbackResult } from "../lib/readback";
import { createReceiptDownload, downloadReceiptLocally, serializeEvidenceReceiptMarkdown } from "../lib/receipt";
import { buildRoomConversation, highestObservedNonceForDid, prioritizeDiscoveredLobby, type RoomConversationMessage } from "../lib/rooms-chat";
import { type PreparedSignedMessage, type SessionNonceReservations } from "../lib/signing";
import { createRoomObservedEvidence, createVerifiedPublicationEvidence, type EvidenceActivityEntry } from "../lib/evidence-activity";
import { SelectedRoomAutoRefresh, type ConversationRefreshReason } from "../lib/rooms-auto-refresh";

interface Review {
  readonly room: string;
  readonly did: string;
  readonly nonce: string;
  readonly text: string;
  readonly canonicalPayload: string;
  readonly clock: bigint;
}

interface RoomsChatProps {
  readonly identity?: LocalIdentitySession;
  readonly reservations: SessionNonceReservations;
  readonly attempts: PublishAttemptSession;
  readonly onBack: () => void;
  readonly onCreateOrImport: () => void;
  readonly onSecureBackup: () => void;
  readonly onInspectMessage: (room: string, sequence: string) => void;
  readonly onEvidenceObserved: (entry: EvidenceActivityEntry) => void;
}

const errorText = (cause: unknown, fallback: string) => cause instanceof Error ? cause.message : fallback;

export function RoomsChat({ identity, reservations, attempts, onBack, onCreateOrImport, onSecureBackup, onInspectMessage, onEvidenceObserved }: RoomsChatProps) {
  const [rooms, setRooms] = useState<readonly RoomObservation[]>();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [selectedRoomRead, setSelectedRoomRead] = useState(false);
  const [messages, setMessages] = useState<readonly RoomConversationMessage[]>([]);
  const [text, setText] = useState("");
  const [review, setReview] = useState<Review>();
  const [prepared, setPrepared] = useState<PreparedSignedMessage>();
  const [publishResult, setPublishResult] = useState<PublishAttemptResult>();
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [addedEvidence, setAddedEvidence] = useState<ReadonlySet<string>>(() => new Set());
  const [readback, setReadback] = useState<ReadbackResult>();
  const [showReceipt, setShowReceipt] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [discoveryError, setDiscoveryError] = useState<string>();
  const [conversationError, setConversationError] = useState<string>();
  const [conversationBusy, setConversationBusy] = useState(false);
  const [mobileConversation, setMobileConversation] = useState(false);
  const operation = useRef<string | undefined>(undefined);
  const revision = useRef(0);
  const readRevision = useRef(0);
  const readRoomRef = useRef<(room: string, signal: AbortSignal, reason: ConversationRefreshReason) => Promise<void>>(async () => undefined);
  const refreshLifecycle = useRef<SelectedRoomAutoRefresh>(undefined);
  const activeIdentity = identity && !identity.isLocked ? identity : undefined;
  const eligible = activeIdentity?.backupVerificationStatus === "VERIFIED";
  const characterCount = Array.from(text).length;
  const receipt = readback?.state === "PUBLISHED_AND_VERIFIED" || readback?.state === "OBSERVED_BUT_NOT_VERIFIED" ? readback.receipt : undefined;
  const receiptMarkdown = useMemo(() => receipt ? serializeEvidenceReceiptMarkdown(receipt) : undefined, [receipt]);
  const orderedRooms = useMemo(() => prioritizeDiscoveredLobby(rooms ?? []), [rooms]);
  const discoveredLobby = orderedRooms.some((room) => room.room === "lobby");

  function begin(name: string): boolean { if (operation.current !== undefined) return false; operation.current = name; setBusy(name); setError(undefined); return true; }
  function end(name: string): void { if (operation.current === name) { operation.current = undefined; setBusy(undefined); } }
  function invalidatePrepared(): void { revision.current += 1; setReview(undefined); setPrepared(undefined); setPublishConfirm(false); setPublishResult(undefined); setReadback(undefined); setShowReceipt(false); }

  async function discoverRooms(): Promise<void> {
    if (!begin("discover")) return;
    setDiscoveryError(undefined);
    try {
      const response = await fetch("/api/rooms");
      const result = await response.json() as ReadResult<RoomsDiscoveryPayload>;
      if (!result.ok) throw new Error(result.error.message);
      setRooms(result.value.observations);
    } catch (cause) { setRooms(undefined); setDiscoveryError(errorText(cause, "The bounded Technocore room list could not be read.")); }
    finally { end("discover"); }
  }

  async function readRoom(room: string, signal: AbortSignal, reason: ConversationRefreshReason): Promise<void> {
    const requestRevision = ++readRevision.current;
    setConversationError(undefined);
    try {
      const response = await fetch("/api/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "ROOM", room }),
        signal,
      });
      const resolution = await response.json() as InputResolution;
      if (!resolution.ok) throw new Error(resolution.error.message);
      if (resolution.kind !== "ROOM") throw new Error("Unexpected room response.");
      if (!signal.aborted && readRevision.current === requestRevision) { setMessages(buildRoomConversation(resolution.value.report.messages)); setSelectedRoomRead(true); }
    } catch (cause) {
      if (!signal.aborted && readRevision.current === requestRevision) setConversationError(errorText(cause, reason === "INITIAL" ? "Room conversation could not be loaded." : "Refresh unavailable."));
    }
  }
  function selectRoom(room: string): void {
    setConversationError(undefined); setSelectedRoom(room); setSelectedRoomRead(false); setMessages([]); setText(""); setMobileConversation(true); invalidatePrepared();
    refreshLifecycle.current?.select(room);
  }

  function backToRooms(): void {
    refreshLifecycle.current?.stop();
    readRevision.current += 1;
    setSelectedRoom(undefined); setSelectedRoomRead(false); setMessages([]); setText(""); setConversationError(undefined); setMobileConversation(false); invalidatePrepared();
  }

  useEffect(() => { readRoomRef.current = readRoom; });

  useEffect(() => {
    const lifecycle = new SelectedRoomAutoRefresh((room, signal, reason) => readRoomRef.current(room, signal, reason), setConversationBusy);
    refreshLifecycle.current = lifecycle;
    const syncVisibility = () => lifecycle.setVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => { document.removeEventListener("visibilitychange", syncVisibility); lifecycle.dispose(); readRevision.current += 1; };
  }, []);

  function editMessage(value: string): void { setText(value); invalidatePrepared(); }
  function prepareReview(): void {
    if (!activeIdentity || !eligible || !selectedRoom) return;
    try {
      assertProtocolName(selectedRoom);
      const swept = sweepSingleLine(text);
      const clock = BigInt(Date.now());
      const highestObservedNonce = highestObservedNonceForDid(messages, activeIdentity.publicIdentity.did);
      const nonce = reservations.previewNext(activeIdentity.publicIdentity.did, selectedRoom, highestObservedNonce, { nowMilliseconds: () => clock });
      setReview({
        room: selectedRoom,
        did: activeIdentity.publicIdentity.did,
        nonce,
        text: swept,
        canonicalPayload: new TextDecoder().decode(canonicalSignedPayload(selectedRoom, nonce, swept)),
        clock,
      });
      setError(undefined);
    } catch (cause) { setError(errorText(cause, "Message review could not be prepared.")); }
  }

  async function sign(): Promise<void> {
    if (!activeIdentity || !eligible || !review || !begin("sign")) return;
    const startedAt = revision.current;
    try {
      const signed = await activeIdentity.prepareSignedMessage(
        { room: review.room, text: review.text, highestObservedNonce: highestObservedNonceForDid(messages, review.did) },
        reservations,
        { nowMilliseconds: () => review.clock },
      );
      if (signed.nonce !== review.nonce || signed.canonicalPayload !== review.canonicalPayload) throw new Error("Signed evidence did not match the reviewed payload.");
      if (revision.current === startedAt) setPrepared(signed);
    } catch (cause) { setError(errorText(cause, "Local signing could not be completed.")); }
    finally { end("sign"); }
  }

  function addEvidence(room: string, message: RoomConversationMessage): void {
    const entry = createRoomObservedEvidence(room, message);
    onEvidenceObserved(entry);
    setAddedEvidence((current) => new Set(current).add(entry.id));
  }

  function addVerifiedEvidence(): void {
    if (!prepared || !readback) return;
    const entry = createVerifiedPublicationEvidence(prepared, readback);
    if (!entry) return;
    onEvidenceObserved(entry);
    setAddedEvidence((current) => new Set(current).add(entry.id));
  }

  async function publish(): Promise<void> {
    if (!prepared || !begin("publish")) return;
    const startedAt = revision.current;
    setPublishConfirm(false);
    try {
      const result = await publishPreparedMessage(prepared, attempts);
      if (revision.current === startedAt) setPublishResult(result);
    } catch (cause) { setError(errorText(cause, "Publish attempt could not be initiated.")); }
    finally { end("publish"); }
  }

  async function checkPublication(): Promise<void> {
    if (!prepared || attempts.stateFor(prepared) === "NOT_ATTEMPTED" || !begin("readback")) return;
    const startedAt = revision.current;
    try {
      const result = await verifyPublishedReadback({ prepared, attempts });
      if (revision.current === startedAt) { setReadback(result); setShowReceipt(false); }
    } catch (cause) { setError(errorText(cause, "Read-back verification could not be completed.")); }
    finally { end("readback"); }
  }

  if (showReceipt && receipt && receiptMarkdown && prepared === undefined) return null;

  return <section className={`flow-page rooms-chat${mobileConversation ? " mobile-conversation" : ""}`} aria-labelledby="rooms-chat-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Workbench</button>
    <div className="flow-heading rooms-heading"><div><div className="eyebrow">Rooms</div><h1 id="rooms-chat-title">Public conversations</h1><p className="lede">Choose a room to read its bounded retained conversation. Room discovery remains manual.</p></div></div>
    {error && <div className="operational-error" role="alert"><strong>Room action unavailable</strong><span>{error}</span><small>This is an operational result, not an evidence verdict.</small></div>}
    <div className="rooms-layout">
      <aside className="rooms-sidebar" aria-label="Public rooms">
        <div className="rooms-list-heading"><div><strong>Public Rooms</strong><small>Bounded discovery · topics are untrusted</small></div><button className="tertiary" type="button" onClick={() => void discoverRooms()} disabled={busy !== undefined}>{rooms === undefined ? "Load rooms" : "Refresh rooms"}</button></div>
        {busy === "discover" && <p className="rooms-state" role="status">Loading public rooms…</p>}
        {discoveryError && <div className="rooms-state operational-error" role="alert"><strong>Public rooms unavailable</strong><span>The bounded Technocore room list could not be read.</span><small>{discoveryError}</small><button className="secondary" type="button" onClick={() => void discoverRooms()} disabled={busy !== undefined}>Try Again</button></div>}
        {!discoveryError && rooms?.length === 0 && <p className="rooms-state">No public rooms were observed in this bounded response.</p>}
        <div className="room-choices">{orderedRooms.map((room) => <button key={room.room} type="button" aria-current={room.room === selectedRoom ? "true" : undefined} className={room.room === selectedRoom ? "room-choice selected" : "room-choice"} onClick={() => selectRoom(room.room)} disabled={busy !== undefined}><span className="room-choice-title"><strong className="break-anywhere"># {room.room}</strong>{room.room === "lobby" && <em>Recommended · discovered</em>}</span><span className="break-anywhere">{room.topic ?? "No topic observed"}</span><small>Sequence {room.seq} · {room.lastActivity}</small></button>)}</div>
        {!discoveredLobby && <section className="direct-room-access" aria-labelledby="direct-lobby-title"><div className="eyebrow">Direct Room Access</div><h2 id="direct-lobby-title"># lobby</h2><p>Not observed in the current room list. Open the fixed public room directly.</p><button className="secondary" type="button" onClick={() => selectRoom("lobby")} disabled={busy !== undefined}>Open lobby →</button></section>}
      </aside>
      <section className="conversation" aria-live="polite">
        {!selectedRoom && <div className="conversation-empty"><div className="eyebrow">Retained Conversation</div><h2>Choose a room</h2><p>Select a public room to read its retained conversation.</p><small>No room is read and no composer is shown until you choose one.</small></div>}
        {selectedRoom && <><div className="conversation-heading"><button className="mobile-room-back" type="button" onClick={backToRooms}>← Back to rooms</button><div><div className="eyebrow">Retained Conversation</div><h2 className="break-anywhere"># {selectedRoom}</h2><p>Retained conversation · Auto-refresh on</p></div><button className="secondary" type="button" disabled={busy !== undefined || conversationBusy} onClick={() => refreshLifecycle.current?.manual()}>{conversationBusy ? "Refreshing…" : "Refresh conversation"}</button></div>
          <p className="rooms-limitation">Retained data is not complete history. Room topics and messages are untrusted.</p>
          {conversationError && <div className="rooms-state operational-error" role="status"><strong>Refresh unavailable</strong><span>{conversationError}</span><small>The last successful retained conversation is preserved. This is not an evidence verdict.</small></div>}
          {conversationBusy && !selectedRoomRead && <div className="state-card">Loading retained messages…</div>}
          {!conversationBusy && !selectedRoomRead && !conversationError && <div className="state-card"><strong>Room selected.</strong><span>The bounded retained conversation is being prepared.</span></div>}
          {selectedRoomRead && messages.length === 0 && <div className="state-card"><strong>No retained messages were observed in this room.</strong><span>This does not establish that the room has no history.</span></div>}
          <div className="message-list">{messages.map((message) => { const entry = createRoomObservedEvidence(selectedRoom, message); return <article className="chat-message" key={`${message.index}-${message.sequence ?? "none"}`}><p className="prewrap break-anywhere message-content">{message.text}</p><header><div><strong className="break-anywhere">{message.writerKind === "SIGNED_DID_KEY" ? `${message.writer.slice(0, 18)}…${message.writer.slice(-6)}` : message.writer}</strong><small>{message.writerKind === "SIGNED_DID_KEY" ? "Cryptographic DID · not real-world identity" : "Self-asserted nickname"}</small></div><div className="message-status"><span className={message.writerKind === "SIGNED_DID_KEY" ? "writer-kind signed" : "writer-kind unsigned"}>{message.writerKind === "SIGNED_DID_KEY" ? `SIGNED · ${message.verdict}` : "UNSIGNED"}</span>{message.sequence && <small>seq {message.sequence}</small>}</div></header><div className="message-actions">{message.sequence && <button className="tertiary" type="button" onClick={() => onInspectMessage(selectedRoom, message.sequence!)}>Inspect message</button>}<button className="tertiary" type="button" disabled={addedEvidence.has(entry.id)} onClick={() => addEvidence(selectedRoom, message)}>{addedEvidence.has(entry.id) ? "Added to Evidence" : "Add to Evidence"}</button></div></article>; })}</div>
          <section className={`composer${!activeIdentity ? " composer-read-only" : !eligible ? " composer-locked" : " composer-ready"}`} aria-labelledby="composer-title">
            {!activeIdentity ? <><div className="composer-state-heading"><span className="composer-state-icon" aria-hidden="true">▣</span><div><div className="eyebrow">Composer unavailable</div><h2 id="composer-title">Read-only conversation</h2></div></div><p>Create or import an Agent to sign and publish to this room. Reading retained messages remains available.</p><button className="primary" type="button" onClick={onCreateOrImport}>Create or Import Agent →</button><p className="composer-secret-note">Never enter private keys, seeds, passphrases, passwords, tokens, or backup files here.</p></>
              : !eligible ? <><div className="composer-state-heading"><span className="composer-state-icon" aria-hidden="true">▣</span><div><div className="eyebrow">Backup required</div><h2 id="composer-title">Composer locked</h2></div></div><p>Secure backup to sign and publish.</p><button className="primary" type="button" onClick={onSecureBackup}>Secure Backup →</button><p className="composer-reading-note">Reading retained messages remains available.</p></>
              : <>{!review && !prepared && <><div className="composer-state-heading"><span className="composer-state-icon" aria-hidden="true">✎</span><div><div className="eyebrow">Ready to compose</div><h2 id="composer-title">Write to <span className="break-anywhere">#{selectedRoom}</span></h2></div></div><p className="composer-public-note">Messages are public and untrusted after publication. Retained history may be incomplete.</p><label><span>Message</span><textarea aria-label="Room message" placeholder="Write a message…" rows={4} value={text} onChange={(event) => editMessage(event.target.value)} /></label><div className="composer-meta"><span aria-live="polite">{characterCount} {characterCount === 1 ? "character" : "characters"}</span><span>Destination: <strong className="break-anywhere">#{selectedRoom}</strong></span></div><p className="composer-secret-note">Do not enter private keys, seeds, passphrases, passwords, tokens, or backup content.</p><button className="primary" type="button" disabled={!text || busy !== undefined} onClick={prepareReview}>Review Message →</button></>}{review && !prepared && <section className="compose-review"><div className="eyebrow">Review before signing</div><h2 id="composer-title">Review message</h2><dl className="review-summary"><dt>Room</dt><dd className="break-anywhere">#{review.room}</dd><dt>From</dt><dd className="mono break-anywhere">{`${review.did.slice(0, 18)}…${review.did.slice(-6)}`}</dd><dt>Message</dt><dd className="prewrap break-anywhere">{review.text}</dd><dt>Nonce</dt><dd className="mono break-anywhere">{review.nonce}</dd></dl><details className="advanced-details"><summary>Technical signing details</summary><dl aria-label="Room signed evidence review"><dt>Full DID</dt><dd className="mono break-anywhere">{review.did}</dd><dt>Exact nonce</dt><dd className="mono">{review.nonce}</dd><dt>Post-sweep text</dt><dd className="prewrap">{review.text}</dd><dt>Canonical payload</dt><dd className="mono break-anywhere">{review.canonicalPayload}</dd></dl></details><div className="composer-actions"><button className="primary" type="button" disabled={busy !== undefined} onClick={() => void sign()}>{busy === "sign" ? "Signing locally…" : "Sign locally"}</button><button className="text-action" type="button" onClick={() => invalidatePrepared()}>Edit message</button></div></section>}{prepared && !publishResult && <><div className="success-note signed-local-state" role="status"><strong>Signed locally</strong><span>This message has not been published.</span></div><p className="warning">Publishing is not proof of verification.</p>{busy === "publish" && <div className="state-card">Publishing…</div>}<button className="primary" type="button" disabled={busy !== undefined} onClick={() => setPublishConfirm(true)}>Publish Message →</button><button className="text-action" type="button" disabled={busy !== undefined} onClick={() => invalidatePrepared()}>Edit Message</button></>}{publishConfirm && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="room-publish-title"><div><h3 id="room-publish-title">Publish to #{prepared?.room}?</h3><p>This will send the signed message to the public Technocore room.</p><strong>The publish attempt cannot safely reuse the same nonce.</strong><div className="confirm-actions"><button className="primary" type="button" disabled={busy !== undefined} onClick={() => void publish()}>Publish message</button><button className="secondary" type="button" disabled={busy !== undefined} onClick={() => setPublishConfirm(false)}>Cancel</button></div></div></div>}{publishResult && !readback && <PublishAttemptStatus result={publishResult} />}{readback && <ReadbackStatus result={readback} />}{publishResult && readback?.state !== "PUBLISHED_AND_VERIFIED" && <button className="primary" type="button" disabled={busy !== undefined} onClick={() => void checkPublication()}>{busy === "readback" ? "Checking retained evidence…" : readback?.state === "NOT_OBSERVED" ? "Check again" : readback?.state === "READBACK_UNAVAILABLE" ? "Try read-back again" : "Check publication"}</button>}{readback?.state === "PUBLISHED_AND_VERIFIED" && prepared && <div className="composer-actions"><button className="primary" type="button" disabled={addedEvidence.has(createVerifiedPublicationEvidence(prepared, readback)!.id)} onClick={addVerifiedEvidence}>{addedEvidence.has(createVerifiedPublicationEvidence(prepared, readback)!.id) ? "Added to Evidence" : "Add to Evidence"}</button><button className="secondary" type="button" onClick={() => setShowReceipt(true)}>View Receipt</button></div>}{showReceipt && receipt && receiptMarkdown && <section className="receipt-inline"><div className="eyebrow">Observed protocol evidence</div><h3>Evidence Receipt</h3><dl className="review-summary"><dt>Conclusion</dt><dd>{readback?.state === "PUBLISHED_AND_VERIFIED" ? "Published and verified" : readback?.state === "OBSERVED_BUT_NOT_VERIFIED" ? `Observed · ${readback.evidenceVerdict ?? "UNVERIFIABLE"}` : "Not available"}</dd><dt>Room</dt><dd className="break-anywhere">#{prepared!.room}</dd><dt>Cryptographic result</dt><dd>{readback?.state === "PUBLISHED_AND_VERIFIED" ? "VALID" : readback?.state === "OBSERVED_BUT_NOT_VERIFIED" ? readback.evidenceVerdict ?? "UNVERIFIABLE" : "Not available"}</dd></dl><details className="advanced-details"><summary>Technical evidence</summary><pre aria-label="Rooms Evidence Receipt">{receiptMarkdown}</pre></details><p className="receipt-limitation">This receipt records observed protocol evidence. It does not establish real-world identity, trustworthiness, payment, settlement, rewards, or eligibility.</p><div className="composer-actions"><button className="secondary" type="button" onClick={() => downloadReceiptLocally(createReceiptDownload(receipt, "markdown"))}>Download receipt</button><button className="text-action" type="button" onClick={() => setShowReceipt(false)}>Close Receipt</button></div></section>}</>}
          </section>
        </>}
      </section>
    </div>
  </section>;
}

function PublishAttemptStatus({ result }: { readonly result: PublishAttemptResult }) {
  if (result.state === "RESPONSE_RECEIVED") return <div className="outcome-note" role="status"><strong>Publish request completed</strong><span>A response was received, but publication is not verified yet.</span></div>;
  return <div className="warning" role="status"><strong>Publication outcome unknown</strong><span>The request outcome could not be confirmed. Do not retry this message with the same nonce.</span></div>;
}

function ReadbackStatus({ result }: { readonly result: ReadbackResult }) {
  if (result.state === "PUBLISHED_AND_VERIFIED") return <div className="verified-record" role="status"><strong>Published and verified</strong><span>The exact record was observed and its signature verified successfully.</span></div>;
  if (result.state === "NOT_OBSERVED") return <div className="warning" role="status"><strong>Not observed yet</strong><span>The exact signed record was not observed in the retained room data.</span></div>;
  if (result.state === "READBACK_UNAVAILABLE") return <div className="operational-error" role="alert"><strong>Unable to check publication</strong><span>The retained room data could not be read. Publication status remains unknown.</span><small>{result.operationalError.code}: {result.operationalError.message}</small></div>;
  if (result.state === "OBSERVED_BUT_NOT_VERIFIED" && result.evidenceVerdict === "INVALID") return <div className="warning verdict-invalid" role="status"><strong>Invalid signature</strong><span>Ed25519 verification ran with usable evidence and returned false.</span></div>;
  if (result.state === "OBSERVED_BUT_NOT_VERIFIED") return <div className="warning" role="status"><strong>Record observed, verification not confirmed</strong><span>Evidence Verdict: {result.evidenceVerdict ?? "UNVERIFIABLE"}. The exact signed record was not independently verified.</span></div>;
  return null;
}
