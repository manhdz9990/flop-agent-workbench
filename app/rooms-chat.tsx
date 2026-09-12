"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import type { LocalIdentitySession } from "../lib/identity";
import type { InputResolution } from "../lib/input";
import { validateRoomName, type ReadResult, type RoomObservation, type RoomsDiscoveryPayload } from "../lib/live";
import { publishPreparedMessage, type PublishAttemptSession } from "../lib/publish";
import { buildRoomConversation, highestObservedNonceForDid, prioritizeDiscoveredLobby, type RoomConversationMessage } from "../lib/rooms-chat";
import type { PreparedSignedMessage, SessionNonceReservations } from "../lib/signing";
import { createRoomObservedEvidence, type EvidenceActivityEntry } from "../lib/evidence-activity";
import { SelectedRoomLiveSession, type LiveRoomReadReason, type LiveRoomReadResult } from "../lib/rooms-live-session";

interface OptimisticMessage {
  readonly id: number;
  readonly room: string;
  readonly text: string;
  readonly prepared?: PreparedSignedMessage;
  readonly status: "SENDING" | "RESPONSE_RECEIVED" | "OUTCOME_UNKNOWN" | "FAILED_OPERATIONAL";
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
const messageKey = (message: RoomConversationMessage) => message.sequence === undefined
  ? JSON.stringify([message.writer, message.nonce ?? null, message.text, message.signature ?? null])
  : `seq:${message.sequence}`;

function relativeTime(timestamp?: string): string {
  if (!timestamp) return "";
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - parsed) / 1_000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}

