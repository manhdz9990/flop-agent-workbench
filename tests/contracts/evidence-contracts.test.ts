import { describe, expect, expectTypeOf, it } from "vitest";

import {
  EVIDENCE_AUTHORITIES,
  INPUT_KINDS,
  VERIFICATION_STATES,
  type OperationalError,
  type TrustReport,
  type VerificationState,
} from "../../lib/domain";

describe("locked evidence contracts", () => {
  it("supports exactly the four approved input kinds", () => {
    expect(INPUT_KINDS).toEqual(["ROOM", "MESSAGE", "DID", "EXPORT"]);
  });

  it("defines exactly four mutually exclusive verification values", () => {
    expect(VERIFICATION_STATES).toEqual([
      "VALID",
      "INVALID",
      "UNSIGNED",
      "UNVERIFIABLE",
    ]);
    expect(new Set(VERIFICATION_STATES).size).toBe(4);
  });

  it("keeps operational errors outside the verification-state domain", () => {
    const error: OperationalError = {
      code: "READ_FAILED",
      message: "The requested evidence could not be read.",
    };

    expect(VERIFICATION_STATES).not.toContain(error.code as VerificationState);
    expectTypeOf<OperationalError>().not.toEqualTypeOf<VerificationState>();
  });

  it("represents authority without assigning semantic trust", () => {
    expect(EVIDENCE_AUTHORITIES).toEqual([
      "SIGNED",
      "SERVER_ASSERTED_UNSIGNED",
      "UNTRUSTED_CALLER_DATA",
    ]);
  });

  it("allows a report to carry verdicts and operational errors separately", () => {
    const report: TrustReport = {
      inputKind: "MESSAGE",
      messages: [
        {
          verificationState: "UNVERIFIABLE",
          fields: [
            { name: "text", value: "caller-chosen", authority: "UNTRUSTED_CALLER_DATA" },
          ],
          warnings: [],
        },
      ],
      warnings: [],
      operationalErrors: [{ code: "READ_FAILED", message: "Read failed." }],
    };

    expect(report.messages[0]?.verificationState).toBe("UNVERIFIABLE");
    expect(report.operationalErrors[0]?.code).toBe("READ_FAILED");
  });
});
