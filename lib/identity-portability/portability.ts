import { base64urlnopad } from "@scure/base";
import { importEncryptedIdentity, importRawSeedIdentity, parseAgentBackup, type LocalIdentitySession } from "../identity";
import { IdentityImportError, MAX_IDENTITY_FILE_BYTES, type Detection, type ImportedIdentityCandidate } from "./types";

const encoder = new TextEncoder();
const B64U = /^[A-Za-z0-9_-]+$/;
const PKCS8_PREFIX = Uint8Array.from([0x30,0x2e,0x02,0x01,0x00,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x04,0x22,0x04,0x20]);
const CRYPTO_FORMAT = "cryptotelugu-technocore-browser-backup";

function assertSize(serialized: string): void { if (encoder.encode(serialized).length > MAX_IDENTITY_FILE_BYTES) throw new IdentityImportError("IDENTITY_FILE_TOO_LARGE", "Identity file exceeds the 32 KiB limit."); }
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new IdentityImportError("INVALID_IDENTITY_FILE", "Identity file has an invalid structure."); return value as Record<string, unknown>; }
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): void { const actual=Object.keys(value).sort(); const expected=[...keys].sort(); if(actual.length!==expected.length||actual.some((key,index)=>key!==expected[index])) throw new IdentityImportError("INVALID_IDENTITY_FILE", "Identity file has unexpected fields."); }
function decode(value: unknown, length: number): Uint8Array { if(typeof value!=="string"||value.length>512||!B64U.test(value)) throw new IdentityImportError("INVALID_IDENTITY_FILE", "Identity file contains invalid encoded data."); try { const bytes=base64urlnopad.decode(value); if(bytes.length!==length||base64urlnopad.encode(bytes)!==value) throw new Error(); return bytes; } catch { throw new IdentityImportError("INVALID_IDENTITY_FILE", "Identity file contains invalid encoded data."); } }
function parseJson(serialized: string): Record<string, unknown> | undefined { try { return object(JSON.parse(serialized)); } catch { return undefined; } }

export function detectIdentityFormat(serialized: string): Detection {
  assertSize(serialized);
  const trimmed = serialized.replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, "");
  if (/^[0-9A-Fa-f]{64}$/.test(trimmed)) return { state:"SUPPORTED", format:"PLAIN_SECRET_HEX", label:"Plain 32-byte Ed25519 Secret Key", requiresPassword:false };
  const parsed = parseJson(serialized);
  if (!parsed) return { state:"UNKNOWN", label:"Unknown identity format" };
  if (parsed.format === "technocore-agent-backup/v1") { try { parseAgentBackup(serialized); return { state:"SUPPORTED", format:"WORKBENCH_BACKUP_V1", label:"FLOP Agent Workbench Backup V1", requiresPassword:true }; } catch { return { state:"UNSUPPORTED", label:"FLOP Agent Workbench backup detected but invalid or unsupported" }; } }
  if (parsed.format === CRYPTO_FORMAT) {
    if (parsed.version !== 4 || parsed.algorithm !== "Ed25519") return { state:"UNSUPPORTED", label:"CryptoTelugu identity format detected but not supported yet" };
    return { state:"SUPPORTED", format:"CRYPTOTELUGU_BACKUP_V4", label:"CryptoTelugu Technocore browser backup V4", requiresPassword:true };
  }
  return { state:"UNKNOWN", label:"Unknown identity format" };
}

function plainSeed(serialized: string): Uint8Array {
  const trimmed=serialized.replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, "");
  if(!/^[0-9A-Fa-f]{64}$/.test(trimmed)) throw new IdentityImportError("INVALID_SECRET_KEY", "Secret Key file must contain exactly 64 hexadecimal characters and optional surrounding ASCII whitespace.");
  return Uint8Array.from(trimmed.toLowerCase().match(/../g)!, (pair)=>Number.parseInt(pair,16));
}

