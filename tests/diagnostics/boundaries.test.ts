import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_STAGES,
  type DiagnosticStageResult,
  type DiagnosticStageWalk,
  type DiagnosticStatus,
} from "../../lib/diagnostics";
import {
  assertCompleteOrderedWalk,
  firstFailedBoundary,
  firstUnavailableBoundary,
  selectBoundaries,
} from "../../lib/diagnostics/boundaries";

/** Builds a full, correctly ordered stage walk, defaulting every stage to
 * PASS unless overridden by `overrides` (stage -> status). */
function buildWalk(overrides: Partial<Record<(typeof DIAGNOSTIC_STAGES)[number], DiagnosticStatus>>): DiagnosticStageWalk {
  return DIAGNOSTIC_STAGES.map((stage): DiagnosticStageResult => ({
    stage,
    status: overrides[stage] ?? "PASS",
  }));
}

describe("assertCompleteOrderedWalk", () => {
  it("accepts a walk with all locked stages in exact order", () => {
    const walk = buildWalk({});
    expect(() => assertCompleteOrderedWalk(walk)).not.toThrow();
  });

  it("rejects a walk with the wrong number of stages", () => {
    const walk = buildWalk({}).slice(0, 5);
    expect(() => assertCompleteOrderedWalk(walk)).toThrow();
  });

  it("rejects a walk with stages out of locked order", () => {
    const walk = [...buildWalk({})];
    const tmp = walk[0]!;
    walk[0] = walk[1]!;
    walk[1] = tmp;
    expect(() => assertCompleteOrderedWalk(walk)).toThrow();
  });
});

describe("firstFailedBoundary", () => {
  it("returns null when no stage FAILed", () => {
    const walk = buildWalk({ ED25519_VERIFICATION: "UNAVAILABLE" });
    expect(firstFailedBoundary(walk)).toBeNull();
  });

  it("returns the earliest FAIL when multiple stages FAIL", () => {
    const walk = buildWalk({
      DID_STRUCTURE: "FAIL",
      NONCE_EVIDENCE: "FAIL",
      ED25519_VERIFICATION: "FAIL",
    });
    const boundary = firstFailedBoundary(walk);
    expect(boundary?.stage).toBe("DID_STRUCTURE");
    expect(boundary?.status).toBe("FAIL");
  });

  it("prefers an earlier FAIL over a later UNAVAILABLE", () => {
    const walk = buildWalk({
      MESSAGE_CLASSIFICATION: "FAIL",
      ED25519_VERIFICATION: "UNAVAILABLE",
    });
    expect(firstFailedBoundary(walk)?.stage).toBe("MESSAGE_CLASSIFICATION");
  });
});

describe("firstUnavailableBoundary", () => {
  it("returns the earliest UNAVAILABLE when no stage FAILed", () => {
    const walk = buildWalk({
      SIGNATURE_REPRESENTATION: "UNAVAILABLE",
      ED25519_VERIFICATION: "UNAVAILABLE",
    });
    const boundary = firstUnavailableBoundary(walk);
    expect(boundary?.stage).toBe("SIGNATURE_REPRESENTATION");
    expect(boundary?.status).toBe("UNAVAILABLE");
  });

  it("returns null when any stage FAILed, even if an earlier stage is UNAVAILABLE", () => {
    const walk = buildWalk({
      SOURCE_AVAILABILITY: "UNAVAILABLE",
      ED25519_VERIFICATION: "FAIL",
    });
    expect(firstUnavailableBoundary(walk)).toBeNull();
  });

  it("returns null when no stage is UNAVAILABLE", () => {
    const walk = buildWalk({});
    expect(firstUnavailableBoundary(walk)).toBeNull();
  });

  it("never selects NOT_APPLICABLE or NOT_OBSERVED as a boundary", () => {
    const walk = buildWalk({
      TCLK_RECOGNITION: "NOT_APPLICABLE",
      TCLK_STRUCTURAL_BINDING: "NOT_OBSERVED",
    });
    expect(firstFailedBoundary(walk)).toBeNull();
    expect(firstUnavailableBoundary(walk)).toBeNull();
  });
});

describe("selectBoundaries", () => {
  it("reports both null on an all-PASS walk", () => {
    const result = selectBoundaries(buildWalk({}));
    expect(result.firstFailedBoundary).toBeNull();
    expect(result.firstUnavailableBoundary).toBeNull();
  });

  it("reports only the FAIL boundary when both FAIL and UNAVAILABLE are present", () => {
    const walk = buildWalk({
      NONCE_EVIDENCE: "UNAVAILABLE",
      CANONICAL_PAYLOAD: "FAIL",
    });
    const result = selectBoundaries(walk);
    expect(result.firstFailedBoundary?.stage).toBe("CANONICAL_PAYLOAD");
    expect(result.firstUnavailableBoundary).toBeNull();
  });

  it("carries stage detail through to the boundary when present", () => {
    const walk = DIAGNOSTIC_STAGES.map((stage): DiagnosticStageResult =>
      stage === "ED25519_VERIFICATION"
        ? { stage, status: "FAIL", detail: "signature mismatch" }
        : { stage, status: "PASS" },
    );
    const result = selectBoundaries(walk);
    expect(result.firstFailedBoundary?.detail).toBe("signature mismatch");
  });
});
