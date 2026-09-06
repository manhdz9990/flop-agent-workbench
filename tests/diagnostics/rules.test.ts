import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_STAGES,
  DIAGNOSTIC_STATUSES,
  getDiagnosticCopy,
} from "../../lib/diagnostics";

describe("central diagnostic rules registry", () => {
  it("returns non-empty, deterministic copy for every stage/status pair", () => {
    for (const stage of DIAGNOSTIC_STAGES) {
      for (const status of DIAGNOSTIC_STATUSES) {
        const first = getDiagnosticCopy(stage, status);
        const second = getDiagnosticCopy(stage, status);
        expect(first).toEqual(second);
        expect(first.whatThisMeans.length).toBeGreaterThan(0);
        expect(first.checkNext.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives distinct stage-specific copy for FAIL across different stages", () => {
    const didCopy = getDiagnosticCopy("DID_STRUCTURE", "FAIL");
    const sigCopy = getDiagnosticCopy("ED25519_VERIFICATION", "FAIL");
    expect(didCopy.whatThisMeans).not.toBe(sigCopy.whatThisMeans);
  });

  it("gives distinct stage-specific copy for UNAVAILABLE across different stages", () => {
    const sourceCopy = getDiagnosticCopy("SOURCE_AVAILABILITY", "UNAVAILABLE");
    const tclkCopy = getDiagnosticCopy("TCLK_STRUCTURAL_BINDING", "UNAVAILABLE");
    expect(sourceCopy.whatThisMeans).not.toBe(tclkCopy.whatThisMeans);
  });

  it("uses shared, status-level copy for PASS regardless of stage", () => {
    const a = getDiagnosticCopy("SOURCE_AVAILABILITY", "PASS");
    const b = getDiagnosticCopy("ED25519_VERIFICATION", "PASS");
    expect(a).toEqual(b);
  });

  it("uses shared, status-level copy for NOT_APPLICABLE regardless of stage", () => {
    const a = getDiagnosticCopy("TCLK_RECOGNITION", "NOT_APPLICABLE");
    const b = getDiagnosticCopy("DID_STRUCTURE", "NOT_APPLICABLE");
    expect(a).toEqual(b);
  });

  it("uses shared, status-level copy for NOT_OBSERVED regardless of stage", () => {
    const a = getDiagnosticCopy("TCLK_STRUCTURAL_BINDING", "NOT_OBSERVED");
    const b = getDiagnosticCopy("RECORD_PARSING", "NOT_OBSERVED");
    expect(a).toEqual(b);
  });

  it("never assigns a root-cause claim in FAIL copy beyond the checked stage's own evidence", () => {
    const forbidden = ["because you", "caused by", "due to malicious", "the attacker"];
    for (const stage of DIAGNOSTIC_STAGES) {
      const copy = getDiagnosticCopy(stage, "FAIL");
      const lower = `${copy.whatThisMeans} ${copy.checkNext}`.toLowerCase();
      for (const phrase of forbidden) {
        expect(lower).not.toContain(phrase);
      }
    }
  });
});
