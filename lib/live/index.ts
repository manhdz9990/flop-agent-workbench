export { buildRoomReadUrl, InputValidationError, validateRoomName, validateSequence } from "./endpoint";
export { LiveResponseError, parseRoomReadJson } from "./parser";
export { readRoom } from "./reader";
export { LIVE_REQUEST_TIMEOUT_MS, LIVE_RESPONSE_MAX_BYTES, TECHNOCORE_ORIGIN } from "./types";
export type { LiveInspection, ReaderOptions, ReadResult, RoomReadPayload } from "./types";

// V11-02 — Safe Public Room Discovery.
export { buildRoomsDiscoveryUrl } from "./rooms-endpoint";
export { RoomsDiscoveryError, parseRoomsDiscoveryText } from "./rooms-parser";
export { readRoomsDiscovery } from "./rooms-reader";
export { DISCOVERY_MAX_OBSERVATIONS, DISCOVERY_RESPONSE_MAX_BYTES } from "./types";
export type { RoomObservation, RoomsDiscoveryPayload } from "./types";
