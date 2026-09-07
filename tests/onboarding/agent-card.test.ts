import { describe, expect, it } from "vitest";
import { createPublicAgentCard, createXIntentUrl, createXPostDraft, WORKBENCH_URL } from "../../lib/agent-card";

const DID="did:key:z6MkiV7WZDN7xQH8xCcbk8H4yGgA7G2D3XnR9mP6tK2sQ4vB";
const card=createPublicAgentCard({displayName:"Ada Agent",publicDid:DID,authoritativeSeq:"900719925474099312345"});

describe("V13-04 public Agent Card and X share model",()=>{
  it("contains only bounded public verified-record fields",()=>{
    expect(card).toEqual({displayName:"Ada Agent",publicDid:DID,room:"lobby",authoritativeSeq:"900719925474099312345",algorithm:"Ed25519",verification:"SIGNATURE_VERIFIED",product:"FLOP Agent Workbench"});
    expect(Object.keys(card)).not.toEqual(expect.arrayContaining(["seed","secretKey","password","ciphertext","signature","nonce"]));
    expect(JSON.stringify(card)).not.toMatch(/password|ciphertext|secret/i);
  });
  it("rejects invalid or unbounded public model input",()=>{
    expect(()=>createPublicAgentCard({displayName:"X".repeat(49),publicDid:DID,authoritativeSeq:"1"})).toThrow();
    expect(()=>createPublicAgentCard({displayName:"Ada",publicDid:"did:key:bad",authoritativeSeq:"1"})).toThrow();
    expect(()=>createPublicAgentCard({displayName:"Ada",publicDid:DID,authoritativeSeq:"1".repeat(65)})).toThrow();
  });
  it("creates three deterministic editable English claim-bounded drafts",()=>{
    const drafts=[0,1,2].map((variant)=>createXPostDraft(card,variant));
    expect(new Set(drafts).size).toBe(3);
    for(const draft of drafts){expect(draft).toContain(DID);expect(draft).toContain("#lobby · #900719925474099312345");expect(draft).toContain(WORKBENCH_URL);expect(draft).toContain("@flop_labs");expect(draft.length).toBeLessThanOrEqual(280);expect(draft).not.toMatch(/official agent|identity verified|eligible|airdrop|reward|payment|settlement|partnership/i);}
    expect(createXPostDraft(card,4)).toBe(drafts[1]);
    const maximum=createPublicAgentCard({displayName:"A".repeat(48),publicDid:DID,authoritativeSeq:"9".repeat(64)});
    for(const variant of [0,1,2]) expect(createXPostDraft(maximum,variant).length).toBeLessThanOrEqual(280);
  });
  it("encodes the draft only into a standard X web-intent URL",()=>{
    const draft=createXPostDraft(card,0);const url=createXIntentUrl(draft);
    expect(url).toBe(`https://x.com/intent/post?text=${encodeURIComponent(draft)}`);
    expect(decodeURIComponent(new URL(url).searchParams.get("text")!)).toBe(draft);
  });
});
