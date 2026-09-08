"use client";
/* eslint-disable @next/next/no-img-element -- the exact same-origin brand raster is also used by the Canvas export */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { generateLocalIdentity, importEncryptedIdentity, type LocalIdentitySession } from "../lib/identity";
import { completedJourneySteps, createEnglishIntroductionDraft, earliestIncompleteRequiredStep, validateAgentProfile, type AgentProfile, type JourneyStep } from "../lib/onboarding";
import { publishPreparedMessage, type PublishAttemptResult, type PublishAttemptSession } from "../lib/publish";
import { verifyPublishedReadback, type ReadbackResult } from "../lib/readback";
import type { PreparedSignedMessage, SessionNonceReservations } from "../lib/signing";
import { createPublicAgentCard, createXIntentUrl, createXPostDraft, renderAgentCardPng, shortPublicDid, type PublicAgentCard } from "../lib/agent-card";
import { CONTRIBUTION_LIMITATION, createContributionReceipt, createContributionRecord, createDirectContributionRecord, normalizeXPostUrl, serializeContributionReceiptJson, serializeContributionReceiptMarkdown, serializeContributionRecord, type ContributionEvidenceReceipt, type PublicContributionRecord } from "../lib/contribution";
import { createVerifiedPublicationEvidence, type EvidenceActivityEntry } from "../lib/evidence-activity";

interface GuidedJourneyProps {
  readonly identity?: LocalIdentitySession;
  readonly profile?: AgentProfile;
  readonly onIdentityChange: (identity?: LocalIdentitySession) => void;
  readonly onProfileChange: (profile: AgentProfile) => void;
  readonly onBack: () => void;
  readonly onRestore: () => void;
  readonly onImportExisting: () => void;
  readonly reservations: SessionNonceReservations;
  readonly attempts: PublishAttemptSession;
  readonly onRooms: () => void;
  readonly onMyAgent: () => void;
  readonly onEvidence: () => void;
  readonly onEvidenceObserved: (entry: EvidenceActivityEntry) => void;
  readonly onEncryptedBackupReady: (identity: LocalIdentitySession, encryptedBackup: string) => void;
  readonly contributionOnly?: boolean;
}

const progressGroups: readonly { label: string; steps: readonly JourneyStep[] }[] = [
  { label: "Identity", steps: ["CREATE"] }, { label: "Secure", steps: ["SECURE", "VERIFY_BACKUP"] },
  { label: "Profile", steps: ["PERSONALIZE"] },
  { label: "Message", steps: ["FIRST_MESSAGE", "VERIFY_MESSAGE"] }, { label: "Card", steps: ["CARD"] },
  { label: "Share", steps: ["SHARE", "ATTACH_X_POST"] },
  { label: "Evidence", steps: ["RECORD_CONTRIBUTION", "VERIFY_EVIDENCE"] },
  { label: "Ready", steps: ["COMPLETE"] },
];

function downloadBackup(content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }));
  try { const link = document.createElement("a"); link.href = url; link.download = "technocore-agent-backup.json"; link.rel = "noopener"; link.click(); }
  finally { URL.revokeObjectURL(url); }
}

function shortDid(did: string): string { return `${did.slice(0, 20)}…${did.slice(-8)}`; }

