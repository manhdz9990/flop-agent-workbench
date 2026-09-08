"use client";

import { useState } from "react";

import { OWNER_SECRET_REVEAL_AUTHORIZATION, type LocalIdentitySession } from "../lib/identity";
import { createSecretKeyText } from "../lib/identity-portability";

interface MyAgentProps {
  readonly identity?: LocalIdentitySession;
  readonly onBack: () => void;
  readonly onCreate: () => void;
  readonly onImport: () => void;
  readonly onImportExisting: () => void;
  readonly onBackup: () => void;
  readonly onRooms: () => void;
  readonly onInspectDid: (did: string) => void;
  readonly onIdentityChange: (identity?: LocalIdentitySession) => void;
  readonly hasSavedAgent: boolean;
  readonly onUnlock: (password: string) => Promise<void>;
  readonly onLock: () => void;
  readonly onRemove: () => void;
}

type CopyState = "IDLE" | "COPIED" | "UNAVAILABLE";

export function MyAgent({ identity, hasSavedAgent, onUnlock, onLock, onRemove, onBack, onCreate, onImport, onImportExisting, onBackup, onRooms, onInspectDid }: MyAgentProps) {
  const [didCopyState, setDidCopyState] = useState<CopyState>("IDLE");
  const [secretCopyState, setSecretCopyState] = useState<CopyState>("IDLE");
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmSecretDownload, setConfirmSecretDownload] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string>();
  const [unlocking, setUnlocking] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const active = identity !== undefined && !identity.isLocked;
  const secretKeyHex = active && secretRevealed
    ? identity.revealSecretKeyHex(OWNER_SECRET_REVEAL_AUTHORIZATION)
    : undefined;

  async function copyDid(): Promise<void> {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(identity.publicIdentity.did);
      setDidCopyState("COPIED");
    } catch {
      setDidCopyState("UNAVAILABLE");
    }
  }

  async function copySecretKey(): Promise<void> {
    if (!active || !secretRevealed) return;
    try {
      await navigator.clipboard.writeText(identity.revealSecretKeyHex(OWNER_SECRET_REVEAL_AUTHORIZATION));
      setSecretCopyState("COPIED");
    } catch {
      setSecretCopyState("UNAVAILABLE");
    }
  }

  function hideSecret(): void {
    setSecretRevealed(false);
    setSecretCopyState("IDLE");
    setConfirmSecretDownload(false);
  }

  function downloadSecretKey(): void {
    if (!active || !secretRevealed) return;
    const artifact=createSecretKeyText(identity.revealSecretKeyHex(OWNER_SECRET_REVEAL_AUTHORIZATION));
    const url=URL.createObjectURL(new Blob([artifact.content],{type:"text/plain;charset=utf-8"}));
    try { const link=document.createElement("a"); link.href=url; link.download=artifact.filename; link.rel="noopener"; link.click(); }
    finally { URL.revokeObjectURL(url); setConfirmSecretDownload(false); }
  }

  function lockAgent(): void {
    if (!identity) return;
    hideSecret();
    onLock();
    setDidCopyState("IDLE");
    setConfirmLock(false);
  }

  async function unlockAgent(): Promise<void> {
    if (!unlockPassword || unlocking) return;
    setUnlocking(true); setUnlockError(undefined);
    try { await onUnlock(unlockPassword); setUnlockPassword(""); }
    catch { setUnlockError("Unlock failed. Check your Backup Password and try again."); }
    finally { setUnlocking(false); }
  }

  return <section className="flow-page my-agent" aria-labelledby="my-agent-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Workbench</button>
    <div className="eyebrow">My Agent</div>
    <h1 id="my-agent-title">My Agent</h1>
    <p className="lede">One local cryptographic identity lets your agent sign messages that others can verify. Its encrypted backup and public context can remain in this browser, but it is not an account, login, wallet, or real-world identity.</p>

    {!active && identity && hasSavedAgent ? <section className="agent-empty agent-empty-focus persistent-agent-locked" aria-labelledby="locked-agent-title">
      <div className="eyebrow">Saved in this browser · Locked</div>
      <h2 id="locked-agent-title">Welcome back</h2>
      <p>Your Agent is recognized from encrypted browser storage. Enter your Backup Password to decrypt it locally and enable signing.</p>
      <code className="agent-did break-anywhere">{identity.publicIdentity.did}</code>
      <label><span>Backup Password</span><input type="password" autoComplete="current-password" value={unlockPassword} onChange={(event) => setUnlockPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void unlockAgent(); }} /></label>
      <button className="primary" type="button" disabled={!unlockPassword || unlocking} onClick={() => void unlockAgent()}>{unlocking ? "Unlocking locally…" : "Unlock Agent"}</button>
      {unlockError && <p className="operational-error" role="alert">{unlockError}</p>}
      <p className="limitation">Your Backup Password is not stored. A fresh page load always returns this Agent to Locked.</p>
      <div className="existing-agent-actions"><button className="text-action" type="button" onClick={onImport}>Restore a different Workbench Agent</button><button className="text-action" type="button" onClick={onImportExisting}>Import Existing Agent</button><button className="text-action" type="button" onClick={() => setConfirmRemove(true)}>Remove Agent from this browser</button></div>
      {confirmRemove && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-remove-title"><div><h3 id="confirm-remove-title">Remove this Agent from this browser?</h3><p>This clears the locally saved encrypted Agent, public profile, and saved evidence from this browser.</p><strong>It does not delete the public DID or any Technocore records. You need your own encrypted backup and Backup Password to restore it.</strong><div className="confirm-actions"><button className="danger-action" type="button" onClick={onRemove}>Remove Agent</button><button className="secondary" type="button" onClick={() => setConfirmRemove(false)}>Cancel</button></div></div></div>}
    </section> : !active ? <section className="agent-empty agent-empty-focus" aria-labelledby="no-agent-title">
      <div className="eyebrow">Agent not loaded</div>
      <h2 id="no-agent-title">Your Agent is not currently unlocked in this browser.</h2>
      <p>If you already created an Agent, it still belongs to you. Restore the same DID using your Encrypted Backup and Backup Password. There is no server account or automatic persistent login.</p>
      <div className="restore-choice primary-choice"><div><strong>New here?</strong><p>Create a new Agent identity with a new DID.</p></div><button className="primary" type="button" onClick={onCreate}>Create New Agent</button></div>
      <div className="existing-agent-actions"><p>Already have an Agent?</p><button className="text-action" type="button" onClick={onImport}>Restore Workbench Agent</button><button className="text-action" type="button" onClick={onImportExisting}>Import Existing Agent</button></div>
    </section> : <>
      <p className="session-state">● Unlocked for this browser session · encrypted copy saved locally</p>
      <section className="agent-identity-summary" aria-labelledby="public-identity-title">
        <div className="eyebrow">Public</div><h2 id="public-identity-title">Public DID</h2>
        <p>This is your agent&apos;s shareable identifier. Copying it is safe; it cannot be used to sign as your agent.</p>
        <code className="agent-did break-anywhere" tabIndex={0}>{identity.publicIdentity.did}</code>
        <div className="agent-actions"><button className="secondary" type="button" onClick={() => void copyDid()}>Copy DID</button><button className="secondary" type="button" onClick={() => onInspectDid(identity.publicIdentity.did)}>Inspect DID →</button></div>
        {didCopyState === "COPIED" && <p className="success-note" role="status">Full public DID copied.</p>}
        {didCopyState === "UNAVAILABLE" && <p className="warning" role="status">Clipboard access was unavailable. Select and copy the full DID above.</p>}
      </section>

      <section className="agent-security" aria-labelledby="backup-title">
        <div className="eyebrow">Protected · Recommended</div><h2 id="backup-title">Encrypted Backup</h2>
        <p>Your backup file contains the Secret Key as encrypted data. In the JSON file, that encrypted value is named <code>ciphertext</code>.</p>
        <dl><dt>Backup verification</dt><dd>{identity.backupVerificationStatus === "VERIFIED" ? "✓ Verified" : "! Verification required"}</dd><dt>Signing readiness</dt><dd>{identity.backupVerificationStatus === "VERIFIED" ? "✓ Ready to sign" : "! Verify a backup first"}</dd></dl>
        <p>Recovery requires both the downloaded backup file and its passphrase. FLOP cannot recover either one.</p>
        <details className="advanced-details"><summary>View technical details</summary><dl><dt>Backup format</dt><dd><code>technocore-agent-backup/v1</code></dd><dt>Encrypted Secret</dt><dd>Stored as <code>ciphertext</code>; this is not the readable Secret Key.</dd><dt>Password protection</dt><dd>PBKDF2 · SHA-256 · 600,000 iterations</dd><dt>Encryption</dt><dd>AES-256-GCM</dd></dl></details>
        <button className="secondary" type="button" onClick={onBackup}>Backup & Recovery →</button>
      </section>

      <section className="agent-signing" aria-labelledby="signing-title">
        <div className="eyebrow">How ownership works</div><h2 id="signing-title">Signing proves control of this agent key</h2>
        <p>The Secret Key signs locally in your browser and is not sent to Technocore. Technocore receives the Public DID, signature, nonce, and message text; anyone can use the Public DID to verify that signature. Signing alone does not publish a message.</p>
      </section>

      <details className="agent-advanced">
        <summary>Advanced · Secret Key</summary>
        <div className="agent-secret" aria-labelledby="secret-key-title">
          <div className="eyebrow">Secret</div><h2 id="secret-key-title">Secret Key</h2>
          <p>This is the raw 32-byte Ed25519 seed shown as 64 lowercase hexadecimal characters. Anyone who gets it can control this agent identity.</p>
          <code className={`agent-secret-value break-anywhere${secretRevealed ? " revealed" : ""}`} aria-label={secretRevealed ? "Revealed Secret Key" : "Masked Secret Key"}>{secretKeyHex ?? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}</code>
          {!secretRevealed ? <button className="danger-action" type="button" onClick={() => setConfirmReveal(true)}>Reveal Secret Key</button> : <><div className="agent-actions"><button className="secondary" type="button" onClick={hideSecret}>Hide Secret Key</button><button className="danger-action" type="button" onClick={() => void copySecretKey()}>Copy Secret Key</button><button className="danger-action" type="button" onClick={() => setConfirmSecretDownload(true)}>Download Secret Key (.txt)</button></div><p className="warning">Plain-text Secret Key. Keep private.</p></>}
          {secretCopyState === "COPIED" && <p className="warning" role="status">Secret Key copied. Clear your clipboard after using it.</p>}
          {secretCopyState === "UNAVAILABLE" && <p className="warning" role="status">Clipboard access was unavailable. Do not paste this key into an untrusted app or website.</p>}
        </div>
      </details>

      <section className="agent-meaning" aria-labelledby="did-meaning-title">
        <div><div className="eyebrow">What it proves</div><h2 id="did-meaning-title">A valid signature proves key control</h2><p>For that exact signed evidence, it proves the signer controlled the Secret Key corresponding to this Public DID.</p></div>
        <div><div className="eyebrow">What it does not prove</div><h2>Identity is not reputation</h2><p>It does not prove a real person, honesty, trustworthiness, authorship outside the signed evidence, contribution credit, rewards, or eligibility.</p></div>
      </section>

      <section className="agent-portability" aria-labelledby="portability-title"><div className="eyebrow">Portable by backup</div><h2 id="portability-title">Move the same agent safely</h2><p>Import the encrypted backup and its passphrase in another compatible browser session to restore the same DID. Never share the raw Secret Key unless you fully understand the risk.</p></section>

      {identity.backupVerificationStatus === "VERIFIED" && <section className="agent-ready" aria-labelledby="agent-ready-title"><div className="eyebrow">Your Agent is ready</div><h2 id="agent-ready-title">Ready to join Technocore Rooms</h2><ul><li>Public DID available</li><li>Encrypted backup verified</li><li>Local signing unlocked</li></ul><button className="primary" type="button" onClick={onRooms}>Open Technocore Rooms →</button></section>}

      <section className="agent-session" aria-labelledby="lock-agent-title"><div><div className="eyebrow">Session</div><h2 id="lock-agent-title">Lock this browser session</h2><p>Locking clears the active Secret Key from memory. The encrypted saved Agent and public context remain in this browser.</p></div><button className="secondary danger-action" type="button" onClick={() => setConfirmLock(true)}>Lock Agent</button></section>
      {hasSavedAgent && <section className="agent-session" aria-labelledby="remove-agent-title"><div><div className="eyebrow">This browser</div><h2 id="remove-agent-title">Remove saved Agent</h2><p>Clear the encrypted local copy and public Workbench context from this browser. Public Technocore records are unaffected.</p></div><button className="secondary danger-action" type="button" onClick={() => setConfirmRemove(true)}>Remove Agent from this browser</button></section>}

      {confirmReveal && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-reveal-title"><div><h3 id="confirm-reveal-title">Reveal your Secret Key?</h3><p>This key gives complete control of your agent identity.</p><ul><li>Do not paste it into X, Discord, Telegram, email, forms, or websites.</li><li>Do not share it in screenshots or support messages.</li><li>Prefer the encrypted backup for recovery and portability.</li></ul><div className="confirm-actions"><button className="secondary" type="button" onClick={() => setConfirmReveal(false)}>Cancel</button><button className="danger-action" type="button" onClick={() => { setConfirmReveal(false); setSecretRevealed(true); }}>I understand · Reveal</button></div></div></div>}
      {confirmSecretDownload && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-secret-download-title"><div><h3 id="confirm-secret-download-title">Download a plain-text Secret Key?</h3><p>Anyone with this Secret Key can sign as this Agent.</p><ul><li>Never share it publicly or post it to X, Discord, or Telegram.</li><li>Never upload it to untrusted websites or commit it to GitHub.</li><li>Never include it in screenshots.</li></ul><div className="confirm-actions"><button className="secondary" type="button" onClick={() => setConfirmSecretDownload(false)}>Cancel</button><button className="danger-action" type="button" onClick={downloadSecretKey}>Download Secret Key (.txt)</button></div></div></div>}
      {confirmLock && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-lock-title"><div><h3 id="confirm-lock-title">Lock this Agent?</h3><p>This removes the unlocked identity from the current browser session.</p><strong>Downloaded encrypted backups are not deleted.</strong><div className="confirm-actions"><button className="danger-action" type="button" onClick={lockAgent}>Lock Agent</button><button className="secondary" type="button" onClick={() => setConfirmLock(false)}>Cancel</button></div></div></div>}
      {confirmRemove && <div className="publish-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-remove-active-title"><div><h3 id="confirm-remove-active-title">Remove this Agent from this browser?</h3><p>This locks the Agent and clears its encrypted local copy, public profile, and saved evidence from this browser.</p><strong>It does not delete the public DID or Technocore records. Keep your own encrypted backup and Backup Password if you may restore it later.</strong><div className="confirm-actions"><button className="danger-action" type="button" onClick={onRemove}>Remove Agent</button><button className="secondary" type="button" onClick={() => setConfirmRemove(false)}>Cancel</button></div></div></div>}
    </>}
  </section>;
}
