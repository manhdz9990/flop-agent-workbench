import type { LocalIdentitySession, PublicIdentity } from "../identity";

export const MAX_IDENTITY_FILE_BYTES = 32 * 1024;
export type IdentityFormat = "WORKBENCH_BACKUP_V1" | "CRYPTOTELUGU_BACKUP_V4" | "PLAIN_SECRET_HEX";
export type Detection =
  | { readonly state: "SUPPORTED"; readonly format: IdentityFormat; readonly label: string; readonly requiresPassword: boolean }
  | { readonly state: "UNSUPPORTED"; readonly label: string }
  | { readonly state: "UNKNOWN"; readonly label: "Unknown identity format" };
export interface ImportedIdentityCandidate { readonly format: IdentityFormat; readonly publicIdentity: PublicIdentity; readonly session: LocalIdentitySession }
export class IdentityImportError extends Error { constructor(readonly code: string, message: string) { super(message); this.name = "IdentityImportError"; } }