export function GuidedJourney({ identity, profile, onIdentityChange, onProfileChange, onBack, onRestore, onImportExisting, reservations, attempts, onRooms, onMyAgent, onEvidence, onEvidenceObserved, onEncryptedBackupReady, contributionOnly = false }: GuidedJourneyProps) {
  const initialFacts = { identityPresent: Boolean(identity && !identity.isLocked), backupCreated: identity?.backupVerificationStatus === "VERIFIED", backupVerified: identity?.backupVerificationStatus === "VERIFIED", profile };
  contributionOnly = contributionOnly && Boolean(identity && !identity.isLocked);
  const [step, setStep] = useState<JourneyStep>(() => contributionOnly ? "ATTACH_X_POST" : earliestIncompleteRequiredStep(initialFacts));
  const [backupCreated, setBackupCreated] = useState(identity?.backupVerificationStatus === "VERIFIED");
  const [backupContent, setBackupContent] = useState<string>();
  const [backupPassword, setBackupPassword] = useState("");
  const [backupFile, setBackupFile] = useState<File>();
  const [verifyPassword, setVerifyPassword] = useState("");
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [xUsername, setXUsername] = useState(profile?.xUsername ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [showFullDid, setShowFullDid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState(() => profile ? createEnglishIntroductionDraft(profile) : "");
  const [prepared, setPrepared] = useState<PreparedSignedMessage>(undefined as unknown as PreparedSignedMessage);
  const [publishResult, setPublishResult] = useState<PublishAttemptResult>();
  const [readback, setReadback] = useState<ReadbackResult>();
  const [agentCard, setAgentCard] = useState<PublicAgentCard>();
  const [xDraft, setXDraft] = useState("");
  const [cardDownloaded, setCardDownloaded] = useState(false);
  const [postCopied, setPostCopied] = useState(false);
  const [xOpened, setXOpened] = useState(contributionOnly);
  const [xPostUrl,setXPostUrl]=useState("");
  const [contribution,setContribution]=useState<PublicContributionRecord>();
  const [contributionPrepared,setContributionPrepared]=useState<PreparedSignedMessage>();
  const [contributionPublish,setContributionPublish]=useState<PublishAttemptResult>();
  const [contributionReadback,setContributionReadback]=useState<ReadbackResult>();
  const [contributionReceipt,setContributionReceipt]=useState<ContributionEvidenceReceipt>();
  const [receiptCopied,setReceiptCopied]=useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const active = identity && !identity.isLocked ? identity : undefined;
  const facts = useMemo(() => ({ identityPresent: Boolean(active), backupCreated, backupVerified: active?.backupVerificationStatus === "VERIFIED", profile, firstMessageCreated: publishResult !== undefined, firstMessageVerified: readback?.state === "PUBLISHED_AND_VERIFIED", cardCreated:Boolean(agentCard), shared:xOpened, xPostAttached:Boolean(contribution), contributionRecorded:Boolean(contributionPublish), evidenceVerified:contributionReadback?.state==="PUBLISHED_AND_VERIFIED" }), [active, backupCreated, profile, publishResult, readback, agentCard, xOpened, contribution, contributionPublish, contributionReadback]);
  const completed = completedJourneySteps(facts);

  useEffect(() => {
    const heading = taskRef.current?.querySelector<HTMLHeadingElement>("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
  }, [step]);

  async function createAgent(): Promise<void> {
    setBusy(true); setError(undefined);
    try { onIdentityChange(await generateLocalIdentity()); setBackupCreated(false); setStep("SECURE"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Your Agent could not be created."); }
    finally { setBusy(false); }
  }
  async function createBackup(): Promise<void> {
    if (!active) return;
    setBusy(true); setError(undefined);
    try { const content = await active.createEncryptedBackup(backupPassword); setBackupContent(content); onEncryptedBackupReady(active, content); setBackupPassword(""); setBackupCreated(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The encrypted backup could not be created."); }
    finally { setBusy(false); }
  }
  function saveBackup(): void { if (backupContent) { downloadBackup(backupContent); setStep("VERIFY_BACKUP"); } }
  async function verifyBackup(): Promise<void> {
    if (!active || !backupFile) return;
    setBusy(true); setError(undefined);
    try {
      const restored = await importEncryptedIdentity(await backupFile.text(), verifyPassword);
      if (restored.publicIdentity.did !== active.publicIdentity.did) { restored.lock(); throw new Error("This backup restores a different Public DID."); }
      active.lock(); onIdentityChange(restored); if (backupContent) onEncryptedBackupReady(restored, backupContent); setVerifyPassword(""); setStep("PERSONALIZE");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Backup verification failed."); }
    finally { setBusy(false); }
  }
  function saveProfile(): void {
    setError(undefined);
    try { const saved=validateAgentProfile({ displayName, xUsername, description }); onProfileChange(saved); setMessage(createEnglishIntroductionDraft(saved)); setStep("FIRST_MESSAGE"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Profile details are not valid."); }
  }
  async function signAndPublish(): Promise<void> {
    if (!active || active.backupVerificationStatus !== "VERIFIED" || !profile || !message.trim() || busy || prepared) return;
    setBusy(true); setError(undefined);
    try { const signed=await active.prepareSignedMessage({ room:"lobby", text:message }, reservations); setPrepared(signed); const result=await publishPreparedMessage(signed, attempts); setPublishResult(result); setStep("VERIFY_MESSAGE"); }
    catch(cause) { setError(cause instanceof Error?cause.message:"The signed publish attempt could not be initiated."); }
    finally { setBusy(false); }
  }
  async function checkMessage(): Promise<void> {
    if(!prepared||busy)return; setBusy(true); setError(undefined);
    try { const result=await verifyPublishedReadback({prepared,attempts}); setReadback(result); if(result.state==="PUBLISHED_AND_VERIFIED") setStep("CARD"); }
    catch(cause){setError(cause instanceof Error?cause.message:"Publication could not be checked.");}
    finally{setBusy(false);}
  }
  function createCard():void{if(!profile||!prepared||readback?.state!=="PUBLISHED_AND_VERIFIED"||!readback.observed.sequence)return;const card=createPublicAgentCard({displayName:profile.displayName,publicDid:prepared.did,authoritativeSeq:readback.observed.sequence});setAgentCard(card);setXDraft(createXPostDraft(card,Number(BigInt(card.authoritativeSeq)%3n)));setStep("SHARE");}
  async function downloadCard():Promise<void>{if(!agentCard)return;setBusy(true);setError(undefined);try{const blob=await renderAgentCardPng(agentCard);const url=URL.createObjectURL(blob);try{const link=document.createElement("a");link.href=url;link.download="flop-technocore-agent-card.png";link.click();}finally{URL.revokeObjectURL(url);}setCardDownloaded(true);}catch(cause){setError(cause instanceof Error?cause.message:"Agent Card could not be downloaded.");}finally{setBusy(false);}}
  async function copyPost():Promise<void>{try{await navigator.clipboard.writeText(xDraft);setPostCopied(true);}catch{setError("Clipboard access was unavailable. Select and copy the post text instead.");}}
  function openX():void{window.open(createXIntentUrl(xDraft),"_blank","noopener,noreferrer");setXOpened(true);setStep("ATTACH_X_POST");}
  function attachXPost():void{if(!active||(!contributionOnly&&!agentCard))return;setError(undefined);try{const canonical=normalizeXPostUrl(xPostUrl);setXPostUrl(canonical);setContribution(contributionOnly?createDirectContributionRecord({did:active.publicIdentity.did,xPostUrl:canonical}):createContributionRecord({did:agentCard!.publicDid,displayName:agentCard!.displayName,xPostUrl:canonical,firstRoom:"lobby",firstSeq:agentCard!.authoritativeSeq}));setStep("RECORD_CONTRIBUTION");}catch(cause){setError(cause instanceof Error?cause.message:"X Post URL is invalid.");}}
  async function signAndRecord():Promise<void>{if(!active||!contribution||busy||contributionPrepared)return;setBusy(true);setError(undefined);try{const signed=await active.prepareSignedMessage({room:"lobby",text:serializeContributionRecord(contribution)},reservations);setContributionPrepared(signed);const result=await publishPreparedMessage(signed,attempts);setContributionPublish(result);setStep("VERIFY_EVIDENCE");}catch(cause){setError(cause instanceof Error?cause.message:"Contribution record could not be signed and published.");}finally{setBusy(false);}}
  async function checkContribution():Promise<void>{if(!contributionPrepared||!contribution||busy)return;setBusy(true);setError(undefined);try{const result=await verifyPublishedReadback({prepared:contributionPrepared,attempts});setContributionReadback(result);if(result.state==="PUBLISHED_AND_VERIFIED"&&result.observed.sequence){const receipt=createContributionReceipt({contribution,sequence:result.observed.sequence,timestamp:result.observed.timestamp,protocolEvidence:result.receipt});setContributionReceipt(receipt);const activity=createVerifiedPublicationEvidence(contributionPrepared,result);if(activity)onEvidenceObserved(activity);setStep("COMPLETE");}}catch(cause){setError(cause instanceof Error?cause.message:"Contribution evidence could not be checked.");}finally{setBusy(false);}}
  function downloadText(content:string,filename:string,type:string):void{setError(undefined);try{const url=URL.createObjectURL(new Blob([content],{type}));try{const link=document.createElement("a");link.href=url;link.download=filename;link.click();}finally{URL.revokeObjectURL(url);}}catch{setError("The Evidence Receipt could not be downloaded. You can copy the JSON evidence instead.");}}
  async function copyEvidence():Promise<void>{if(!contributionReceipt)return;setError(undefined);try{await navigator.clipboard.writeText(serializeContributionReceiptJson(contributionReceipt));setReceiptCopied(true);}catch{setError("Clipboard access was unavailable. Download the JSON or Markdown receipt instead.");}}
  const chooseBackup = (event: ChangeEvent<HTMLInputElement>) => setBackupFile(event.target.files?.[0]);

  return <section className="flow-page guided-journey" aria-labelledby="guided-journey-title">
    <button className="back-link" type="button" onClick={onBack}>← Back to Home</button>
    <div className="journey-heading"><div className="eyebrow">{contributionOnly ? "Add Contribution" : "Guided Agent Journey"}</div><h1 id="guided-journey-title">{contributionOnly ? "Record verified contribution evidence" : step === "CREATE" ? "Create your agent identity" : step === "SECURE" ? "Secure your identity" : step === "VERIFY_BACKUP" ? "Verify your recovery" : step === "PERSONALIZE" ? "Personalize your Agent" : "Your guided journey"}</h1><p>{contributionOnly ? "Add the public X reference, review the exact record, then sign and verify it deliberately." : "Complete one clear step at a time. Your signing key stays in this browser session."}</p></div>
    {!contributionOnly && <ol className="journey-progress" aria-label="Onboarding progress">{progressGroups.map((group) => { const done = group.steps.every((item) => completed.has(item)); const current = group.steps.includes(step); return <li key={group.label} data-state={done ? "complete" : current ? "current" : "upcoming"} aria-current={current ? "step" : undefined}><button type="button" disabled={!current}><span>{done ? "✓" : String(progressGroups.indexOf(group) + 1).padStart(2, "0")}</span><strong>{group.label}</strong></button></li>; })}</ol>}
    {error && <div className="operational-error" role="alert"><strong>Action unavailable</strong><span>{error}</span></div>}
    <div className="journey-task" ref={taskRef}>
      {step === "VERIFY_EVIDENCE" && contributionReadback?.state === "OBSERVED_BUT_NOT_VERIFIED" && contributionReadback.evidenceVerdict === "INVALID" && <div className="warning" role="status"><strong>Contribution signature INVALID</strong><span>The observed contribution evidence did not validate and cannot complete this journey.</span></div>}
      {step === "VERIFY_EVIDENCE" && contributionReadback?.state === "OBSERVED_BUT_NOT_VERIFIED" && contributionReadback.evidenceVerdict === "UNVERIFIABLE" && <div className="warning" role="status"><strong>Contribution signature UNVERIFIABLE</strong><span>The observed evidence could not be independently verified and cannot complete this journey.</span></div>}
      {step === "VERIFY_EVIDENCE" && contributionReadback?.state === "OBSERVED_BUT_NOT_VERIFIED" && contributionReadback.evidenceVerdict !== "INVALID" && contributionReadback.evidenceVerdict !== "UNVERIFIABLE" && <div className="warning" role="status"><strong>Exact contribution record mismatch</strong><span>An unrelated record is not sufficient and cannot complete this journey.</span></div>}
      {step === "SHARE" && agentCard && <section aria-labelledby="journey-share"><div className="eyebrow">Step 7 · Agent Card + Share</div><h2 id="journey-share">Share your verified first record</h2><div className="agent-card-preview" aria-label="Verified Agent Card"><div className="agent-card-brand"><img src="/brand/flop-logo.png" alt="" /><strong>FLOP AGENT WORKBENCH</strong></div><h3>{agentCard.displayName}</h3><span>TECHNOCORE AGENT</span><code>{shortPublicDid(agentCard.publicDid)}</code><strong>{agentCard.algorithm}</strong><hr/><span>FIRST SIGNED RECORD</span><b>#{agentCard.room} · #{agentCard.authoritativeSeq}</b><em>SIGNATURE VERIFIED ✓</em><small>Created with FLOP Agent Workbench</small></div><p>Display Name is self-declared. The verification label applies only to the signed record.</p><button className="primary" type="button" disabled={busy} onClick={()=>void downloadCard()}>{busy?"Creating PNG…":"Download Card"}</button>{cardDownloaded&&<p className="success-note" role="status">Agent Card downloaded. Attach it manually before publishing on X.</p>}<h3>Review your English X post</h3><label><span>X post</span><textarea rows={10} value={xDraft} onChange={(event)=>{setXDraft(event.target.value);setPostCopied(false);}} /></label><div className="share-actions"><button className="secondary" type="button" onClick={()=>setXDraft(createXPostDraft(agentCard,(Number(BigInt(agentCard.authoritativeSeq)%3n)+1)%3))}>Try another draft</button><button className="secondary" type="button" onClick={()=>void copyPost()}>Copy Post</button><button className="primary" type="button" disabled={!cardDownloaded} onClick={openX}>Open in X</button></div>{postCopied&&<p className="success-note" role="status">Post copied.</p>}<p className="warning">Download the Card first. X opens with text only: attach the downloaded image, press Post yourself, then return here with the public post URL.</p></section>}
      {step === "ATTACH_X_POST" && xOpened && (contributionOnly || agentCard) && <section aria-labelledby="attach-x-post"><div className="eyebrow">Step 8 · Public reference</div><h2 id="attach-x-post">Add your X post</h2><p>Paste the public X post you want this Agent to record as a public contribution reference. FLOP does not verify X ownership, content, or attachments.</p><label><span>X Post URL</span><input type="url" inputMode="url" maxLength={256} value={xPostUrl} onChange={(event)=>setXPostUrl(event.target.value)} placeholder="https://x.com/username/status/123…" /></label><button className="primary" type="button" disabled={!xPostUrl.trim()} onClick={attachXPost}>Continue</button></section>}
      {step === "RECORD_CONTRIBUTION" && contribution && <section aria-labelledby="review-contribution"><div className="eyebrow">Step 9 · Public contribution</div><h2 id="review-contribution">Review your contribution record</h2><dl className="review-summary">{contribution.type === "agent-card" && <><dt>Agent</dt><dd>{contribution.display_name}</dd></>}<dt>Public DID</dt><dd className="mono break-anywhere">{contribution.did}</dd><dt>X post</dt><dd className="break-anywhere">{contribution.x_post_url}</dd>{contribution.type === "agent-card" && <><dt>First signed record</dt><dd>#{contribution.first_record.room} · #{contribution.first_record.seq}</dd></>}<dt>Destination room</dt><dd>#lobby</dd><dt>What will be recorded</dt><dd className="mono prewrap break-anywhere">{serializeContributionRecord(contribution)}</dd></dl><p className="limitation">#lobby is a FLOP Workbench convention, not an official FLOP Labs contribution lane or acceptance mechanism.</p><p>Your Agent will sign this public contribution record locally and publish it to Technocore.</p><button className="primary" type="button" disabled={busy} onClick={()=>void signAndRecord()}>{busy?"Signing and recording…":"Sign & Record"}</button></section>}
      {step === "VERIFY_EVIDENCE" && contributionPrepared && <section aria-labelledby="verify-contribution"><div className="eyebrow">Step 10 · Evidence</div><h2 id="verify-contribution">Verify your contribution record</h2><p>{contributionPublish?.state==="OUTCOME_UNKNOWN"?"We couldn't confirm what happened yet. Do not automatically publish again.":"A response was received, but the contribution record is not verified yet."}</p>{contributionReadback?.state==="NOT_OBSERVED"&&<p className="outcome-note" role="status">Not observed yet.</p>}{contributionReadback?.state==="READBACK_UNAVAILABLE"&&<p className="operational-error" role="alert">Unable to check contribution evidence.</p>}{contributionReadback?.state==="OBSERVED_BUT_NOT_VERIFIED"&&<p className="warning" role="status">Exact contribution evidence was not independently verified as VALID.</p>}<button className="primary" type="button" disabled={busy} onClick={()=>void checkContribution()}>{busy?"Checking…":"Check contribution"}</button></section>}
      {step === "COMPLETE" && contributionReceipt && <section aria-labelledby="agent-ready"><div className="eyebrow">Guided journey complete</div><h2 id="agent-ready">Your Agent is ready</h2><ul className="ready-checklist"><li>Agent created/imported ✓</li><li>Agent secured ✓</li><li>Recovery verified ✓</li><li>Profile completed ✓</li><li>First signed message ✓</li><li>Signature verified ✓</li><li>Agent Card created ✓</li><li>X post added ✓</li><li>Contribution record published ✓</li><li>Contribution signature verified ✓</li><li>Evidence Receipt ready ✓</li></ul><div className="contribution-receipt"><h3>Evidence Receipt</h3><p>{CONTRIBUTION_LIMITATION}</p><div className="share-actions"><button className="secondary" type="button" onClick={()=>void copyEvidence()}>Copy Evidence</button><button className="secondary" type="button" onClick={()=>downloadText(serializeContributionReceiptJson(contributionReceipt),"flop-contribution-evidence.json","application/json")}>Download JSON</button><button className="secondary" type="button" onClick={()=>downloadText(serializeContributionReceiptMarkdown(contributionReceipt),"flop-contribution-evidence.md","text/markdown")}>Download Markdown</button></div>{receiptCopied&&<p className="success-note" role="status">Evidence copied.</p>}</div><button className="primary" type="button" onClick={onRooms}>Enter Technocore Rooms</button><div className="share-actions"><button className="secondary" type="button" onClick={onMyAgent}>View My Agent</button><button className="secondary" type="button" onClick={onEvidence}>View Evidence</button></div><p className="limitation">This runtime evidence is not durable protocol storage. Refresh may clear the guided journey state.</p></section>}
      {step === "FIRST_MESSAGE" && active && <div className="guided-public-actions"><button className="tertiary" type="button" onClick={() => void navigator.clipboard.writeText(active.publicIdentity.did)}>Copy full Public DID</button><button className="tertiary" type="button" aria-expanded={showFullDid} onClick={() => setShowFullDid(!showFullDid)}>{showFullDid ? "Use short Public DID" : "View full Public DID"}</button>{showFullDid && <code className="break-anywhere">{active.publicIdentity.did}</code>}</div>}
      {step === "VERIFY_MESSAGE" && readback?.state === "OBSERVED_BUT_NOT_VERIFIED" && readback.evidenceVerdict === "INVALID" && <div className="warning" role="status"><strong>Signature INVALID</strong><span>The observed cryptographic evidence did not validate. This step cannot advance.</span></div>}
      {step === "VERIFY_MESSAGE" && readback?.state === "OBSERVED_BUT_NOT_VERIFIED" && readback.evidenceVerdict === "UNVERIFIABLE" && <div className="warning" role="status"><strong>Signature UNVERIFIABLE</strong><span>The observed evidence could not be independently verified. This step cannot advance.</span></div>}
      {step === "VERIFY_MESSAGE" && readback?.state === "OBSERVED_BUT_NOT_VERIFIED" && readback.evidenceVerdict !== "INVALID" && readback.evidenceVerdict !== "UNVERIFIABLE" && <div className="warning" role="status"><strong>Authoritative record mismatch</strong><span>The exact expected signed record was not verified. This step cannot advance.</span></div>}
      {step === "CREATE" && <section aria-labelledby="journey-create"><div className="eyebrow">Step 1 · Identity</div><h2 id="journey-create">Create your Agent</h2><p>Create a new browser-local Agent and Public DID.</p><button className="primary" type="button" disabled={busy} onClick={() => void createAgent()}>{busy ? "Creating…" : "Create New Agent"}</button><details className="existing-agent-options"><summary>I already have an Agent</summary><p>An unloaded Agent was not deleted. Choose the source you own.</p><button className="secondary" type="button" onClick={onRestore}>Restore Workbench Agent</button><button className="secondary" type="button" onClick={onImportExisting}>Import Existing Agent</button></details></section>}
      {step === "SECURE" && active && <section aria-labelledby="journey-secure"><div className="eyebrow">Step 2 · Secure</div><h2 id="journey-secure">Secure your Agent</h2><div className="public-did"><span>Public DID</span><strong className="mono break-anywhere">{showFullDid ? active.publicIdentity.did : shortDid(active.publicIdentity.did)}</strong><div><button className="tertiary" type="button" onClick={() => void navigator.clipboard.writeText(active.publicIdentity.did)}>Copy DID</button><button className="tertiary" type="button" aria-expanded={showFullDid} onClick={() => setShowFullDid(!showFullDid)}>{showFullDid ? "Shorten DID" : "View full DID"}</button></div></div><p>Create an encrypted backup before continuing.</p>{!backupContent ? <><label><span>Backup Password</span><input type="password" autoComplete="new-password" value={backupPassword} onChange={(event) => setBackupPassword(event.target.value)} /></label><button className="primary" type="button" disabled={busy || !backupPassword} onClick={() => void createBackup()}>{busy ? "Creating…" : "Create Encrypted Backup"}</button></> : <><div className="stage-success" role="status"><strong>Encrypted backup ready</strong><span>Save it somewhere you control. FLOP cannot recover this file or password.</span></div><button className="primary" type="button" onClick={saveBackup}>Download Encrypted Backup</button></>}</section>}
      {step === "VERIFY_BACKUP" && active && <section aria-labelledby="journey-verify"><div className="eyebrow">Step 3 · Verify</div><h2 id="journey-verify">Verify you can recover</h2><p>Choose the backup you downloaded and enter its Backup Password. It is decrypted locally and must restore the same Public DID.</p><label className="file-field"><span>Encrypted Backup</span><input type="file" accept=".json,application/json" onChange={chooseBackup} /><span className="file-button">{backupFile?.name ?? "Choose Encrypted Backup .json"}</span></label><label><span>Backup Password</span><input type="password" autoComplete="current-password" value={verifyPassword} onChange={(event) => setVerifyPassword(event.target.value)} /></label><button className="primary" type="button" disabled={busy || !backupFile || !verifyPassword} onClick={() => void verifyBackup()}>{busy ? "Verifying…" : "Verify My Backup"}</button></section>}
      {step === "PERSONALIZE" && active && <section aria-labelledby="journey-profile"><div className="eyebrow">Step 4 · Profile</div><h2 id="journey-profile">Personalize your Agent</h2><p>This browser-local profile is self-declared. It does not verify your real-world identity.</p><label><span>Display Name <em>Required</em></span><input maxLength={48} autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label><span>X username <em>Optional</em></span><input maxLength={16} autoComplete="off" placeholder="username" value={xUsername} onChange={(event) => setXUsername(event.target.value)} /></label><label><span>Short description or interests <em>Optional</em></span><textarea maxLength={160} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label><span className="profile-count">{description.length} / 160 characters</span><button className="primary" type="button" disabled={!displayName.trim()} onClick={saveProfile}>Save Profile and Continue</button></section>}
      {step === "FIRST_MESSAGE" && active && profile && <section aria-labelledby="journey-first-message"><div className="eyebrow">Step 5 · First Signed Message</div><h2 id="journey-first-message">Your first signed message</h2><dl className="review-summary"><dt>Agent</dt><dd>{profile.displayName}</dd><dt>Public DID</dt><dd className="mono break-anywhere">{shortDid(active.publicIdentity.did)}</dd><dt>Room</dt><dd>#lobby</dd></dl><label><span>Message</span><textarea value={message} onChange={(event)=>setMessage(event.target.value)} rows={6} /></label><p>Your Agent will sign this message locally in your browser and publish it to Technocore. A response does not guarantee publication.</p><button className="primary" type="button" disabled={busy||!message.trim()} onClick={()=>void signAndPublish()}>{busy?"Signing and publishing…":"Sign & Publish"}</button></section>}
      {step === "VERIFY_MESSAGE" && prepared && <section aria-labelledby="journey-verify-message"><div className="eyebrow">Step 6 · Read Back + Verify</div><h2 id="journey-verify-message">Check your signed message</h2><p>{publishResult?.state==="OUTCOME_UNKNOWN"?"We couldn't confirm what happened yet. Do not automatically send again.":"The publish request received a response. Publication is not verified yet."}</p>{readback?.state==="NOT_OBSERVED"&&<div className="outcome-note" role="status">Not observed yet.</div>}{readback?.state==="READBACK_UNAVAILABLE"&&<div className="operational-error" role="alert">Unable to check publication.</div>}{readback?.state==="OBSERVED_BUT_NOT_VERIFIED"&&<div className="warning" role="status">Observed evidence did not produce a VALID verification result.</div>}<button className="primary" type="button" disabled={busy} onClick={()=>void checkMessage()}>{busy?"Checking…":"Check publication"}</button></section>}
      {step === "CARD" && readback?.state === "PUBLISHED_AND_VERIFIED" && <section aria-labelledby="journey-card"><div className="eyebrow">First signed message complete</div><h2 id="journey-card">Create your Agent Card</h2><ul><li>Published ✓</li><li>Observed on Technocore ✓</li><li>Signature verified ✓</li></ul><dl className="review-summary"><dt>Room</dt><dd>#lobby</dd><dt>Record</dt><dd>#{readback.observed.sequence ?? "Not provided"}</dd><dt>Public DID</dt><dd className="mono">{shortDid(prepared.did)}</dd></dl><p>Build a public image from this verified record evidence. Display Name is self-declared.</p><button className="primary" type="button" onClick={createCard}>Create Agent Card</button></section>}
    </div>
    <p className="journey-session-note">After an encrypted backup is created, this browser can retain the encrypted Agent and safe public context. A fresh load is always locked; unlock locally with your Backup Password.</p>
  </section>;
}
