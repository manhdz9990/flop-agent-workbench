import type { ReactNode } from "react";

import { getDiagnosticCopy, getDiagnosticStageLabel, type VerificationPipeline } from "../lib/diagnostics";

type Verdict = VerificationPipeline["evidenceVerdict"];

const verdictIcon = (verdict: Verdict): string => verdict === "VALID" ? "✓" : verdict === "INVALID" ? "×" : verdict === "UNSIGNED" || verdict === "UNVERIFIABLE" ? "!" : "—";
const statusIcon = (status: VerificationPipeline["stages"][number]["status"]): string => status === "PASS" ? "✓" : status === "FAIL" ? "×" : status === "UNAVAILABLE" ? "!" : "—";

export function verificationMeaning(verdict: Verdict): string {
  if (verdict === "VALID") return "The available signed evidence verifies successfully. This establishes key control for the exact evidence only, not identity, truth, or trust.";
  if (verdict === "INVALID") return "Ed25519 verification ran with usable key, canonical payload, and signature evidence and returned false.";
  if (verdict === "UNSIGNED") return "No supported signature evidence is present for this record.";
  if (verdict === "UNVERIFIABLE") return "The record claims or contains signing evidence, but the available evidence is insufficient to complete verification. UNVERIFIABLE is not INVALID.";
  return "This inspection does not produce a message cryptographic evidence verdict.";
}

export function VerificationOverview({ pipeline }: { readonly pipeline: VerificationPipeline }) {
  const boundary = pipeline.firstFailedBoundary ?? pipeline.firstUnavailableBoundary;
  const boundaryCopy = boundary ? getDiagnosticCopy(boundary.stage, boundary.status) : undefined;
  const boundaryNumber = boundary ? pipeline.stages.findIndex((stage) => stage.stage === boundary.stage) + 1 : undefined;
  const verdict = pipeline.evidenceVerdict;

  return <div className="verification-overview">
    <section className={`verification-conclusion verdict-hero verdict-${verdict?.toLowerCase() ?? "none"}`} aria-labelledby="verification-result-title">
      <div className="eyebrow">Verification Result</div>
      <h2 id="verification-result-title"><span aria-hidden="true">{verdictIcon(verdict)}</span> {verdict ?? "NO MESSAGE VERDICT"}</h2>
      <p>{verificationMeaning(verdict)}</p>
    </section>
    {boundary && boundaryCopy && <section className="boundary-focus result-boundary" aria-labelledby="boundary-title">
      <div className="eyebrow">{boundary.status === "FAIL" ? "First failed boundary" : "First unavailable boundary"}</div>
      <div className="boundary-heading"><h2 id="boundary-title"><span className="mono">{String(boundaryNumber).padStart(2, "0")}</span> — {getDiagnosticStageLabel(boundary.stage)}</h2><strong className={`status status-${boundary.status.toLowerCase()}`}>{statusIcon(boundary.status)} {boundary.status}</strong></div>
      {boundary.detail && <p className="boundary-observation">{boundary.detail}</p>}
      <div className="result-guidance"><div><span>What it means</span><p>{boundaryCopy.whatThisMeans}</p></div><div><span>Check next</span><p>{boundaryCopy.checkNext}</p></div></div>
    </section>}
    {!boundary && <section className="no-boundary"><span aria-hidden="true">✓</span><div><strong>No failed or unavailable boundary</strong><p>The available stage results did not expose a failed or unavailable boundary.</p></div></section>}
  </div>;
}

export function VerificationStages({ pipeline }: { readonly pipeline: VerificationPipeline }) {
  return <section className="verification-stages stages" aria-labelledby="stages-title">
    <div className="pipeline-heading"><div><div className="eyebrow">Detailed verification pipeline</div><h2 id="stages-title">12 deterministic stages</h2></div><p>Select a stage to inspect its existing deterministic guidance and observation.</p></div>
    <ol>{pipeline.stages.map((stage, index) => <li key={stage.stage}><details className="stage-disclosure stage"><summary><span className={`stage-symbol status-${stage.status.toLowerCase()}`} aria-hidden="true">{statusIcon(stage.status)}</span><span className="stage-number">{String(index + 1).padStart(2, "0")}</span><strong>{getDiagnosticStageLabel(stage.stage)}</strong><span className={`status status-${stage.status.toLowerCase()}`}>{stage.status}</span></summary><div className="stage-detail"><p><b>What this means:</b> {stage.whatThisMeans}</p><p><b>Check next:</b> {stage.checkNext}</p>{stage.detail && <p className="technical-observation"><b>Observed:</b> {stage.detail}</p>}</div></details></li>)}</ol>
  </section>;
}

export function TechnicalEvidence({ children, label = "Technical Evidence" }: { readonly children: ReactNode; readonly label?: string }) {
  return <details className="technical-evidence"><summary>{label}</summary><div>{children}</div></details>;
}
