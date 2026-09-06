import { assertProtocolName } from "./canonical";

export const ROOM_CLASS_MARKERS = ["p", "mb", "d", "e"] as const;
export type RoomClass = (typeof ROOM_CLASS_MARKERS)[number];

export interface RoomClasses {
  readonly markers: ReadonlySet<RoomClass>;
  readonly unlisted: boolean;
  readonly mailbox: boolean;
  readonly ownable: boolean;
  readonly ephemeral: boolean;
}

/** Parses the leading chain of `<class>-` markers; parsing stops at the body. */
export function parseRoomClasses(name: string): RoomClasses {
  assertProtocolName(name);
  const markers = new Set<RoomClass>();
  for (const segment of name.split("-").slice(0, -1)) {
    if (!ROOM_CLASS_MARKERS.includes(segment as RoomClass)) break;
    markers.add(segment as RoomClass);
  }
  return {
    markers,
    unlisted: markers.has("p"),
    mailbox: markers.has("mb"),
    ownable: markers.has("d"),
    ephemeral: markers.has("e"),
  };
}
