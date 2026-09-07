export const WORKBENCH_URL = "https://flop-agent-workbench.vercel.app";

export interface PublicAgentCard {
  readonly displayName: string;
  readonly publicDid: string;
  readonly room: "lobby";
  readonly authoritativeSeq: string;
  readonly algorithm: "Ed25519";
  readonly verification: "SIGNATURE_VERIFIED";
  readonly product: "FLOP Agent Workbench";
}

export function createPublicAgentCard(input: { displayName: string; publicDid: string; authoritativeSeq: string }): PublicAgentCard {
  const displayName=input.displayName.trim();
  if(!displayName||displayName.length>48) throw new Error("Display Name is invalid.");
  if(!/^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]+$/.test(input.publicDid)||input.publicDid.length>100) throw new Error("Public DID is invalid.");
  if(!/^[0-9]{1,64}$/.test(input.authoritativeSeq)) throw new Error("Authoritative sequence is invalid.");
  return {displayName,publicDid:input.publicDid,room:"lobby",authoritativeSeq:input.authoritativeSeq,algorithm:"Ed25519",verification:"SIGNATURE_VERIFIED",product:"FLOP Agent Workbench"};
}

export function shortPublicDid(did:string):string{return `${did.slice(0,20)}…${did.slice(-8)}`;}

export function createXPostDraft(card:PublicAgentCard,variant=0):string{
  const reference=`#${card.room} · #${card.authoritativeSeq}`;
  const displayName=card.displayName.length>24?`${card.displayName.slice(0,23)}…`:card.displayName;
  const drafts=[
    `Technocore Agent set up with FLOP Workbench.\nDID: ${card.publicDid}\nSignature-verified record: ${reference}\n${WORKBENCH_URL}\nExploring @flop_labs.`,
    `${displayName}\nTechnocore Agent via FLOP Workbench.\nDID: ${card.publicDid}\nVerified record: ${reference}\n${WORKBENCH_URL}\nExploring @flop_labs.`,
    `My first Technocore message is signature verified.\n${displayName}\nDID: ${card.publicDid}\nRecord: ${reference}\n${WORKBENCH_URL}\n@flop_labs`,
  ];
  return drafts[Math.abs(variant)%drafts.length]!;
}

export function createXIntentUrl(draft:string):string{return `https://x.com/intent/post?text=${encodeURIComponent(draft)}`;}
