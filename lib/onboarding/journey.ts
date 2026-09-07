export const JOURNEY_STEPS = [
  "CREATE", "SECURE", "VERIFY_BACKUP", "PERSONALIZE", "FIRST_MESSAGE", "VERIFY_MESSAGE",
  "CARD", "SHARE", "ATTACH_X_POST", "RECORD_CONTRIBUTION", "VERIFY_EVIDENCE", "COMPLETE",
] as const;

export type JourneyStep = typeof JOURNEY_STEPS[number];

export interface AgentProfile {
  readonly displayName: string;
  readonly xUsername?: string;
  readonly description?: string;
}

export interface JourneyFacts {
  readonly identityPresent: boolean;
  readonly backupCreated: boolean;
  readonly backupVerified: boolean;
  readonly profile?: AgentProfile;
  readonly firstMessageCreated?: boolean;
  readonly firstMessageVerified?: boolean;
  readonly cardCreated?: boolean;
  readonly shared?: boolean;
  readonly xPostAttached?: boolean;
  readonly contributionRecorded?: boolean;
  readonly evidenceVerified?: boolean;
}

export const JOURNEY_REQUIRED: Readonly<Record<JourneyStep, boolean>> = {
  CREATE: true, SECURE: true, VERIFY_BACKUP: true, PERSONALIZE: true,
  FIRST_MESSAGE: true, VERIFY_MESSAGE: true, CARD: true, SHARE: true,
  ATTACH_X_POST: true, RECORD_CONTRIBUTION: true, VERIFY_EVIDENCE: true, COMPLETE: true,
};

export function isProfileComplete(profile?: AgentProfile): boolean {
  return Boolean(profile?.displayName.trim());
}

export function completedJourneySteps(facts: JourneyFacts): ReadonlySet<JourneyStep> {
  const completed = new Set<JourneyStep>();
  if (facts.identityPresent) completed.add("CREATE");
  if (facts.backupCreated || facts.backupVerified) completed.add("SECURE");
  if (facts.backupVerified) completed.add("VERIFY_BACKUP");
  if (isProfileComplete(facts.profile)) completed.add("PERSONALIZE");
  if (facts.firstMessageCreated || facts.firstMessageVerified) completed.add("FIRST_MESSAGE");
  if (facts.firstMessageVerified) completed.add("VERIFY_MESSAGE");
  if (facts.cardCreated) completed.add("CARD");
  if (facts.shared) completed.add("SHARE");
  if (facts.xPostAttached) completed.add("ATTACH_X_POST");
  if (facts.contributionRecorded) completed.add("RECORD_CONTRIBUTION");
  if (facts.evidenceVerified) completed.add("VERIFY_EVIDENCE");
  if (JOURNEY_STEPS.filter((step) => step !== "COMPLETE").every((step) => completed.has(step))) completed.add("COMPLETE");
  return completed;
}

export function earliestIncompleteRequiredStep(facts: JourneyFacts): JourneyStep {
  const completed = completedJourneySteps(facts);
  return JOURNEY_STEPS.find((step) => JOURNEY_REQUIRED[step] && !completed.has(step)) ?? "COMPLETE";
}

export function isJourneyStepEligible(step: JourneyStep, facts: JourneyFacts): boolean {
  const completed = completedJourneySteps(facts);
  switch (step) {
    case "CREATE": return !facts.identityPresent;
    case "SECURE": return facts.identityPresent;
    case "VERIFY_BACKUP": return completed.has("SECURE");
    case "PERSONALIZE": return completed.has("VERIFY_BACKUP");
    case "FIRST_MESSAGE": return completed.has("PERSONALIZE");
    case "VERIFY_MESSAGE": return completed.has("FIRST_MESSAGE");
    case "CARD": return completed.has("VERIFY_MESSAGE");
    case "SHARE": return completed.has("CARD");
    case "ATTACH_X_POST": return completed.has("SHARE");
    case "RECORD_CONTRIBUTION": return completed.has("ATTACH_X_POST");
    case "VERIFY_EVIDENCE": return completed.has("RECORD_CONTRIBUTION");
    case "COMPLETE": return completed.has("COMPLETE");
  }
}

export function validateAgentProfile(input: AgentProfile): AgentProfile {
  const displayName = input.displayName.trim();
  const xUsername = input.xUsername?.trim().replace(/^@/, "") || undefined;
  const description = input.description?.trim() || undefined;
  if (displayName.length < 1 || displayName.length > 48) throw new Error("Display Name must be between 1 and 48 characters.");
  if (xUsername && !/^[A-Za-z0-9_]{1,15}$/.test(xUsername)) throw new Error("X username must be 1–15 letters, numbers, or underscores.");
  if (description && description.length > 160) throw new Error("Description must be 160 characters or fewer.");
  return { displayName, xUsername, description };
}

export function createEnglishIntroductionDraft(profile: AgentProfile): string {
  const safe = validateAgentProfile(profile);
  const interest = safe.description ? ` ${safe.description.replace(/\s+/g, " ").trim()}` : "";
  return `Hello Technocore! I'm ${safe.displayName}. I'm exploring the FLOP ecosystem and learning how signed Agent identities and verifiable messages work.${interest}`;
}
