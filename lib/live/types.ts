import type { EvidenceField, OperationalError, TrustReport } from "../domain";
import type { ProtocolRecord } from "../protocol";

export const TECHNOCORE_ORIGIN = "https://technocore.chat";
export const LIVE_RESPONSE_MAX_BYTES = 2 * 1024 * 1024;
export const LIVE_REQUEST_TIMEOUT_MS = 10_000;

export interface RoomReadPayload {
  readonly room: string;
  readonly count: number;
  readonly firstSeq: string | null;
  readonly lastSeq: string;
  readonly generation?: string;
  readonly messages: readonly ProtocolRecord[];
  readonly waitHeld?: boolean;
}

export interface LiveInspection {
  readonly report: TrustReport;
  readonly serverMetadata: readonly EvidenceField[];
}

export type ReadResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: OperationalError };

export interface ReaderOptions {
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
  readonly since?: string;
  readonly waitSeconds?: number;
  readonly signal?: AbortSignal;
}

/**
 * V11-02 — Safe Public Room Discovery.
 *
 * Discovery reads exactly `GET https://technocore.chat/rooms`: a separate,
 * narrower, fixed-origin, fixed-path endpoint from the per-room JSON reader
 * above. It is bounded independently and must never be confused with a
 * crawler, index, or archive.
 */
export const DISCOVERY_RESPONSE_MAX_BYTES = 256 * 1024;
export const DISCOVERY_MAX_OBSERVATIONS = 50;

/**
 * One observed room listing entry. Every field except `seq` is either a
 * server-formatted display string or untrusted, caller-chosen data (the
 * room name and topic). Nothing here is a trust, reputation, ranking, or
 * safety classification — it is exactly what the discovery endpoint
 * printed for that room, unevaluated.
 */
export interface RoomObservation {
  readonly room: string;
  readonly seq: string;
  readonly approxStoredSize: string;
  readonly lastActivity: string;
  readonly topic?: string;
}

export interface RoomsDiscoveryPayload {
  readonly observations: readonly RoomObservation[];
}
