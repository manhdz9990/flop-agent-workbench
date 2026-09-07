import { describe, expect, it } from "vitest";
import { completedJourneySteps, createEnglishIntroductionDraft, earliestIncompleteRequiredStep, isJourneyStepEligible, JOURNEY_REQUIRED, JOURNEY_STEPS, validateAgentProfile } from "../../lib/onboarding";

describe("V13-01 guided journey state model", () => {
  it("defines the canonical deterministic step order and required V13-05 X attachment", () => {
    expect(JOURNEY_STEPS).toEqual(["CREATE", "SECURE", "VERIFY_BACKUP", "PERSONALIZE", "FIRST_MESSAGE", "VERIFY_MESSAGE", "CARD", "SHARE", "ATTACH_X_POST", "RECORD_CONTRIBUTION", "VERIFY_EVIDENCE", "COMPLETE"]);
    expect(JOURNEY_REQUIRED.ATTACH_X_POST).toBe(true);
  });

  it("routes new and existing Agents to the earliest genuinely incomplete requirement", () => {
    expect(earliestIncompleteRequiredStep({ identityPresent: false, backupCreated: false, backupVerified: false })).toBe("CREATE");
    expect(earliestIncompleteRequiredStep({ identityPresent: true, backupCreated: false, backupVerified: false })).toBe("SECURE");
    expect(earliestIncompleteRequiredStep({ identityPresent: true, backupCreated: true, backupVerified: false })).toBe("VERIFY_BACKUP");
    expect(earliestIncompleteRequiredStep({ identityPresent: true, backupCreated: true, backupVerified: true })).toBe("PERSONALIZE");
    expect(earliestIncompleteRequiredStep({ identityPresent: true, backupCreated: true, backupVerified: true, profile: { displayName: "Ada" } })).toBe("FIRST_MESSAGE");
  });

  it("never completes reserved later stages from UI presence alone", () => {
    const completed = completedJourneySteps({ identityPresent: true, backupCreated: true, backupVerified: true, profile: { displayName: "Ada" } });
    expect([...completed]).toEqual(["CREATE", "SECURE", "VERIFY_BACKUP", "PERSONALIZE"]);
    expect(completed.has("FIRST_MESSAGE")).toBe(false);
    expect(completed.has("COMPLETE")).toBe(false);
  });

  it("gates entry using prior real facts instead of UI navigation", () => {
    const verified = { identityPresent: true, backupCreated: true, backupVerified: true, profile: { displayName: "Ada" } };
    expect(isJourneyStepEligible("FIRST_MESSAGE", verified)).toBe(true);
    expect(isJourneyStepEligible("VERIFY_MESSAGE", verified)).toBe(false);
    expect(isJourneyStepEligible("CARD", verified)).toBe(false);
    expect(isJourneyStepEligible("PERSONALIZE", { identityPresent: true, backupCreated: true, backupVerified: false })).toBe(false);
  });

  it("bounds and normalizes self-declared non-secret profile metadata", () => {
    expect(validateAgentProfile({ displayName: "  Ada Agent  ", xUsername: "@ada_agent", description: "  Protocol explorer  " })).toEqual({ displayName: "Ada Agent", xUsername: "ada_agent", description: "Protocol explorer" });
    expect(() => validateAgentProfile({ displayName: "" })).toThrow(/Display Name/);
    expect(() => validateAgentProfile({ displayName: "A".repeat(49) })).toThrow(/48/);
    expect(() => validateAgentProfile({ displayName: "Ada", xUsername: "not-valid!" })).toThrow(/X username/);
    expect(() => validateAgentProfile({ displayName: "Ada", description: "A".repeat(161) })).toThrow(/160/);
  });

  it("creates a deterministic bounded English introduction only from profile fields", () => {
    expect(createEnglishIntroductionDraft({ displayName: "Ada" })).toBe("Hello Technocore! I'm Ada. I'm exploring the FLOP ecosystem and learning how signed Agent identities and verifiable messages work.");
    const withInterest = createEnglishIntroductionDraft({ displayName: "Ada", description: "I enjoy protocol research.\nAnd careful testing." });
    expect(withInterest).toContain("Ada");
    expect(withInterest).toContain("I enjoy protocol research. And careful testing.");
    expect(withInterest.length).toBeLessThan(320);
    expect(withInterest).not.toMatch(/reward|airdrop|eligib|official FLOP Agent/i);
  });

  it("unlocks CARD only after a real attempt and verified read-back facts", () => {
    const base = { identityPresent: true, backupCreated: true, backupVerified: true, profile: { displayName: "Ada" } };
    expect(earliestIncompleteRequiredStep({ ...base, firstMessageCreated: true })).toBe("VERIFY_MESSAGE");
    expect(isJourneyStepEligible("CARD", { ...base, firstMessageCreated: true })).toBe(false);
    expect(earliestIncompleteRequiredStep({ ...base, firstMessageCreated: true, firstMessageVerified: true })).toBe("CARD");
    expect(isJourneyStepEligible("CARD", { ...base, firstMessageCreated: true, firstMessageVerified: true })).toBe(true);
  });

  it("cannot complete without every required V13-05 fact, including the X reference", () => {
    const allExceptX = {
      identityPresent: true,
      backupCreated: true,
      backupVerified: true,
      profile: { displayName: "Ada" },
      firstMessageCreated: true,
      firstMessageVerified: true,
      cardCreated: true,
      shared: true,
      contributionRecorded: true,
      evidenceVerified: true,
    };
    expect(completedJourneySteps(allExceptX).has("COMPLETE")).toBe(false);
    expect(isJourneyStepEligible("COMPLETE", allExceptX)).toBe(false);

    const complete = { ...allExceptX, xPostAttached: true };
    expect(completedJourneySteps(complete).has("COMPLETE")).toBe(true);
    expect(isJourneyStepEligible("COMPLETE", complete)).toBe(true);
  });
});
