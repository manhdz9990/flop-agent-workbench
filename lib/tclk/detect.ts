import type { VerificationState, Warning } from "../domain";
import type { TclkDetection, TclkEvidenceObservation, TclkFrameType, TclkRecordInput } from "./types";
import { TCLK_FRAME_TYPES, TCLK_MAX_FRAME_CHARS, TCLK_PREFIX } from "./types";

const DID = /^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44}$/u;
const HEX32 = /^0x[0-9a-f]{64}$/u;
const HEX33 = /^0x[0-9a-f]{66}$/u;
const SCALAR_HEX = /^0x(?:[0-9a-f]{2}){1,32}$/u;
const NONCE = /^[0-9a-f]{8,64}$/u;
const AMOUNT = /^[1-9][0-9]*$/u;
const ASSET = /^[A-Za-z0-9_-]{1,32}$/u;
const RAIL = /^[a-z0-9][a-z0-9._-]{0,63}$/u;
const FRAME_TYPES = new Set<string>(TCLK_FRAME_TYPES);
const P = (1n << 256n) - (1n << 32n) - 977n;

const WARNING: Warning = { code: "TCLK_COORDINATION_ONLY", message: "tclk/1-shaped activity detected. This describes protocol coordination only; it does not prove settlement or value transfer." };
const MALFORMED_WARNING: Warning = { code: "MALFORMED_TCLK_LOOKALIKE", message: "This message uses the tclk/1 prefix but does not match a supported official frame." };

