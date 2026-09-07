import {describe,expect,it} from "vitest";
import {CONTRIBUTION_LIMITATION,createContributionReceipt,createContributionRecord,normalizeXPostUrl,serializeContributionReceiptJson,serializeContributionReceiptMarkdown,serializeContributionRecord} from "../../lib/contribution";
import type {EvidenceReceipt} from "../../lib/receipt";

const DID="did:key:z6MkiV7WZDN7xQH8xCcbk8H4yGgA7G2D3XnR9mP6tK2sQ4vB";
const protocol={schema:"technocore-evidence-receipt/v1",source:{kind:"ROOM",room:"lobby",sequence:"99",did:DID},evidenceVerdict:"VALID",diagnosticStages:[],firstFailedBoundary:null,firstUnavailableBoundary:null,operationalObservations:[],sequenceGaps:[],tclk:{status:"NOT_TCLK"},limitations:[CONTRIBUTION_LIMITATION]} as EvidenceReceipt;

describe("V13-05 X reference and public contribution evidence",()=>{
  it.each([
    ["https://x.com/ada/status/123","https://x.com/ada/status/123"],
    ["https://x.com/Ada_Agent/status/000123?s=20#fragment","https://x.com/Ada_Agent/status/000123"],
    ["https://x.com/ada/status/123/","https://x.com/ada/status/123"],
  ])("normalizes approved X status URL %s",(input,expected)=>expect(normalizeXPostUrl(input)).toBe(expected));
  it.each(["http://x.com/ada/status/1","https://x.com.evil.example/ada/status/1","https://evil.example/x.com/ada/status/1","https://x.com@evil.example/ada/status/1","javascript:alert(1)","data:text/plain,x","https://x.com/ada","https://x.com/ada/status/nope","https://x.com/a-b/status/1","https://user:pass@x.com/ada/status/1"])("rejects unsafe X reference %s",(value)=>expect(()=>normalizeXPostUrl(value)).toThrow());
  it("rejects excessive URL length",()=>expect(()=>normalizeXPostUrl(`https://x.com/${"a".repeat(240)}/status/1`)).toThrow(/256|status/));
  it("serializes one deterministic public-only contribution wire record",()=>{
    const record=createContributionRecord({did:DID,displayName:"Ada",xPostUrl:"https://x.com/ada/status/123?s=20",firstRoom:"lobby",firstSeq:"42"});
    expect(serializeContributionRecord(record)).toBe('{"schema":"flop-agent-contribution/v1","type":"agent-card","did":"'+DID+'","display_name":"Ada","x_post_url":"https://x.com/ada/status/123","product":"FLOP Agent Workbench","first_record":{"room":"lobby","seq":"42"}}');
    expect(Object.keys(record)).not.toEqual(expect.arrayContaining(["seed","secretKey","password","ciphertext","nonce","signature"]));
  });
  it("creates deterministic public JSON and Markdown receipts with limitation",()=>{
    const contribution=createContributionRecord({did:DID,displayName:"Ada",xPostUrl:"https://x.com/ada/status/123",firstRoom:"lobby",firstSeq:"42"});
    const receipt=createContributionReceipt({contribution,sequence:"99",timestamp:"2026-09-07T00:00:00Z",protocolEvidence:protocol});
    const json=serializeContributionReceiptJson(receipt),markdown=serializeContributionReceiptMarkdown(receipt);
    expect(json).toBe(serializeContributionReceiptJson(receipt));expect(markdown).toBe(serializeContributionReceiptMarkdown(receipt));
    for(const value of [json,markdown]){expect(value).toContain("https://x.com/ada/status/123");expect(value).toContain(CONTRIBUTION_LIMITATION);expect(value).not.toMatch(/secretKey|ciphertext|backup password/i);}
  });
});
