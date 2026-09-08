import { describe, expect, it } from "vitest";
import { generateLocalIdentity } from "../../lib/identity";
import { loadPersistentAgent, parsePersistentAgent, PERSISTENT_AGENT_SCHEMA, PERSISTENT_AGENT_STORAGE_KEY, removePersistentAgent, savePersistentAgent, type StorageLike } from "../../lib/persistent-agent";

class MemoryStorage implements StorageLike {
  value: string | null = null;
  getItem(key: string) { return key === PERSISTENT_AGENT_STORAGE_KEY ? this.value : null; }
  setItem(key: string, value: string) { if (key === PERSISTENT_AGENT_STORAGE_KEY) this.value = value; }
  removeItem(key: string) { if (key === PERSISTENT_AGENT_STORAGE_KEY) this.value = null; }
}

async function fixture() {
  const identity = await generateLocalIdentity();
  const encryptedBackup = await identity.createEncryptedBackup("correct horse battery staple");
  return { schema: PERSISTENT_AGENT_SCHEMA, encryptedBackup, publicIdentity: identity.publicIdentity, backupVerificationStatus: identity.backupVerificationStatus, evidence: [] } as const;
}

describe("persistent Agent boundary", () => {
  it("round-trips the encrypted backup and public identity", async () => { const storage = new MemoryStorage(); const value = await fixture(); savePersistentAgent(storage, value); expect(loadPersistentAgent(storage)?.publicIdentity).toEqual(value.publicIdentity); });
  it("stores ciphertext but not the Backup Password", async () => { const storage = new MemoryStorage(); savePersistentAgent(storage, await fixture()); expect(storage.value).toContain("ciphertext"); expect(storage.value).not.toContain("correct horse battery staple"); });
  it("does not store a plaintext secret field", async () => { const storage = new MemoryStorage(); savePersistentAgent(storage, await fixture()); expect(storage.value).not.toContain("secretKey"); expect(storage.value).not.toContain("seed"); });
  it("returns undefined when nothing is saved", () => expect(loadPersistentAgent(new MemoryStorage())).toBeUndefined());
  it("removes the canonical record", async () => { const storage = new MemoryStorage(); savePersistentAgent(storage, await fixture()); removePersistentAgent(storage); expect(loadPersistentAgent(storage)).toBeUndefined(); });
  it.each(["", "null", "[]", "{}", "not-json"])("rejects malformed root %s", (value) => expect(() => parsePersistentAgent(value)).toThrow());
  it("rejects an unknown schema", async () => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, schema: "future" }))).toThrow(); });
  it("rejects a missing encrypted backup", async () => { const source = await fixture(); const value = { schema: source.schema, publicIdentity: source.publicIdentity, backupVerificationStatus: source.backupVerificationStatus, evidence: source.evidence }; expect(() => parsePersistentAgent(JSON.stringify(value))).toThrow(); });
  it("rejects a public DID different from the backup DID", async () => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, publicIdentity: { ...value.publicIdentity, did: `${value.publicIdentity.did}x` } }))).toThrow(); });
  it("rejects a missing public key", async () => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, publicIdentity: { did: value.publicIdentity.did } }))).toThrow(); });
  it("rejects non-array evidence", async () => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, evidence: {} }))).toThrow(); });
  it("rejects excessive evidence", async () => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, evidence: Array(251).fill({}) }))).toThrow(); });
  it("accepts a bounded valid public profile", async () => { const value = await fixture(); const parsed = parsePersistentAgent(JSON.stringify({ ...value, profile: { displayName: "FLOP Agent", xUsername: "flop_agent", description: "Public profile" } })); expect(parsed.profile?.displayName).toBe("FLOP Agent"); });
  it.each([{ displayName: "" }, { displayName: "x".repeat(49) }, { displayName: "ok", xUsername: "bad-name" }, { displayName: "ok", description: "x".repeat(161) }])("rejects invalid profile %#", async (profile) => { const value = await fixture(); expect(() => parsePersistentAgent(JSON.stringify({ ...value, profile }))).toThrow(); });
  it("rejects verified evidence attributed to another DID", async () => { const value = await fixture(); const evidence = [{ id:"1",source:"READBACK_VERIFIED",verdict:"VALID",room:"lobby",writer:"did:key:z6Mkother",text:"hello",observationState:"PUBLISHED_AND_VERIFIED" }]; expect(() => parsePersistentAgent(JSON.stringify({ ...value, evidence }))).toThrow(); });
  it("rejects non-VALID verified evidence", async () => { const value = await fixture(); const evidence = [{ id:"1",source:"READBACK_VERIFIED",verdict:"INVALID",room:"lobby",writer:value.publicIdentity.did,text:"hello",observationState:"PUBLISHED_AND_VERIFIED" }]; expect(() => parsePersistentAgent(JSON.stringify({ ...value, evidence }))).toThrow(); });
  it("rejects oversized saved state before parsing", () => expect(() => parsePersistentAgent(" ".repeat(256 * 1024 + 1))).toThrow());
});