export function RoomsChat({ identity, reservations, attempts, onBack, onCreateOrImport, onSecureBackup, onInspectMessage, onEvidenceObserved }: RoomsChatProps) {
  const [rooms, setRooms] = useState<readonly RoomObservation[]>();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [exactRoom, setExactRoom] = useState("");
  const [exactRoomError, setExactRoomError] = useState<string>();
  const [selectedRoomRead, setSelectedRoomRead] = useState(false);
  const [messages, setMessages] = useState<readonly RoomConversationMessage[]>([]);
  const messagesRef = useRef<readonly RoomConversationMessage[]>([]);
  const selectedRoomReadRef = useRef(false);
  const [text, setText] = useState("");
  const [addedEvidence, setAddedEvidence] = useState<ReadonlySet<string>>(() => new Set());
  const [busy, setBusy] = useState<string | undefined>();
  const [discoveryError, setDiscoveryError] = useState<string | undefined>();
  const [conversationError, setConversationError] = useState<string | undefined>();
  const [conversationBusy, setConversationBusy] = useState(false);
  const [mobileConversation, setMobileConversation] = useState(false);
  const [roomsPanelOpen, setRoomsPanelOpen] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [optimisticMessages, setOptimisticMessages] = useState<readonly OptimisticMessage[]>([]);
  const operation = useRef<string | undefined>(undefined);
  const readRevision = useRef(0);
  const readRoomRef = useRef<(room: string, cursor: string | undefined, signal: AbortSignal, reason: LiveRoomReadReason) => Promise<LiveRoomReadResult>>(async () => ({ ok: false }));
  const liveSession = useRef<SelectedRoomLiveSession | undefined>(undefined);
  const conversationViewport = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const roomsPanelClose = useRef<HTMLButtonElement>(null);
  const followNewest = useRef(true);
  const resetConversationScroll = useRef(false);
  const pendingScrollAnchor = useRef<{ readonly key: string; readonly offset: number } | undefined>(undefined);
  const optimisticId = useRef(0);
  const activeIdentity = identity && !identity.isLocked ? identity : undefined;
  const eligible = activeIdentity?.backupVerificationStatus === "VERIFIED";
  const orderedRooms = useMemo(() => prioritizeDiscoveredLobby(rooms ?? []), [rooms]);
  const discoveredLobby = orderedRooms.some((room) => room.room === "lobby");

  function begin(name: string): boolean {
    if (operation.current !== undefined) return false;
    operation.current = name; setBusy(name); return true;
  }
  function end(name: string): void {
    if (operation.current === name) { operation.current = undefined; setBusy(undefined); }
  }

  async function discoverRooms(): Promise<void> {
    if (!begin("discover")) return;
    setDiscoveryError(undefined);
    try {
      const response = await fetch("/api/rooms");
      const result = await response.json() as ReadResult<RoomsDiscoveryPayload>;
      if (!result.ok) throw new Error(result.error.message);
      setRooms(result.value.observations);
    } catch (cause) {
      setRooms(undefined);
      setDiscoveryError(errorText(cause, "The bounded Technocore room list could not be read."));
    } finally { end("discover"); }
  }

  async function readRoom(room: string, cursor: string | undefined, signal: AbortSignal, reason: LiveRoomReadReason): Promise<LiveRoomReadResult> {
    const requestRevision = ++readRevision.current;
    setConversationError(undefined);
    try {
      const response = await fetch("/api/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "ROOM", room, ...(cursor === undefined ? {} : { since: cursor, wait: 10 }) }),
        signal,
      });
      const resolution = await response.json() as InputResolution;
      if (!resolution.ok) throw new Error(resolution.error.message);
      if (resolution.kind !== "ROOM") throw new Error("Unexpected room response.");
      if (signal.aborted || readRevision.current !== requestRevision) return { ok: false };

      const incoming = buildRoomConversation(resolution.value.report.messages);
      const current = messagesRef.current;
      const currentKeys = new Set(current.map(messageKey));
      const incomingKeys = new Set(incoming.map(messageKey));
      const merged = cursor === undefined
        ? incoming
        : [...incoming, ...current.filter((message) => !incomingKeys.has(messageKey(message)))].slice(0, 200);

      if (selectedRoomReadRef.current && !followNewest.current && incoming.some((message) => !currentKeys.has(messageKey(message)))) {
        const viewport = conversationViewport.current;
        const rendered = [...current].reverse();
        const nodes = viewport ? [...viewport.querySelectorAll<HTMLElement>(".chat-message")] : [];
        const anchorIndex = viewport ? nodes.findIndex((node) => node.getBoundingClientRect().bottom > viewport.getBoundingClientRect().top) : -1;
        const anchor = anchorIndex >= 0 ? nodes[anchorIndex] : undefined;
        const anchorMessage = anchorIndex >= 0 ? rendered[anchorIndex] : undefined;
        if (viewport && anchor && anchorMessage) pendingScrollAnchor.current = { key: messageKey(anchorMessage), offset: anchor.getBoundingClientRect().top - viewport.getBoundingClientRect().top };
        setNewMessageCount((count) => count + incoming.filter((message) => !currentKeys.has(messageKey(message))).length);
      }

      messagesRef.current = merged;
      setMessages(merged);
      setOptimisticMessages((pending) => pending.filter((item) => !item.prepared || !merged.some((message) =>
        message.verdict === "VALID" && message.writer === item.prepared!.did && message.nonce === item.prepared!.nonce &&
        message.signature === item.prepared!.signature && message.text === item.prepared!.text,
      )));
      selectedRoomReadRef.current = true;
      setSelectedRoomRead(true);
      const lastSeq = resolution.value.serverMetadata.find((field) => field.name === "last_seq")?.value;
      const appendedCount = cursor === undefined ? incoming.length : incoming.filter((message) => !currentKeys.has(messageKey(message))).length;
      return { ok: true, recordCount: appendedCount, ...(typeof lastSeq === "string" ? { cursor: lastSeq } : {}) };
    } catch (cause) {
      if (!signal.aborted && readRevision.current === requestRevision) setConversationError(errorText(cause, reason === "INITIAL" ? "Room conversation could not be loaded." : "Live room read unavailable. Reconnecting safely."));
      return { ok: false };
    }
  }

  function selectRoom(room: string): void {
    resetConversationScroll.current = true; followNewest.current = true; pendingScrollAnchor.current = undefined;
    messagesRef.current = []; selectedRoomReadRef.current = false;
    setNewMessageCount(0); setConversationError(undefined); setSelectedRoom(room); setSelectedRoomRead(false);
    setMessages([]); setOptimisticMessages([]); setText(""); setMobileConversation(true); setRoomsPanelOpen(false);
    liveSession.current?.select(room);
    requestAnimationFrame(() => conversationViewport.current?.focus());
  }

  function openExactRoom(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    try {
      const room = validateRoomName(exactRoom);
      setExactRoomError(undefined);
      selectRoom(room);
    } catch {
      setExactRoomError("Enter a valid Technocore room name.");
    }
  }

  function backToRooms(): void {
    liveSession.current?.stop(); readRevision.current += 1; followNewest.current = true;
    messagesRef.current = []; selectedRoomReadRef.current = false; pendingScrollAnchor.current = undefined;
    setNewMessageCount(0); setSelectedRoom(undefined); setSelectedRoomRead(false); setMessages([]);
    setOptimisticMessages([]); setText(""); setConversationError(undefined); setMobileConversation(false);
  }

  useEffect(() => { readRoomRef.current = readRoom; });
  useEffect(() => { if (roomsPanelOpen) roomsPanelClose.current?.focus(); }, [roomsPanelOpen]);
  useEffect(() => {
    const session = new SelectedRoomLiveSession((room, cursor, signal, reason) => readRoomRef.current(room, cursor, signal, reason), setConversationBusy);
    liveSession.current = session;
    const visibility = () => session.setVisible(document.visibilityState === "visible");
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); session.dispose(); readRevision.current += 1; };
  }, []);

  useLayoutEffect(() => {
    const viewport = conversationViewport.current;
    if (!viewport || !selectedRoomRead) return;
    if (resetConversationScroll.current || followNewest.current) {
      viewport.scrollTop = viewport.scrollHeight; resetConversationScroll.current = false; followNewest.current = true; setNewMessageCount(0);
    } else if (pendingScrollAnchor.current) {
      const rendered = [...messages].reverse();
      const index = rendered.findIndex((message) => messageKey(message) === pendingScrollAnchor.current?.key);
      const anchor = index >= 0 ? viewport.querySelectorAll<HTMLElement>(".chat-message")[index] : undefined;
      if (anchor) viewport.scrollTop += anchor.getBoundingClientRect().top - viewport.getBoundingClientRect().top - pendingScrollAnchor.current.offset;
      pendingScrollAnchor.current = undefined;
    }
  }, [messages, selectedRoomRead]);

  function trackConversationScroll(): void {
    const viewport = conversationViewport.current;
    if (!viewport) return;
    followNewest.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 80;
    if (followNewest.current) setNewMessageCount(0);
  }
  function showNewestMessages(): void {
    const viewport = conversationViewport.current;
    if (!viewport) return;
    followNewest.current = true; setNewMessageCount(0); viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" });
  }
  function editMessage(value: string): void {
    setText(value);
    requestAnimationFrame(() => { if (composer.current) { composer.current.style.height = "44px"; composer.current.style.height = `${Math.min(composer.current.scrollHeight, 92)}px`; } });
  }

  async function sendMessage(): Promise<void> {
    if (!activeIdentity || !eligible || !selectedRoom || !text.trim() || operation.current !== undefined) return;
    const room = selectedRoom, draft = text, id = ++optimisticId.current;
    setText("");
    setOptimisticMessages((current) => [...current, { id, room, text: draft, status: "SENDING" }]);
    requestAnimationFrame(() => { if (composer.current) { composer.current.style.height = "44px"; composer.current.focus(); } });
    try {
      const signed = await activeIdentity.prepareSignedMessage({ room, text: draft, highestObservedNonce: highestObservedNonceForDid(messagesRef.current, activeIdentity.publicIdentity.did) }, reservations);
      setOptimisticMessages((current) => current.map((item) => item.id === id ? { ...item, text: signed.text, prepared: signed } : item));
      const result = await publishPreparedMessage(signed, attempts);
      setOptimisticMessages((current) => current.map((item) => item.id === id ? { ...item, status: result.state } : item));
      liveSession.current?.restart();
    } catch {
      setOptimisticMessages((current) => current.map((item) => item.id === id ? { ...item, status: "FAILED_OPERATIONAL" } : item));
    } finally { requestAnimationFrame(() => composer.current?.focus()); }
  }
  function composerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }
  function addEvidence(room: string, message: RoomConversationMessage): void {
    const entry = createRoomObservedEvidence(room, message); onEvidenceObserved(entry);
    setAddedEvidence((current) => new Set(current).add(entry.id));
  }

  return <section className={`flow-page rooms-chat${mobileConversation ? " mobile-conversation" : ""}${selectedRoom ? " has-selected-room" : ""}${roomsPanelOpen ? " rooms-panel-open" : ""}`} aria-labelledby="rooms-chat-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Workbench</button>
    <div className="flow-heading rooms-heading"><div><div className="eyebrow">Rooms</div><h1 id="rooms-chat-title">Public conversations</h1><p className="lede">Choose a room, then follow its live retained stream.</p></div></div>
    <div className="rooms-layout">
      <aside className="rooms-sidebar" aria-label="Public rooms">
        <div className="rooms-list-heading"><div><strong>Public Rooms</strong><small>Bounded · untrusted</small></div><div className="rooms-list-actions"><button className="rooms-panel-close" ref={roomsPanelClose} type="button" onClick={() => setRoomsPanelOpen(false)}>Close</button><button className="tertiary" type="button" onClick={() => void discoverRooms()} disabled={busy !== undefined}>{rooms === undefined ? "Load rooms" : "Refresh rooms"}</button></div></div>
        <form className="exact-room-entry" onSubmit={openExactRoom} noValidate>
          <label htmlFor="exact-room-name">Open room by exact name</label>
          <div><input id="exact-room-name" name="room" placeholder="room-name" value={exactRoom} onChange={(event) => { setExactRoom(event.target.value); setExactRoomError(undefined); }} aria-invalid={exactRoomError ? "true" : undefined} aria-describedby={exactRoomError ? "exact-room-error" : undefined} /><button className="secondary" type="submit" disabled={busy !== undefined}>Open Room</button></div>
          {exactRoomError && <small id="exact-room-error" className="field-error" role="alert">{exactRoomError}</small>}
          {selectedRoom === exactRoom && <small className="exact-room-selected" role="status">Selected: # {selectedRoom}</small>}
        </form>
        {busy === "discover" && <p className="rooms-state" role="status">Loading public rooms…</p>}
        {discoveryError && <div className="rooms-state operational-error" role="alert"><strong>Public rooms unavailable</strong><span>{discoveryError}</span><button className="secondary" type="button" onClick={() => void discoverRooms()} disabled={busy !== undefined}>Try Again</button></div>}
        {!discoveryError && rooms?.length === 0 && <p className="rooms-state">No public rooms were observed in this bounded response.</p>}
        <div className="room-choices">{orderedRooms.map((item) => <button key={item.room} type="button" title={`#${item.room}`} aria-current={item.room === selectedRoom ? "true" : undefined} className={item.room === selectedRoom ? "room-choice selected" : "room-choice"} onClick={() => selectRoom(item.room)} disabled={busy !== undefined}><span className="room-choice-title"><strong># {item.room}</strong><span className="room-choice-badges">{item.room === "lobby" && <em>Recommended</em>}{item.room === selectedRoom && <em>Selected</em>}</span></span></button>)}</div>
        {!discoveredLobby && <button className="direct-room-choice" type="button" aria-label="Open lobby →" onClick={() => selectRoom("lobby")} disabled={busy !== undefined}><strong># lobby</strong><span>Open fixed public room</span></button>}
      </aside>
      <section className="conversation">
        {!selectedRoom && <div className="conversation-empty"><div className="eyebrow">Live room</div><h2>Choose a room</h2><p>Select a public room to open its chat stream.</p><small>No room is read and no composer is shown until you choose one.</small></div>}
        {selectedRoom && <>
          <div className="conversation-heading"><button className="mobile-room-back" type="button" onClick={backToRooms}>← Back to rooms</button><button className="rooms-panel-toggle" type="button" aria-expanded={roomsPanelOpen} onClick={() => setRoomsPanelOpen(true)}>Rooms</button><div className="conversation-room-title"><h2 className="break-anywhere"># {selectedRoom}</h2><p><span className="live-dot" aria-hidden="true" />Live · retained window</p></div><button className="tertiary" type="button" onClick={() => liveSession.current?.restart()} disabled={conversationBusy}>{conversationError ? "Retry live read" : "Refresh conversation"}</button></div>
          <div className="conversation-viewport" ref={conversationViewport} onScroll={trackConversationScroll} tabIndex={0} aria-label={`Live retained conversation in ${selectedRoom}`}>
            <p className="rooms-limitation">Retained data is not complete history. Room topics and messages are untrusted.</p>
            {conversationError && <div className="rooms-state operational-error" role="status"><strong>Live read unavailable</strong><span>{conversationError}</span><small>The last successful view is preserved; reconnecting does not change an evidence verdict.</small></div>}
            {conversationBusy && !selectedRoomRead && <div className="state-card">Loading retained messages…</div>}
            {selectedRoomRead && messages.length === 0 && <div className="state-card"><strong>Nothing observed yet.</strong><span>Retained data does not establish complete history.</span></div>}
            <div className="message-list">{[...messages].reverse().map((message) => <RoomMessageRow key={messageKey(message)} room={selectedRoom} message={message} added={addedEvidence.has(createRoomObservedEvidence(selectedRoom, message).id)} onInspect={onInspectMessage} onAdd={addEvidence} />)}{optimisticMessages.filter((item) => item.room === selectedRoom).map((item) => <article className="chat-message optimistic-message" key={`optimistic-${item.id}`}><span className="chat-sequence">pending</span><strong className="chat-author">{item.prepared ? `${item.prepared.did.slice(8, 12)}…${item.prepared.did.slice(-4)}` : "local"}</strong><p className="prewrap break-anywhere message-content">{item.text}</p><span className="chat-verdict">{item.status === "SENDING" ? "sending…" : item.status === "RESPONSE_RECEIVED" ? "awaiting observation" : item.status === "OUTCOME_UNKNOWN" ? "outcome unknown" : "send unavailable"}</span><span className="chat-time">now</span></article>)}</div>
            {newMessageCount > 0 && <button className="new-messages" type="button" onClick={showNewestMessages}>↓ {newMessageCount > 99 ? "99+" : newMessageCount} new {newMessageCount === 1 ? "message" : "messages"}</button>}
          </div>
          <section className={`composer${!activeIdentity ? " composer-read-only" : !eligible ? " composer-locked" : " composer-ready composer-default"}`} aria-labelledby="composer-title">
            {!activeIdentity ? <><div><div className="eyebrow">Composer unavailable</div><h2 id="composer-title">Read-only conversation</h2></div><button className="primary" type="button" onClick={onCreateOrImport}>Create or Restore Agent →</button></>
              : !eligible ? <><div><div className="eyebrow">Backup required</div><h2 id="composer-title">Composer locked</h2></div><button className="primary" type="button" onClick={onSecureBackup}>Secure Backup →</button></>
              : <><label><span>Message</span><textarea ref={composer} aria-label="Room message" placeholder={`Message #${selectedRoom}…`} rows={1} value={text} onChange={(event) => editMessage(event.target.value)} onKeyDown={composerKeyDown} /></label><button className="primary" type="button" disabled={!text.trim() || busy !== undefined} onClick={() => void sendMessage()}>Send</button><span className="composer-count" aria-live="polite">{Array.from(text).length} {Array.from(text).length === 1 ? "character" : "characters"}</span></>}
          </section>
        </>}
      </section>
    </div>
  </section>;
}

function RoomMessageRow({ room, message, added, onInspect, onAdd }: { readonly room: string; readonly message: RoomConversationMessage; readonly added: boolean; readonly onInspect: (room: string, sequence: string) => void; readonly onAdd: (room: string, message: RoomConversationMessage) => void }) {
  const shortWriter = message.writerKind === "SIGNED_DID_KEY" ? `${message.writer.slice(8, 12)}…${message.writer.slice(-4)}` : `~${message.writer}`;
  return <article className="chat-message">
    <span className="chat-sequence">{message.sequence ? `#${message.sequence}` : "—"}</span>
    <strong className="chat-author" title={message.writer}>{shortWriter}</strong>
    <p className="prewrap break-anywhere message-content">{message.text}</p>
    <span className={`chat-verdict verdict-${message.verdict.toLowerCase()}`} aria-label={`Cryptographic verdict ${message.verdict}`}>{message.verdict === "VALID" ? "✓" : message.verdict}</span>
    <time className="chat-time" dateTime={message.timestamp} title={message.timestamp}>{relativeTime(message.timestamp)}</time>
    <details className="message-details"><summary aria-label={`Open details for message ${message.sequence ?? "without sequence"}`}>•••</summary><div className="message-details-panel"><dl><dt>Full DID / author</dt><dd className="mono break-anywhere">{message.writer}</dd><dt>Sequence</dt><dd>{message.sequence ?? "Not observed"}</dd><dt>Timestamp</dt><dd>{message.timestamp ?? "Not present"}</dd><dt>Nonce</dt><dd className="mono break-anywhere">{message.nonce ?? "Not present"}</dd><dt>Signature</dt><dd className="mono break-anywhere">{message.signature ?? "Not present"}</dd><dt>Cryptographic verdict</dt><dd>{message.verdict}</dd></dl><p className="key-control-note">A VALID signature proves key control for this exact payload only, not identity, trust, payment, rewards, or settlement.</p><div className="message-actions">{message.sequence && <button className="tertiary" type="button" onClick={() => onInspect(room, message.sequence!)}>Inspect message</button>}<button className="tertiary" type="button" disabled={added} onClick={() => onAdd(room, message)}>{added ? "Added to Evidence" : "Add to Evidence"}</button></div></div></details>
  </article>;
}
