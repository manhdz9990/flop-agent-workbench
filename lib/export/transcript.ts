import type { Warning } from "../domain";
import type { ParsedExportRecord, SequenceGap } from "./types";

export const RETAINED_WINDOW_WARNING: Warning = { code: "RETAINED_WINDOW_ONLY", message: "This export contains records retained at capture time; it is not verified full history." };
export const GENERATION_UNAVAILABLE_WARNING: Warning = { code: "GENERATION_METADATA_UNAVAILABLE", message: "Room-generation metadata is unavailable for this local export; this does not invalidate message evidence." };

function sequenceText(record: ParsedExportRecord): string | undefined {
  const { seq } = record.record;
  if (typeof seq === "string" && /^(?:0|[1-9]\d*)$/u.test(seq)) return seq;
  if (typeof seq === "number" && Number.isSafeInteger(seq) && seq >= 0) return String(seq);
  return undefined;
}

export function detectSequenceGaps(records: readonly ParsedExportRecord[]): readonly SequenceGap[] {
  const gaps: SequenceGap[] = [];
  let previous: string | undefined;
  for (const parsed of records) {
    const next = sequenceText(parsed);
    if (next === undefined) continue;
    if (previous !== undefined && BigInt(next) > BigInt(previous) + 1n) gaps.push({ previous, next, missingCount: String(BigInt(next) - BigInt(previous) - 1n), warning: { code: "SEQUENCE_GAP_OBSERVED", message: `Observed sequence discontinuity ${previous} to ${next}; the available evidence does not establish its cause.` } });
    previous = next;
  }
  return gaps;
}

export function firstObservedSequenceWarning(records: readonly ParsedExportRecord[]): Warning | undefined {
  const first = records.map(sequenceText).find((value) => value !== undefined);
  return first !== undefined && BigInt(first) > 1n ? { code: "EARLIER_SEQUENCE_NOT_OBSERVED", message: `The first observed sequence is ${first}; earlier context is not present in this retained export, and no cause is established.` } : undefined;
}
