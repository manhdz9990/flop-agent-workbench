"use client";

import { useMemo, useState } from "react";

import type { EvidenceActivityEntry } from "../lib/evidence-activity";
import { createReceiptDownload, downloadReceiptLocally, serializeEvidenceReceiptMarkdown } from "../lib/receipt";
import { TechnicalEvidence } from "./verification-result";

interface EvidenceWorkspaceProps {
  readonly entries: readonly EvidenceActivityEntry[];
  readonly activeDid?: string;
  readonly onBack: () => void;
  readonly onRooms: () => void;
  readonly onInspectMessage: (room: string, sequence: string) => void;
}

export function EvidenceWorkspace({ entries, activeDid, onBack, onRooms, onInspectMessage }: EvidenceWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const receiptMarkdown = useMemo(() => selected?.receipt ? serializeEvidenceReceiptMarkdown(selected.receipt) : undefined, [selected]);

  return <section className="flow-page evidence-workspace" aria-labelledby="evidence-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Workbench</button>
    <div className="eyebrow">Evidence</div><h1 id="evidence-title">Observed Evidence</h1>
    <p className="lede">Evidence explicitly observed during this Workbench runtime. This is not durable account history, complete activity, contribution credit, rewards, eligibility, reputation, or a trust score.</p>
    {entries.length === 0 ? <section className="evidence-empty"><div className="eyebrow">This runtime</div><h2>No evidence has been added</h2><p>Evidence is intentionally explicit. Inspect a public room message and choose Add to Evidence, or independently verify an exact published record.</p><button className="primary" type="button" onClick={onRooms}>Open Rooms →</button><small>Nothing is collected automatically or stored as account history.</small></section> : <div className="evidence-layout">
      <aside className="evidence-list" aria-label="Observed evidence entries">{entries.map((entry) => <button type="button" key={entry.id} className={entry.id === selected?.id ? "evidence-choice selected" : "evidence-choice"} onClick={() => setSelectedId(entry.id)}><strong><span aria-hidden="true">{entry.verdict === "VALID" ? "✓" : entry.verdict === "INVALID" ? "×" : "!"}</span> {entry.verdict}</strong><span className="break-anywhere">{entry.room}{entry.sequence ? ` · sequence ${entry.sequence}` : ""}</span><small>{entry.source === "READBACK_VERIFIED" ? "Exact read-back verified" : "Explicitly saved room observation"}</small></button>)}</aside>
      {selected && <article className="evidence-detail" aria-labelledby="evidence-detail-title"><section className={`evidence-entry-conclusion verdict-${selected.verdict.toLowerCase()}`}><div className="eyebrow">Evidence Result</div><h2 id="evidence-detail-title"><span aria-hidden="true">{selected.verdict === "VALID" ? "✓" : selected.verdict === "INVALID" ? "×" : "!"}</span> {selected.verdict}</h2><p>{selected.source === "READBACK_VERIFIED" ? "Exact published record read-back" : "Explicitly saved public room observation"}</p><strong className="break-anywhere">{selected.room}{selected.sequence ? ` · sequence ${selected.sequence}` : ""}</strong></section><div className="evidence-actions">{selected.sequence && <button className="primary" type="button" onClick={() => onInspectMessage(selected.room, selected.sequence!)}>Inspect Diagnostics →</button>}{selected.receipt && <button className="secondary" type="button" onClick={() => downloadReceiptLocally(createReceiptDownload(selected.receipt!, "markdown"))}>Download Evidence Receipt</button>}</div><TechnicalEvidence label="Observed Evidence Details"><dl className="evidence-review"><dt>Observation</dt><dd>{selected.observationState === "PUBLISHED_AND_VERIFIED" ? "Published record observed and independently verified" : "Observed public room evidence"}</dd><dt>Room</dt><dd className="break-anywhere">{selected.room}</dd>{selected.sequence && <><dt>Sequence</dt><dd>{selected.sequence} · server-assigned, not signed evidence</dd></>}<dt>Observed writer</dt><dd className="mono break-anywhere">{selected.writer}</dd>{selected.nonce && <><dt>Nonce</dt><dd className="mono break-anywhere">{selected.nonce}</dd></>}<dt>Observed text</dt><dd className="prewrap break-anywhere">{selected.text}</dd><dt>Agent association</dt><dd>{activeDid !== undefined && selected.writer === activeDid ? "Associated with the currently active public DID." : "Not asserted as activity of the currently active Agent."}</dd></dl></TechnicalEvidence><p className="privacy-note">A signature can prove key control for its exact evidence only. It does not prove real-world identity or trustworthiness.</p>{selected.receipt && receiptMarkdown ? <section className="receipt-inline"><h3>Evidence Receipt</h3><p>This receipt records observed protocol evidence. It does not establish real-world identity, trustworthiness, payment, settlement, rewards, or eligibility.</p><TechnicalEvidence label="Receipt Preview"><pre aria-label="Evidence workspace receipt">{receiptMarkdown}</pre></TechnicalEvidence></section> : <p className="privacy-note">Open existing diagnostics to create a receipt where that evidence flow supports one.</p>}</article>}
    </div>}
  </section>;
}
