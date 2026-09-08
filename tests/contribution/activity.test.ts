import { describe, expect, it } from "vitest";
import { addPersistedContribution, PERSISTED_CONTRIBUTION_LIMIT, qualifyContributionEvidence } from "../../lib/contribution";
import { createVerifiedPublicationEvidence, type EvidenceActivityEntry } from "../../lib/evidence-activity";
import { createContributionRecord, createDirectContributionRecord, serializeContributionRecord } from "../../lib/contribution";
import type { EvidenceReceipt } from "../../lib/receipt";
import type { PreparedSignedMessage } from "../../lib/signing";
import type { ReadbackResult } from "../../lib/readback";

const DID = "did:key:z6MkiV7WZDN7xQH8xCcbk8H4yGgA7G2D3XnR9mP6tK2sQ4vB";

function valid(sequence = "99", xPostUrl = "https://x.com/ada/status/123"): EvidenceActivityEntry {
  const contribution = createContributionRecord({ did: DID, displayName: "Ada", xPostUrl, firstRoom: "lobby", firstSeq: "42" });
  const prepared = { room: "lobby", did: DID, nonce: "7", text: serializeContributionRecord(contribution), signature: "signature" } as PreparedSignedMessage;
  const receipt = { schema: "technocore-evidence-receipt/v1", source: { kind: "ROOM", room: "lobby", sequence, did: DID }, evidenceVerdict: "VALID", diagnosticStages: [], firstFailedBoundary: null, firstUnavailableBoundary: null, operationalObservations: [], sequenceGaps: [], tclk: { status: "NOT_TCLK" }, limitations: [] } as EvidenceReceipt;
  const readback = { state: "PUBLISHED_AND_VERIFIED", evidenceVerdict: "VALID", observed: { sequence }, receipt } as unknown as ReadbackResult;
  return createVerifiedPublicationEvidence(prepared, readback)!;
}

function direct(sequence = "100"): EvidenceActivityEntry {
  const prepared = { room: "lobby", did: DID, nonce: "8", text: serializeContributionRecord(createDirectContributionRecord({ did: DID, xPostUrl: "https://x.com/ada/status/456" })), signature: "signature" } as PreparedSignedMessage;
  const receipt = { schema: "technocore-evidence-receipt/v1", source: { kind: "ROOM", room: "lobby", sequence }, evidenceVerdict: "VALID", diagnosticStages: [], firstFailedBoundary: null, firstUnavailableBoundary: null, operationalObservations: [], sequenceGaps: [], tclk: { status: "NOT_TCLK" }, limitations: [] } as EvidenceReceipt;
  return createVerifiedPublicationEvidence(prepared, { state: "PUBLISHED_AND_VERIFIED", evidenceVerdict: "VALID", observed: { sequence }, receipt } as unknown as ReadbackResult)!;
}

describe("V1.5 qualifying contribution activity", () => {
  it("accepts only exact authoritative VALID contribution evidence", () => expect(qualifyContributionEvidence(valid())?.status).toBe("SIGNATURE_VERIFIED"));
  it("accepts the direct V1.5 X-reference contribution without a prior Agent Card record", () => { const item = qualifyContributionEvidence(direct()); expect(item?.contribution.type).toBe("x-reference"); expect(item?.contribution.x_post_url).toBe("https://x.com/ada/status/456"); });
  it.each([
    { source: "ROOM_OBSERVED" },
    { verdict: "INVALID" },
    { verdict: "UNSIGNED" },
    { verdict: "UNVERIFIABLE" },
    { observationState: "OBSERVED" },
    { text: "Outcome Unknown" },
    { text: "Not observed yet" },
    { writer: "did:key:z6Mkother" },
  ])("rejects non-qualifying evidence %#", (change) => expect(qualifyContributionEvidence({ ...valid(), ...change } as EvidenceActivityEntry)).toBeUndefined());
  it("deduplicates by authoritative room, DID, and sequence", () => { const item = qualifyContributionEvidence(valid())!; expect(addPersistedContribution(addPersistedContribution([], item), item)).toHaveLength(1); });
  it("does not deduplicate distinct authoritative evidence sharing one X URL", () => { const first = qualifyContributionEvidence(valid("99"))!; const second = qualifyContributionEvidence(valid("100"))!; expect(addPersistedContribution(addPersistedContribution([], first), second)).toHaveLength(2); });
  it("retains the newest bounded window deterministically", () => { let items = [] as ReturnType<typeof addPersistedContribution>; for (let sequence = 1; sequence <= PERSISTED_CONTRIBUTION_LIMIT + 2; sequence++) items = addPersistedContribution(items, qualifyContributionEvidence(valid(String(sequence), `https://x.com/ada/status/${sequence}`))); expect(items).toHaveLength(PERSISTED_CONTRIBUTION_LIMIT); expect(items[0].sequence).toBe("3"); });
  it("stores no signing secret, password, or pending-attempt fields", () => { const serialized = JSON.stringify(qualifyContributionEvidence(valid())); expect(serialized).not.toMatch(/secretKey|seed|password|reservation|pendingAttempt/i); });
  it("keeps the receipt tied to the exact authoritative sequence", () => { const item = qualifyContributionEvidence(valid("123"))!; expect(item.receipt.contribution_record).toEqual({ room: "lobby", seq: "123" }); expect(item.receipt.protocol_evidence.source.sequence).toBe("123"); });
});
