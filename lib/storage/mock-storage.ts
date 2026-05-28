import type {
  PreviewKind,
  ReceiptMetadata,
  StorageAdapter,
  StoredEvidenceFile,
  StoredReceiptMetadata,
} from "@/lib/storage/types";

function safeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "evidence-file";
}

function previewKindFor(file: File): PreviewKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type.includes("pdf") ||
    file.type.includes("text") ||
    file.type.includes("markdown") ||
    file.name.endsWith(".md")
  ) {
    return "document";
  }

  return "file";
}

function makeEvidenceId(receiptId: string, fileName: string) {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return `${receiptId}-${safeFileName(fileName)}-${token}`;
}

export const mockStorage: StorageAdapter = {
  async uploadEvidenceFile(file, receiptId): Promise<StoredEvidenceFile> {
    const fileName = safeFileName(file.name);

    return {
      id: makeEvidenceId(receiptId, fileName),
      receiptId,
      fileName,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      storageProvider: "mock",
      storagePath: `mock://receipts/${receiptId}/evidence/${fileName}`,
      createdAt: new Date().toISOString(),
      previewKind: previewKindFor(file),
    };
  },

  async uploadReceiptMetadata(
    metadata: ReceiptMetadata,
  ): Promise<StoredReceiptMetadata> {
    return {
      receiptId: metadata.receiptId,
      storageProvider: "mock",
      storagePath: `mock://receipts/${metadata.receiptId}/metadata.json`,
      createdAt: new Date().toISOString(),
    };
  },
};
