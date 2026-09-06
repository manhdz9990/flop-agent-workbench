import {
  DIAGNOSTIC_STAGES,
  type DiagnosticBoundary,
  type DiagnosticBoundaryResult,
  type DiagnosticStageResult,
  type DiagnosticStageWalk,
} from "./contracts";

/**
 * Deterministic boundary-selection rules (V11-01).
 *
 * These helpers only read a stage walk's statuses; they never infer a
 * cause beyond the status/detail already present on each stage result.
 */

function toBoundary(result: DiagnosticStageResult): DiagnosticBoundary {
  const boundary: { stage: DiagnosticStageResult["stage"]; status: DiagnosticStageResult["status"]; detail?: string } = {
    stage: result.stage,
    status: result.status,
  };
  if (result.detail !== undefined) {
    boundary.detail = result.detail;
  }
  return boundary;
}

/**
 * Asserts the walk represents every locked stage exactly once, in the
 * locked pipeline order. Throws on malformed input rather than silently
 * guessing at missing/duplicated/reordered stages.
 */
export function assertCompleteOrderedWalk(walk: DiagnosticStageWalk): void {
  if (walk.length !== DIAGNOSTIC_STAGES.length) {
    throw new Error(
      `Diagnostic stage walk must contain exactly ${DIAGNOSTIC_STAGES.length} stages; received ${walk.length}.`,
    );
  }
  for (let i = 0; i < DIAGNOSTIC_STAGES.length; i += 1) {
    const expected = DIAGNOSTIC_STAGES[i];
    const actual = walk[i]?.stage;
    if (actual !== expected) {
      throw new Error(
        `Diagnostic stage walk is out of locked order at position ${i}: expected "${expected}", received "${actual}".`,
      );
    }
  }
}

/**
 * The first FAIL boundary in pipeline order, or null if no stage FAILed.
 * NOT_APPLICABLE and NOT_OBSERVED are never selected here.
 */
export function firstFailedBoundary(walk: DiagnosticStageWalk): DiagnosticBoundary | null {
  const failed = walk.find((result) => result.status === "FAIL");
  return failed ? toBoundary(failed) : null;
}

/**
 * The first UNAVAILABLE boundary in pipeline order, considered only when
 * no stage in the walk FAILed. Returns null if a FAIL exists anywhere in
 * the walk, or if no stage is UNAVAILABLE.
 */
export function firstUnavailableBoundary(walk: DiagnosticStageWalk): DiagnosticBoundary | null {
  const hasFail = walk.some((result) => result.status === "FAIL");
  if (hasFail) {
    return null;
  }
  const unavailable = walk.find((result) => result.status === "UNAVAILABLE");
  return unavailable ? toBoundary(unavailable) : null;
}

/**
 * Selects both boundaries for a full stage walk in one deterministic pass.
 * Earliest FAIL always wins over any later FAIL or UNAVAILABLE stage.
 * UNAVAILABLE is only surfaced when the walk contains no FAIL at all.
 * NOT_APPLICABLE and NOT_OBSERVED stages never become either boundary.
 */
export function selectBoundaries(walk: DiagnosticStageWalk): DiagnosticBoundaryResult {
  return {
    firstFailedBoundary: firstFailedBoundary(walk),
    firstUnavailableBoundary: firstUnavailableBoundary(walk),
  };
}
