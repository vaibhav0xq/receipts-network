import type {
  ReceiptMetadata,
  StorageAdapter,
  StoredEvidenceFile,
  StoredReceiptMetadata,
} from "@/lib/storage/types";

const SHELBY_NOT_CONFIGURED =
  "Shelby storage is not configured yet. Use mock mode until early access credentials are available.";

export const shelbyStorage: StorageAdapter = {
  async uploadEvidenceFile(
    file: File,
    receiptId: string,
  ): Promise<StoredEvidenceFile> {
    void file;
    void receiptId;
    // Connect the Shelby SDK upload flow here once early access credentials
    // and the final upload API are available.
    throw new Error(SHELBY_NOT_CONFIGURED);
  },

  async uploadReceiptMetadata(
    metadata: ReceiptMetadata,
  ): Promise<StoredReceiptMetadata> {
    void metadata;
    // Connect Shelby metadata persistence here after evidence upload succeeds.
    throw new Error(SHELBY_NOT_CONFIGURED);
  },
};
