import { NextResponse } from "next/server";

import { readRoomsDiscovery } from "../../../lib/live";

export const runtime = "nodejs";

/**
 * V11-02 — Safe Public Room Discovery.
 *
 * This route accepts no request body, no query parameters, and no path
 * parameters — there is nothing here for a caller to control. It always
 * performs exactly one bounded, fixed-destination read
 * (`GET https://technocore.chat/rooms`) and returns its result. It is a
 * manual, on-demand discovery endpoint, not a poller, crawler, or cache:
 * calling it again simply repeats the same single bounded read.
 */
export async function GET(): Promise<NextResponse> {
  const result = await readRoomsDiscovery();
  return NextResponse.json(result);
}
