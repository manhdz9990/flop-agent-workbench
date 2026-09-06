import type { EvidenceField, OperationalError, TrustReport } from "../domain";
import type { ReaderOptions } from "../live";

export type InspectionInput =
  | { readonly kind: "ROOM"; readonly room: string }
  | { readonly kind: "MESSAGE"; readonly room: string; readonly sequence: string }
  | { readonly kind: "DID"; readonly did: string }
  | { readonly kind: "EXPORT" };

export interface DidInspection {
  readonly report: TrustReport;
  readonly keyType?: "Ed25519";
  readonly publicKeyHex?: string;
  readonly meaning?: string;
}

export interface ResolvedLiveInspection {
  readonly report: TrustReport;
  readonly serverMetadata: readonly EvidenceField[];
}

export type InputResolution =
  | { readonly ok: true; readonly kind: "ROOM" | "MESSAGE"; readonly value: ResolvedLiveInspection }
  | { readonly ok: true; readonly kind: "DID"; readonly value: DidInspection }
  | { readonly ok: false; readonly error: OperationalError };

export interface ResolveOptions { readonly reader?: ReaderOptions }
