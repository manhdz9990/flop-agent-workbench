import { TECHNOCORE_ORIGIN } from "./types";

/**
 * V11-02 — Safe Public Room Discovery.
 *
 * This builder takes no parameters and accepts no caller input of any
 * kind. The destination is always exactly `GET https://technocore.chat/rooms`.
 * There is no room, query, or path segment for a caller to influence — the
 * origin, host, and path are all hard-coded constants.
 */
export function buildRoomsDiscoveryUrl(): URL {
  return new URL("/rooms", TECHNOCORE_ORIGIN);
}
