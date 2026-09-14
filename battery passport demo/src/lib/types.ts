export type FieldStatus = "FOUND" | "MISSING" | "CONFLICT" | "APPROVED";
export type Visibility = "PUBLIC" | "RESTRICTED" | "AUTHORITY";

export interface RawDocument { id: string; name: string; type: string; size: string; url?: string }
export interface ExtractedCandidate { value: string; unit?: string; sourceDocument: string; sourcePage?: number; fragment: string; confidence: number }
export interface CanonicalBatteryField {
  id: string; name_ru: string; name_en: string; category: string; required: boolean;
  value: string | null; unit?: string; status: FieldStatus; sourceDocument?: string;
  sourcePage?: number; confidence?: number; approved: boolean; visibility: Visibility;
  fragment?: string; candidates?: ExtractedCandidate[];
}
export interface ApprovedDataset { version: string; approvedAt: string; battery: Record<string, unknown> }
export interface IndividualPassport {
  passportId: string; serialNumber: string; uniqueProductIdentifier: string; modelId: string;
  datasetVersion: string; createdAt: string; publicPassportUrl: string; registryStatus: "NOT_REGISTERED" | "DEMO_REGISTERED";
  registryId?: string;
}
export interface RegistryRecord { passportId: string; registrationId: string; status: "DEMO_REGISTERED"; registeredAt: string }

export interface BatteryDataExtractor { extract(documents: RawDocument[]): Promise<CanonicalBatteryField[]>; extractSupplierResponse(): Promise<Partial<Record<string, string>>> }
export interface SupplierCommunicationService { createRequest(fields: CanonicalBatteryField[]): string; simulateSend(): Promise<{ sentAt: string }> }
export interface DppProvider { createPassports(dataset: ApprovedDataset, quantity: number): Promise<IndividualPassport[]> }
export interface EuRegistryProvider { register(passports: IndividualPassport[]): Promise<RegistryRecord[]> }

export type DemoStage = "documents" | "analysis" | "missing" | "approval" | "dataset" | "dpp" | "registry" | "qr" | "dashboard";
export interface DemoState {
  stage: DemoStage; fields: CanonicalBatteryField[]; analyzed: boolean; supplierRequestCreated: boolean;
  supplierRequestSent: boolean; supplierResponseReceived: boolean; supplierResponseParsed: boolean;
  conflictResolved: boolean; approvedDataset: ApprovedDataset | null; passports: IndividualPassport[];
}
