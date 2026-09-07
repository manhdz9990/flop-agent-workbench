import type { EvidenceReceipt } from "../receipt";

export const CONTRIBUTION_SCHEMA="flop-agent-contribution/v1" as const;
export const CONTRIBUTION_ROOM="lobby" as const;
export const CONTRIBUTION_RECEIPT_SCHEMA="flop-contribution-evidence-receipt/v1" as const;
export const CONTRIBUTION_LIMITATION="This receipt records observed protocol evidence. It does not establish real-world identity, trustworthiness, payment, settlement, rewards, or eligibility.";

export interface PublicContributionRecord{readonly schema:typeof CONTRIBUTION_SCHEMA;readonly type:"agent-card";readonly did:string;readonly display_name:string;readonly x_post_url:string;readonly product:"FLOP Agent Workbench";readonly first_record:{readonly room:"lobby";readonly seq:string}}

export function normalizeXPostUrl(input:string):string{
  if(input.length<1||input.length>256)throw new Error("X Post URL must be between 1 and 256 characters.");
  let url:URL;try{url=new URL(input);}catch{throw new Error("Enter a valid public X status URL.");}
  if(url.protocol!=="https:"||url.hostname.toLowerCase()!=="x.com"||url.port||url.username||url.password)throw new Error("Only public https://x.com status URLs are supported.");
  const match=/^\/([A-Za-z0-9_]{1,15})\/status\/([0-9]{1,20})\/?$/.exec(url.pathname);
  if(!match)throw new Error("X Post URL must use x.com/<username>/status/<numeric-id>.");
  return `https://x.com/${match[1]}/status/${match[2]}`;
}

export function createContributionRecord(input:{did:string;displayName:string;xPostUrl:string;firstRoom:"lobby";firstSeq:string}):PublicContributionRecord{
  const display=input.displayName.trim();if(!display||display.length>48)throw new Error("Display Name is invalid.");
  if(!/^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]+$/.test(input.did)||input.did.length>100)throw new Error("Public DID is invalid.");
  if(input.firstRoom!=="lobby"||!/^[0-9]{1,64}$/.test(input.firstSeq))throw new Error("First signed record reference is invalid.");
  return {schema:CONTRIBUTION_SCHEMA,type:"agent-card",did:input.did,display_name:display,x_post_url:normalizeXPostUrl(input.xPostUrl),product:"FLOP Agent Workbench",first_record:{room:"lobby",seq:input.firstSeq}};
}
export function serializeContributionRecord(record:PublicContributionRecord):string{return JSON.stringify(record);}

export interface ContributionEvidenceReceipt{readonly schema:typeof CONTRIBUTION_RECEIPT_SCHEMA;readonly product:"FLOP Agent Workbench";readonly product_version:"1.3";readonly contribution:PublicContributionRecord;readonly contribution_record:{readonly room:"lobby";readonly seq:string;readonly timestamp?:string};readonly evidence_verdict:"VALID";readonly protocol_evidence:EvidenceReceipt;readonly limitations:readonly[string]}
export function createContributionReceipt(input:{contribution:PublicContributionRecord;sequence:string;timestamp?:string;protocolEvidence:EvidenceReceipt}):ContributionEvidenceReceipt{
  if(!/^[0-9]{1,64}$/.test(input.sequence))throw new Error("Contribution sequence is invalid.");
  return {schema:CONTRIBUTION_RECEIPT_SCHEMA,product:"FLOP Agent Workbench",product_version:"1.3",contribution:input.contribution,contribution_record:{room:CONTRIBUTION_ROOM,seq:input.sequence,...(input.timestamp?{timestamp:input.timestamp}:{})},evidence_verdict:"VALID",protocol_evidence:input.protocolEvidence,limitations:[CONTRIBUTION_LIMITATION]};
}
export function serializeContributionReceiptJson(receipt:ContributionEvidenceReceipt):string{return `${JSON.stringify(receipt,null,2)}\n`;}
function safe(value:string):string{return value.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\r?\n/g," ");}
export function serializeContributionReceiptMarkdown(receipt:ContributionEvidenceReceipt):string{return [`# FLOP Contribution Evidence Receipt`,``,`- Schema: \`${receipt.schema}\``,`- Product: ${receipt.product} ${receipt.product_version}`,`- Public DID: \`${safe(receipt.contribution.did)}\``,`- Display Name: ${safe(receipt.contribution.display_name)} (self-declared)`,`- Type: \`${receipt.contribution.type}\``,`- X reference: ${safe(receipt.contribution.x_post_url)}`,`- First signed record: \`#${receipt.contribution.first_record.room} · #${receipt.contribution.first_record.seq}\``,`- Contribution record: \`#${receipt.contribution_record.room} · #${receipt.contribution_record.seq}\``,`- Evidence verdict: \`${receipt.evidence_verdict}\``,...(receipt.contribution_record.timestamp?[`- Observed timestamp: \`${safe(receipt.contribution_record.timestamp)}\``]:[]),``,`## Limitation`,``,receipt.limitations[0],``].join("\n");}
