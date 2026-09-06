import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_STAGES,
  DIAGNOSTIC_STATUSES,
  getDiagnosticStageLabel,
} from "../../lib/diagnostics";

describe("locked diagnostic status/stage contracts", () => {
  it("defines exactly the five approved diagnostic statuses", () => {
    expect(DIAGNOSTIC_STATUSES).toEqual([
      "PASS",
      "FAIL",
      "UNAVAILABLE",
      "NOT_APPLICABLE",
      "NOT_OBSERVED",
    ]);
    expect(new Set(DIAGNOSTIC_STATUSES).size).toBe(5);
  });

  it("defines the locked 12-stage Verification Pipeline in exact order", () => {
    expect(DIAGNOSTIC_STAGES).toEqual([
      "SOURCE_AVAILABILITY",
      "RECORD_PARSING",
      "MESSAGE_CLASSIFICATION",
      "DID_STRUCTURE",
      "DID_DECODING",
      "NONCE_EVIDENCE",
      "SWEEP_TRANSFORMATION",
      "CANONICAL_PAYLOAD",
      "SIGNATURE_REPRESENTATION",
      "ED25519_VERIFICATION",
      "TCLK_RECOGNITION",
      "TCLK_STRUCTURAL_BINDING",
    ]);
    expect(DIAGNOSTIC_STAGES.length).toBe(12);
    expect(new Set(DIAGNOSTIC_STAGES).size).toBe(12);
  });

  it("provides a non-empty presentation label for every stage", () => {
    for (const stage of DIAGNOSTIC_STAGES) {
      const label = getDiagnosticStageLabel(stage);
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
