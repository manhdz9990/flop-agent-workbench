import type { OperationalError, TrustReport, Warning } from "../domain";
import type { ProtocolRecord } from "../protocol";

export const DEFAULT_EXPORT_LIMITS = { maxBytes: 5 * 1024 * 1024, maxLines: 10_000, maxLineBytes: 256 * 1024 } as const;

export interface ExportLimits { readonly maxBytes: number; readonly maxLines: number; readonly maxLineBytes: number }
export interface ParsedExportRecord { readonly lineNumber: number; readonly rawLine: string; readonly record: ProtocolRecord }
export interface ParsedExport { readonly records: readonly ParsedExportRecord[]; readonly operationalErrors: readonly OperationalError[] }
export interface ExportMetadata { readonly generation?: string }
export interface SequenceGap { readonly previous: string; readonly next: string; readonly missingCount: string; readonly warning: Warning }
export interface ExportInspection { readonly report: TrustReport; readonly metadata: ExportMetadata; readonly gaps: readonly SequenceGap[] }
