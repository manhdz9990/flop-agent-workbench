"use client";

import { useState } from "react";

import type { LocalIdentitySession } from "../lib/identity";

interface MyAgentProps {
  readonly identity?: LocalIdentitySession;
  readonly onBack: () => void;
  readonly onCreate: () => void;
  readonly onImport: () => void;
  readonly onBackup: () => void;
  readonly onInspectDid: (did: string) => void;
  readonly onIdentityChange: (identity?: LocalIdentitySession) => void;
}

export function MyAgent({ identity, onBack, onCreate, onImport, onBackup, onInspectDid, onIdentityChange }: MyAgentProps) {
  const [copyState, setCopyState] = useState<"IDLE" | "COPIED" | "UNAVAILABLE">("IDLE");
  const [confirmLock, setConfirmLock] = useState(false);
  const active = identity !== undefined && !identity.isLocked;

  async function copyDid(): Promise<void> {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(identity.publicIdentity.did);
      setCopyState("COPIED");
    } catch {
      setCopyState("UNAVAILABLE");
    }
  }

  function lockAgent(): void {
    if (!identity) return;
    identity.lock();
    onIdentityChange(undefined);
    setCopyState("IDLE");
    setConfirmLock(false);
  }

  return <section className="flow-page my-agent" aria-labelledby="my-agent-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Workbench</button>
    <div className="eyebrow">My Agent</div>
    <h1 id="my-agent-title">My Agent</h1>
    <p className="lede">Manage the local identity currently available to this browser session. This is not an account, login, wallet, or persistent profile.</p>

    {!active ? <section className="agent-empty agent-empty-focus" aria-labelledby="no-agent-title">
      <h2 id="no-agent-title">No agent identity is active in this browser session.</h2>
      <p>Create a new local identity or restore one from an encrypted backup. There is no server account to restore.</p>
      <div className="agent-actions"><button className="primary" type="button" onClick={onCreate}>Start your agent →</button><button className="secondary" type="button" onClick={onImport}>Import backup →</button></div>
    </section> : <>
      <p className="session-state">● Active in this browser session</p>
      <section className="agent-identity-summary" aria-labelledby="public-identity-title">
        <div className="eyebrow">Identity Summary</div><h2 id="public-identity-title">Public DID</h2>
        <code className="agent-did break-anywhere" tabIndex={0}>{identity.publicIdentity.did}</code>
        <div className="agent-actions"><button className="secondary" type="button" onClick={() => void copyDid()}>Copy DID</button><button className="secondary" type="button" onClick={() => onInspectDid(identity.publicIdentity.did)}>Inspect DID →</button></div>
        {copyState === "COPIED" && <p className="success-note" role="status">Full public DID copied.</p>}
        {copyState === "UNAVAILABLE" && <p className="warning" role="status">Clipboard access was unavailable. Select and copy the full DID above.</p>}
      </section>
      <section className="agent-security" aria-labelledby="agent-security-title"><div className="eyebrow">Security & Recovery</div><h2 id="agent-security-title">Readiness</h2><dl><dt>Backup status</dt><dd>{identity.backupVerificationStatus === "VERIFIED" ? "✓ Verified" : "! Backup verification required"}</dd><dt>Signing readiness</dt><dd>{identity.backupVerificationStatus === "VERIFIED" ? "✓ Ready to sign" : "! Backup verification required"}</dd></dl><p>Backup status reflects verification only; the Workbench does not track downloaded files.</p><button className="secondary" type="button" onClick={onBackup}>Backup / Recovery →</button></section>
      <section className="agent-session" aria-labelledby="lock-agent-title"><div><div className="eyebrow">Session</div><h2 id="lock-agent-title">Your unlocked identity is session-only.</h2><p>Locking removes the active identity from this browser session. It does not delete downloaded encrypted backups.</p></div><button className="secondary danger-action" type="button" onClick={() => setConfirmLock(true)}>Lock Agent</button></section>
      {confirmLock && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-lock-title"><div><h3 id="confirm-lock-title">Lock this Agent?</h3><p>This removes the unlocked identity from the current browser session.</p><strong>Downloaded encrypted backups are not deleted.</strong><div className="confirm-actions"><button className="danger-action" type="button" onClick={lockAgent}>Lock Agent</button><button className="secondary" type="button" onClick={() => setConfirmLock(false)}>Cancel</button></div></div></div>}
    </>}

    <aside className="safety-panel"><strong>Evidence boundary</strong><p>A did:key or valid signature proves control of the relevant signing key for that evidence only. It does not establish real-world identity, honesty, reputation, trustworthiness, FLOP contribution credit, rewards, or eligibility.</p></aside>
  </section>;
}
