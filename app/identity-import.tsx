"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { detectIdentityFormat, MAX_IDENTITY_FILE_BYTES, validateIdentityImport, type Detection, type ImportedIdentityCandidate } from "../lib/identity-portability";
import type { LocalIdentitySession } from "../lib/identity";

interface IdentityImportProps { readonly onBack: () => void; readonly onRestoreWorkbench: () => void; readonly onConfirm: (identity: LocalIdentitySession) => void }

export function IdentityImport({ onBack, onRestoreWorkbench, onConfirm }: IdentityImportProps) {
  const [serialized, setSerialized] = useState<string>(); const [fileName, setFileName] = useState<string>();
  const [detection, setDetection] = useState<Detection>(); const [password, setPassword] = useState("");
  const [candidate, setCandidate] = useState<ImportedIdentityCandidate>(); const [busy, setBusy] = useState(false); const [error, setError] = useState<string>();
  const accepted = useRef(false);
  useEffect(() => () => { if (!accepted.current) candidate?.session.lock(); }, [candidate]);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    candidate?.session.lock(); setCandidate(undefined); setPassword(""); setError(undefined); setDetection(undefined); setSerialized(undefined);
    const file=event.target.files?.[0]; if(!file) return; setFileName(file.name);
    if(file.size>MAX_IDENTITY_FILE_BYTES){ setError("Identity file exceeds the 32 KiB limit."); return; }
    const content=await file.text(); setSerialized(content);
    try { setDetection(detectIdentityFormat(content)); } catch(cause) { setError(cause instanceof Error?cause.message:"Identity file could not be inspected."); }
  }
  async function validate(): Promise<void> {
    if(!serialized||detection?.state!=="SUPPORTED"||detection.format==="WORKBENCH_BACKUP_V1") return;
    setBusy(true); setError(undefined);
    try { setCandidate(await validateIdentityImport(serialized,password)); setPassword(""); }
    catch(cause) { setError(cause instanceof Error?cause.message:"Identity could not be validated."); }
    finally { setBusy(false); }
  }
  function confirm(): void { if(!candidate)return; accepted.current=true; onConfirm(candidate.session); }

  return <section className="flow-page identity-import" aria-labelledby="identity-import-title"><button className="back-link" type="button" onClick={onBack}>← Back</button><div className="eyebrow">Identity Portability</div><h1 id="identity-import-title">Import Existing Agent</h1><p className="lede">Choose a supported identity file. Detection, decryption, and validation happen only in this browser.</p>
    <section className="import-step"><h2>Choose identity file</h2><label className="file-field"><span>Identity file</span><input type="file" accept=".json,.txt,application/json,text/plain" onChange={(event)=>void chooseFile(event)} /><span className="file-button">{fileName??"Choose identity file"}</span></label><p className="limitation">Maximum 32 KiB. Supported: FLOP Workbench Backup V1, CryptoTelugu browser backup V4, or a plain 64-hex Ed25519 Secret Key.</p></section>
    {detection && <section className="import-step" aria-live="polite"><div className="eyebrow">Detected format</div><h2>{detection.label}</h2>{detection.state==="UNKNOWN"&&<p>Unknown identity format. FLOP will not guess or attempt decryption.</p>}{detection.state==="UNSUPPORTED"&&<p>Identity format detected but not supported yet.</p>}{detection.state==="SUPPORTED"&&detection.format==="WORKBENCH_BACKUP_V1"&&<><p>Use the recommended Restore Workbench Agent flow for this encrypted backup.</p><button className="primary" type="button" onClick={onRestoreWorkbench}>Continue to Restore Workbench Agent</button></>}{detection.state==="SUPPORTED"&&detection.format!=="WORKBENCH_BACKUP_V1"&&!candidate&&<>{detection.requiresPassword&&<label><span>Backup Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event)=>setPassword(event.target.value)} /></label>}<p>{detection.format==="PLAIN_SECRET_HEX"?"Plain-text Secret Key. Keep private. FLOP will derive the Public DID before loading it.":"The password and decrypted identity remain local. FLOP will independently compare the derived public key and DID."}</p><button className="primary" type="button" disabled={busy||(detection.requiresPassword&&!password)} onClick={()=>void validate()}>{busy?"Validating locally…":"Validate Identity"}</button></>}</section>}
    {candidate&&<section className="import-confirm" aria-labelledby="import-confirm-title"><div className="eyebrow">Validation passed</div><h2 id="import-confirm-title">Confirm this Agent</h2><p>Detected Public DID:</p><code className="break-anywhere">{candidate.publicIdentity.did}</code><p>Confirm only if this is the Agent you intended to import. Loading it does not verify real-world identity.</p><button className="primary" type="button" onClick={confirm}>Load This Agent</button><button className="secondary" type="button" onClick={()=>{candidate.session.lock();setCandidate(undefined);}}>Cancel</button></section>}
    {error&&<div className="operational-error" role="alert"><strong>Import unavailable</strong><span>{error}</span><small>No secret value is included in this error.</small></div>}<aside className="onboarding-security"><strong>Identity files are untrusted.</strong><span>No file is uploaded, fetched, logged, or persisted.</span></aside></section>;
}
