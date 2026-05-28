export type StorageProviderName = "mock" | "shelby";

export type PreviewKind = "image" | "video" | "document" | "file";

export type StoredEvidenceFile = {
  id: string;
  receiptId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageProvider: StorageProviderName;
  storagePath: string;
  publicUrl?: string;
  previewUrl?: string;
  createdAt: string;
  previewKind: PreviewKind;
};

export type ReceiptMetadata = {
  receiptId: string;
  title: string;
  category: string;
  creator: string;
  source: string;
  description: string;
  tags: string[];
  evidenceCount: number;
  createdAt: string;
};

export type StoredReceiptMetadata = {
  receiptId: string;
  storageProvider: StorageProviderName;
  storagePath: string;
  createdAt: string;
};

export type StorageAdapter = {
  uploadEvidenceFile(
    file: File,
    receiptId: string,
  ): Promise<StoredEvidenceFile>;
  uploadReceiptMetadata(
    metadata: ReceiptMetadata,
  ): Promise<StoredReceiptMetadata>;
};