const FIELDS: Record<TclkFrameType, { readonly allowed: readonly string[]; readonly required: readonly string[] }> = {
  offer: { allowed: ["type", "from", "role", "amount", "asset", "lock", "rails", "claimByMs", "refundAfterMs", "expiresMs", "paymentKey", "job", "nonce", "id"], required: ["type", "from", "role", "amount", "asset", "lock", "rails", "claimByMs", "refundAfterMs", "expiresMs", "nonce", "id"] },
  accept: { allowed: ["type", "from", "ref", "statement", "contract", "paymentKey", "nonce"], required: ["type", "from", "ref", "statement", "contract", "nonce"] },
  lock: { allowed: ["type", "from", "contract", "rail", "ref", "presig"], required: ["type", "from", "contract", "rail", "ref"] },
  reveal: { allowed: ["type", "from", "contract", "ref", "secret"], required: ["type", "from", "contract", "secret"] },
  refund: { allowed: ["type", "from", "contract", "ref", "reason"], required: ["type", "from", "contract"] },
  cancel: { allowed: ["type", "from", "contract", "reason"], required: ["type", "from", "contract"] },
  receipt: { allowed: ["type", "from", "contract", "outcome", "rail", "ref"], required: ["type", "from", "contract", "outcome"] },
  heartbeat: { allowed: ["type", "from", "contract", "nonce", "note"], required: ["type", "from", "contract", "nonce"] },
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const validString = (value: unknown, pattern?: RegExp): value is string => typeof value === "string" && value.length > 0 && (pattern === undefined || pattern.test(value));
const validMs = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;

function powMod(base: bigint, exponent: bigint): bigint {
  let result = 1n;
  let value = base % P;
  let power = exponent;
  while (power > 0n) {
    if ((power & 1n) === 1n) result = (result * value) % P;
    value = (value * value) % P;
    power >>= 1n;
  }
  return result;
}

function validPoint(value: unknown): value is string {
  if (!validString(value, HEX33) || (value.slice(2, 4) !== "02" && value.slice(2, 4) !== "03")) return false;
  const x = BigInt(`0x${value.slice(4)}`);
  if (x >= P) return false;
  const rhs = (x * x % P * x + 7n) % P;
  const y = powMod(rhs, (P + 1n) / 4n);
  return y * y % P === rhs;
}

function keysValid(frame: Record<string, unknown>, type: TclkFrameType): boolean {
  const schema = FIELDS[type];
  return Object.keys(frame).every((key) => schema.allowed.includes(key)) && schema.required.every((key) => frame[key] !== undefined);
}

function jobValid(value: unknown): boolean {
  if (!isObject(value) || !Object.keys(value).every((key) => ["proto", "id", "context"].includes(key))) return false;
  return validString(value.proto, /^[a-z0-9][a-z0-9._-]{0,31}$/u) && validString(value.id) && (value.context === undefined || validString(value.context));
}

function commonValid(frame: Record<string, unknown>): frame is Record<string, unknown> & { type: TclkFrameType; from: string } {
  return typeof frame.type === "string" && FRAME_TYPES.has(frame.type) && keysValid(frame, frame.type as TclkFrameType) && validString(frame.from, DID);
}

function structurallyValid(frame: Record<string, unknown> & { type: TclkFrameType; from: string }): boolean {
  switch (frame.type) {
    case "offer": {
      if (frame.role !== "payer" && frame.role !== "payee") return false;
      if (!validString(frame.amount, AMOUNT) || !validString(frame.asset, ASSET) || (frame.lock !== "hash" && frame.lock !== "point")) return false;
      if (!Array.isArray(frame.rails) || frame.rails.length === 0 || !frame.rails.every((rail) => validString(rail, RAIL))) return false;
      if (!validMs(frame.claimByMs) || !validMs(frame.refundAfterMs) || !validMs(frame.expiresMs) || frame.claimByMs >= frame.refundAfterMs) return false;
      if (frame.paymentKey !== undefined && !validPoint(frame.paymentKey)) return false;
      if (frame.lock === "point" && frame.paymentKey === undefined) return false;
      return (frame.job === undefined || jobValid(frame.job)) && validString(frame.nonce, NONCE) && validString(frame.id, HEX32);
    }
    case "accept": return validString(frame.ref, HEX32) && validString(frame.statement, /^0x(?:[0-9a-f]{64}|[0-9a-f]{66})$/u) && validString(frame.contract, HEX32) && (frame.paymentKey === undefined || validPoint(frame.paymentKey)) && validString(frame.nonce, NONCE);
    case "lock": {
      if (!validString(frame.contract, HEX32) || !validString(frame.rail, RAIL) || !validString(frame.ref)) return false;
      if (frame.presig === undefined) return true;
      return isObject(frame.presig) && Object.keys(frame.presig).length === 2 && validString(frame.presig.nonce, HEX33) && validString(frame.presig.s, SCALAR_HEX);
    }
    case "reveal": return validString(frame.contract, HEX32) && (frame.ref === undefined || validString(frame.ref)) && validString(frame.secret, HEX32);
    case "refund": return validString(frame.contract, HEX32) && (frame.ref === undefined || validString(frame.ref)) && (frame.reason === undefined || validString(frame.reason));
    case "cancel": return validString(frame.contract, HEX32) && (frame.reason === undefined || validString(frame.reason));
    case "receipt": return validString(frame.contract, HEX32) && ["claimed", "refunded", "cancelled"].includes(String(frame.outcome)) && (frame.rail === undefined || validString(frame.rail, RAIL)) && (frame.ref === undefined || validString(frame.ref));
    case "heartbeat": return validString(frame.contract, HEX32) && validString(frame.nonce, NONCE) && (frame.note === undefined || validString(frame.note));
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function asciiJson(value: unknown): string {
  return canonicalJson(value).replace(/[\u0080-\uffff]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

async function offerIdValid(frame: Readonly<Record<string, unknown>>): Promise<boolean> {
  const { id, ...fields } = frame;
  if (!validString(id, HEX32)) return false;
  const bytes = new TextEncoder().encode(`FLOP::tclk::v1|offer|${asciiJson(fields)}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const expected = `0x${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  return id === expected;
}

const EXPLANATIONS: Record<TclkFrameType, string> = {
  offer: "Observed an offer coordination frame with caller-stated terms.",
  accept: "Observed an acceptance coordination frame referencing an offer.",
  lock: "Observed a lock announcement containing a caller-stated rail reference; rail state was not checked.",
  reveal: "Observed a reveal coordination frame containing caller-provided witness data.",
  refund: "Observed a refund coordination frame; external rail behavior was not checked.",
  cancel: "Observed a cancellation coordination frame.",
  receipt: "Observed a post-terminal acknowledgement frame; its outcome is a caller-controlled claim, not economic-finality evidence.",
  heartbeat: "Observed a heartbeat coordination frame; it does not change or prove contract state.",
};

export async function detectTclkFrame(text: string): Promise<TclkDetection> {
  if (!text.startsWith(TCLK_PREFIX)) return { status: "NOT_TCLK" };
  if (text.length > TCLK_MAX_FRAME_CHARS) return { status: "MALFORMED_TCLK", warning: MALFORMED_WARNING };
  let parsed: unknown;
  try { parsed = JSON.parse(text.slice(TCLK_PREFIX.length)); } catch { return { status: "MALFORMED_TCLK", warning: MALFORMED_WARNING }; }
  if (!isObject(parsed) || !commonValid(parsed) || !structurallyValid(parsed)) return { status: "MALFORMED_TCLK", warning: MALFORMED_WARNING };
  if (parsed.type === "offer" && !(await offerIdValid(parsed))) return { status: "MALFORMED_TCLK", warning: MALFORMED_WARNING };
  return { status: "RECOGNIZED", frameType: parsed.type, frame: parsed, explanation: EXPLANATIONS[parsed.type], warning: WARNING };
}

export async function analyzeTclkRecord(record: TclkRecordInput, verificationState: VerificationState): Promise<TclkEvidenceObservation> {
  const detection = await detectTclkFrame(record.text);
  if (detection.status !== "RECOGNIZED") return { detection, verificationState, authority: "UNTRUSTED_CALLER_DATA", transportAuthenticated: false };
  const frameFrom = detection.frame.from;
  const transportAuthenticated = verificationState === "VALID" && frameFrom === record.from;
  return {
    detection,
    verificationState,
    authority: "UNTRUSTED_CALLER_DATA",
    transportAuthenticated,
    ...(!transportAuthenticated ? { transportWarning: { code: "TCLK_TRANSPORT_NOT_AUTHENTICATED", message: "The recognized frame is not authenticated by a matching VALID Technocore record; its structure does not make it trusted." } } : {}),
  };
}
