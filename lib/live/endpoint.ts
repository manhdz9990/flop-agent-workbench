import { NAME_PATTERN } from "../protocol";
import { TECHNOCORE_ORIGIN } from "./types";

export class InputValidationError extends Error {
  constructor(readonly code: "INVALID_ROOM" | "INVALID_SEQUENCE", message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

export function validateRoomName(room: string): string {
  if (typeof room !== "string" || !NAME_PATTERN.test(room)) throw new InputValidationError("INVALID_ROOM", "Room must match the official Technocore name grammar.");
  return room;
}

export function validateSequence(sequence: string): string {
  if (typeof sequence !== "string" || !/^(?:0|[1-9]\d{0,18})$/u.test(sequence)) throw new InputValidationError("INVALID_SEQUENCE", "Message sequence must be a 1–19 digit non-negative integer string.");
  return sequence;
}

export function buildRoomReadUrl(room: string): URL {
  validateRoomName(room);
  const url = new URL(`/r/${room}`, TECHNOCORE_ORIGIN);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "200");
  return url;
}
