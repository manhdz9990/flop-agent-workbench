import { NextResponse } from "next/server";

import { resolveInspectionInput, type InspectionInput } from "../../../lib/input";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 8 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ ok: false, error: { code: "INPUT_TOO_LARGE", message: "The inspection request is too large." } }, { status: 413 });
  }

  const raw = await readBoundedBody(request);
  if (raw === undefined) return NextResponse.json({ ok: false, error: { code: "INPUT_TOO_LARGE", message: "The inspection request is too large." } }, { status: 413 });

  let input: unknown;
  try { input = JSON.parse(raw); }
  catch { return NextResponse.json({ ok: false, error: { code: "MALFORMED_REQUEST", message: "The inspection request is not valid JSON." } }, { status: 400 }); }

  if (!isLiveInspection(input)) {
    return NextResponse.json({ ok: false, error: { code: "UNSUPPORTED_INPUT", message: "Only Room and Message reads are accepted by this endpoint." } }, { status: 400 });
  }
  return NextResponse.json(await resolveInspectionInput(input));
}

async function readBoundedBody(request: Request): Promise<string | undefined> {
  if (request.body === null) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) { await reader.cancel(); return undefined; }
      text += decoder.decode(value, { stream: true });
    }
  } catch { return ""; }
}

function isLiveInspection(value: unknown): value is Extract<InspectionInput, { kind: "ROOM" | "MESSAGE" }> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.kind === "ROOM") return typeof candidate.room === "string";
  return candidate.kind === "MESSAGE" && typeof candidate.room === "string" && typeof candidate.sequence === "string";
}
