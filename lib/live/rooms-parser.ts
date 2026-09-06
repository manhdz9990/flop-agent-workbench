import { DISCOVERY_MAX_OBSERVATIONS, type RoomObservation, type RoomsDiscoveryPayload } from "./types";

/**
 * V11-02 — Safe Public Room Discovery parser.
 *
 * The discovery endpoint returns a plain-text, line-oriented listing (not
 * JSON). Comment/summary lines start with `#` and are ignored entirely —
 * in particular, no engagement/notes/scan statistic line is ever read or
 * surfaced, because those are reputation-adjacent aggregate figures that
 * this discovery-only module must not compute, store, or expose.
 *
 * Each room line has the shape:
 *   /r/<room>   seq <digits>   <size>   <age> ago  · <topic>
 * `<room>` and the optional `· <topic>` suffix are untrusted, caller-chosen
 * data and are captured only as opaque strings — never interpreted,
 * fetched, or classified.
 */
export class RoomsDiscoveryError extends Error {
  constructor(
    readonly code: "MALFORMED_RESPONSE" | "UNSUPPORTED_RESPONSE",
    message: string,
  ) {
    super(message);
    this.name = "RoomsDiscoveryError";
  }
}

const ROOM_LINE_PATTERN =
  /^\/r\/([a-z0-9][a-z0-9_-]{0,47})[ \t]+seq[ \t]+(\d{1,19})[ \t]+(\S+)[ \t]+(\S+[ \t]+ago)(?:[ \t]*\u00b7[ \t]*(.*))?$/u;

export function parseRoomsDiscoveryText(input: string): RoomsDiscoveryPayload {
  if (typeof input !== "string") {
    throw new RoomsDiscoveryError("MALFORMED_RESPONSE", "Technocore rooms discovery response was not text.");
  }

  const observations: RoomObservation[] = [];
  let sawRecognizedLine = false;

  for (const rawLine of input.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    if (line.startsWith("#")) {
      // Header/footer comment line (e.g. total-room count or engagement
      // statistics). Intentionally never parsed or surfaced — see module
      // note above.
      sawRecognizedLine = true;
      continue;
    }
    const match = ROOM_LINE_PATTERN.exec(line);
    if (match === null) {
      // A single anomalous/unrecognized line does not invalidate the
      // whole listing; it is skipped as untrusted, non-conforming data.
      continue;
    }
    sawRecognizedLine = true;
    if (observations.length >= DISCOVERY_MAX_OBSERVATIONS) continue;
    const [, room, seq, approxStoredSize, lastActivity, topic] = match;
    if (room === undefined || seq === undefined || approxStoredSize === undefined || lastActivity === undefined) continue;
    observations.push({
      room,
      seq,
      approxStoredSize,
      lastActivity: lastActivity.replace(/[ \t]+/u, " "),
      ...(topic !== undefined && topic.trim().length > 0 ? { topic } : {}),
    });
  }

  if (!sawRecognizedLine) {
    throw new RoomsDiscoveryError(
      "MALFORMED_RESPONSE",
      "Technocore rooms discovery response did not match the expected listing format.",
    );
  }

  return { observations };
}
