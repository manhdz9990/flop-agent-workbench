import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { addObservedEvidence, createRoomObservedEvidence, createVerifiedPublicationEvidence } from "../../lib/evidence-activity";
import type { ReadbackResult } from "../../lib/readback";
import { EVIDENCE_RECEIPT_SCHEMA, type EvidenceReceipt } from "../../lib/receipt";
import type { PreparedSignedMessage } from "../../lib/signing";

const prepared: PreparedSignedMessage = Object.freeze({
  state: "SIGNED_LOCALLY_NOT_PUBLISHED",
  room: "lobby",
  did: "did:key:z6MkObserved",
  nonce: "9007199254740993",
  text: "<script>owned()</script> https://example.invalid",
  canonicalPayload: "lobby|9007199254740993|<script>owned()</script> https://example.invalid",
  signature: "A".repeat(86),
});

const receipt: EvidenceReceipt = {
  schema: EVIDENCE_RECEIPT_SCHEMA,
  source: { kind: "ROOM", room: "lobby", sequence: "44" },
  evidenceVerdict: "VALID",
  diagnosticStages: [],
  firstFailedBoundary: null,
  firstUnavailableBoundary: null,
  operationalObservations: [],
  sequenceGaps: [],
  tclk: { status: "NOT_TCLK" },
  limitations: ["Observed evidence only."],
};

const verified: Extract<ReadbackResult, { state: "PUBLISHED_AND_VERIFIED" }> = {
  state: "PUBLISHED_AND_VERIFIED",
  evidenceVerdict: "VALID",
  exactCandidateCount: 1,
  observed: { sequence: "44" },
  pipeline: { inputKind: "ROOM", stages: [], evidenceVerdict: "VALID", operationalErrors: [], firstFailedBoundary: null, firstUnavailableBoundary: null },
  receipt,
};

describe("V12-08C runtime evidence model", () => {
  it("creates observed publication evidence only from PUBLISHED_AND_VERIFIED", () => {
    expect(createVerifiedPublicationEvidence(prepared, verified)).toMatchObject({ source: "READBACK_VERIFIED", verdict: "VALID", room: "lobby", sequence: "44", observationState: "PUBLISHED_AND_VERIFIED", receipt });
    const nonQualifying: readonly ReadbackResult[] = [
      { state: "NOT_ATTEMPTED", message: "No publish attempt is recorded for this prepared message." },
      { state: "NOT_OBSERVED", message: "Not observed yet. The bounded retained window does not prove whether the write occurred." },
      { state: "READBACK_UNAVAILABLE", operationalError: { code: "NETWORK_FAILURE", message: "Unavailable." } },
    ];
    for (const result of nonQualifying) expect(createVerifiedPublicationEvidence(prepared, result)).toBeUndefined();
    const onboarding = readFileSync(new URL("../../app/onboarding.tsx", import.meta.url), "utf8");
    const rooms = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    const onboardingPublish = onboarding.slice(onboarding.indexOf("async function publish"), onboarding.indexOf("async function check"));
    const roomsPublish = rooms.slice(rooms.indexOf("async function sendMessage"), rooms.indexOf("function composerKeyDown"));
    expect(onboardingPublish).not.toContain("onEvidenceObserved");
    expect(roomsPublish).not.toContain("onEvidenceObserved");
    expect(onboarding).toMatch(/function addVerifiedEvidence[\s\S]*createVerifiedPublicationEvidence\(prepared, readback\)/);
    expect(rooms).toMatch(/function addEvidence[\s\S]*createRoomObservedEvidence\(room, message\)/);
    expect(onboarding.slice(onboarding.indexOf("async function check"), onboarding.indexOf("function addVerifiedEvidence"))).not.toContain("onEvidenceObserved");
    expect(roomsPublish).not.toContain("onEvidenceObserved");
  });

  it("preserves exact room-observation verdicts and hostile public fields as inert values", () => {
    const entry = createRoomObservedEvidence("lobby", { index: 0, writer: "alice", writerKind: "UNSIGNED_NICKNAME", text: prepared.text, sequence: "9", verdict: "UNSIGNED" });
    expect(entry).toMatchObject({ verdict: "UNSIGNED", writer: "alice", text: prepared.text, sequence: "9", observationState: "OBSERVED" });
  });

  it("deduplicates explicit observations without synthesizing entries", () => {
    const entry = createVerifiedPublicationEvidence(prepared, verified)!;
    const once = addObservedEvidence([], entry);
    expect(addObservedEvidence(once, entry)).toBe(once);
    expect(addObservedEvidence(once, undefined)).toBe(once);
  });

  it("keeps Evidence presentation non-secret and adapter-based with approved persistence", () => {
    const ui = readFileSync(new URL("../../app/evidence.tsx", import.meta.url), "utf8");
    const page = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
    const sources = `${ui}\n${page}`;
    expect(ui).toContain("not durable account history");
    expect(ui).toMatch(/serializeEvidenceReceiptMarkdown|onInspectMessage/);
    expect(page).toMatch(/useState<readonly EvidenceActivityEntry\[\]>/);
    expect(page).toContain("savePersistentAgent");
    expect(sources).not.toMatch(/sessionStorage|indexedDB|document\.cookie|dangerouslySetInnerHTML|setInterval|WebSocket|EventSource/);
    expect(sources).not.toMatch(/identity\.(?:seed|privateKey|passphrase|ciphertext)/);
  });
});
