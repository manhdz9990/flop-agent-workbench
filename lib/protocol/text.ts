const SWEPT_CATEGORY = /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/gu;

/** Implements the official single-line sweep without Unicode normalization. */
export function sweepSingleLine(text: string): string {
  return text.replace(SWEPT_CATEGORY, " ").trim();
}