async function importCryptoTelugu(serialized: string, password: string): Promise<LocalIdentitySession> {
  const envelope=object(JSON.parse(serialized));
  exactKeys(envelope,["version","format","algorithm","did","publicKey","kdf","iterations","salt","iv","ciphertext"]);
  if(envelope.format!==CRYPTO_FORMAT||envelope.version!==4||envelope.algorithm!=="Ed25519"||envelope.kdf!=="PBKDF2-SHA256"||envelope.iterations!==250000) throw new IdentityImportError("UNSUPPORTED_IDENTITY_FORMAT","CryptoTelugu backup parameters are unsupported.");
  if(typeof envelope.did!=="string"||envelope.did.length>100) throw new IdentityImportError("INVALID_IDENTITY_FILE","CryptoTelugu Public DID is invalid.");
  const assertedPublic=decode(envelope.publicKey,32), salt=decode(envelope.salt,16), iv=decode(envelope.iv,12), ciphertext=decode(envelope.ciphertext,64);
  const passwordBytes=encoder.encode(password); if(passwordBytes.length<1||passwordBytes.length>1024) throw new IdentityImportError("INVALID_PASSWORD","Password must be between 1 and 1024 UTF-8 bytes.");
  let plaintext: Uint8Array|undefined;
  try {
    const material=await crypto.subtle.importKey("raw",Uint8Array.from(passwordBytes),"PBKDF2",false,["deriveKey"]);
    const key=await crypto.subtle.deriveKey({name:"PBKDF2",hash:"SHA-256",salt:Uint8Array.from(salt),iterations:250000},material,{name:"AES-GCM",length:256},false,["decrypt"]);
    plaintext=new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:Uint8Array.from(iv)},key,Uint8Array.from(ciphertext)));
  } catch { throw new IdentityImportError("IDENTITY_DECRYPTION_FAILED","Password is incorrect or the identity file is damaged."); }
  finally { passwordBytes.fill(0); }
  try {
    if(plaintext.length!==48||!PKCS8_PREFIX.every((byte,index)=>plaintext![index]===byte)) throw new IdentityImportError("INVALID_IDENTITY_KEY","Decrypted CryptoTelugu key is not the supported Ed25519 PKCS#8 representation.");
    const seed=plaintext.slice(16); let session: LocalIdentitySession;
    try { session=await importRawSeedIdentity(seed); } finally { seed.fill(0); }
    if(session.publicIdentity.did!==envelope.did||session.publicIdentity.publicKey!==base64urlnopad.encode(assertedPublic)){ session.lock(); throw new IdentityImportError("IDENTITY_MISMATCH","Imported key does not match the asserted Public DID and public key."); }
    return session;
  } finally { plaintext.fill(0); assertedPublic.fill(0); salt.fill(0); iv.fill(0); ciphertext.fill(0); }
}

export async function validateIdentityImport(serialized: string, password = ""): Promise<ImportedIdentityCandidate> {
  const detection=detectIdentityFormat(serialized); if(detection.state!=="SUPPORTED") throw new IdentityImportError("UNSUPPORTED_IDENTITY_FORMAT",detection.label);
  let session: LocalIdentitySession;
  if(detection.format==="WORKBENCH_BACKUP_V1") session=await importEncryptedIdentity(serialized,password);
  else if(detection.format==="CRYPTOTELUGU_BACKUP_V4") session=await importCryptoTelugu(serialized,password);
  else { const seed=plainSeed(serialized); try { session=await importRawSeedIdentity(seed); } finally { seed.fill(0); } }
  return { format:detection.format, publicIdentity:session.publicIdentity, session };
}

export function createSecretKeyText(secretHex: string): { readonly filename: "technocore-agent-secret.txt"; readonly content: string } {
  if(!/^[0-9a-f]{64}$/.test(secretHex)) throw new IdentityImportError("INVALID_SECRET_KEY","Secret Key must be exactly 64 lowercase hexadecimal characters.");
  return { filename:"technocore-agent-secret.txt", content:`${secretHex}\n` };
}
