import type { Receipt } from "@/lib/mock-data";

const STORAGE_KEY = "receipts-network:receipts";
const LEGACY_STORAGE_KEY = "receipts-network:created-receipts";
const STORAGE_EVENT = "receipts-network-storage";
const EMPTY_RECEIPTS: Receipt[] = [];

let lastRaw: string | null = null;
let lastParsed: Receipt[] = EMPTY_RECEIPTS;

function readRawStorage() {
  if (typeof window === "undefined") {
    return "[]";
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    return raw;
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw !== null) {
    return legacyRaw;
  }

  return "[]";
}

export function getLocalReceiptsSnapshot(): Receipt[] {
  if (typeof window === "undefined") {
    return EMPTY_RECEIPTS;
  }

  const raw = readRawStorage();

  if (raw === lastRaw) {
    return lastParsed;
  }

  lastRaw = raw;

  try {
    const parsed = JSON.parse(raw);
    lastParsed = Array.isArray(parsed)
      ? dedupeReceipts((parsed as Receipt[]).map(sanitizeReceiptForStorage))
      : EMPTY_RECEIPTS;
  } catch {
    lastParsed = EMPTY_RECEIPTS;
  }

  return lastParsed;
}

export function subscribeToLocalReceipts(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function safeText(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.length > 2000
  ) {
    return fallback;
  }

  return value;
}

function previewKindFromType(fileType = "") {
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  if (
    fileType.includes("pdf") ||
    fileType.includes("text") ||
    fileType.includes("markdown")
  ) {
    return "document";
  }

  return "file";
}

function receiptTime(receipt: Receipt) {
  const time = receipt.createdAt ? new Date(receipt.createdAt).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function dedupeReceipts(receipts: Receipt[]) {
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const unique: Receipt[] = [];

  receipts
    .slice()
    .sort((a, b) => receiptTime(b) - receiptTime(a))
    .forEach((receipt) => {
      const contentKey = `${receipt.title.toLowerCase()}|${receipt.creator.toLowerCase()}|${receipt.createdAt ?? ""}`;

      if (seenIds.has(receipt.id) || seenContent.has(contentKey)) {
        return;
      }

      seenIds.add(receipt.id);
      seenContent.add(contentKey);
      unique.push(receipt);
    });

  return unique;
}

export function sanitizeReceiptForStorage(receipt: Receipt): Receipt {
  const receiptId = safeText(receipt.id, `rn-${Date.now().toString(36)}`);
  const createdAt = safeText(receipt.createdAt, new Date().toISOString());

  return {
    id: receiptId,
    title: safeText(receipt.title, "Untitled receipt"),
    category: receipt.category,
    creator: safeText(receipt.creator, "@creator"),
    timestamp: safeText(receipt.timestamp, "Local receipt"),
    description: safeText(receipt.description),
    source: safeText(receipt.source),
    tags: Array.isArray(receipt.tags)
      ? receipt.tags.map((tag) => safeText(tag)).filter(Boolean).slice(0, 24)
      : [],
    createdAt,
    metadataStorage: receipt.metadataStorage
      ? {
          receiptId,
          storageProvider: receipt.metadataStorage.storageProvider,
          storagePath: safeText(receipt.metadataStorage.storagePath),
          createdAt: safeText(receipt.metadataStorage.createdAt, createdAt),
        }
      : undefined,
    public: receipt.public !== false,
    isLocal: true,
    evidence: Array.isArray(receipt.evidence)
      ? receipt.evidence.map((item, index) => {
          const fileName =
            safeText(item.fileName) ||
            safeText(item.name) ||
            safeText(item.title, `Evidence ${index + 1}`);
          const fileType =
            safeText(item.fileType) ||
            safeText(item.mimeType) ||
            safeText(item.detail, "unknown");
          const fileSize =
            typeof item.fileSize === "number"
              ? item.fileSize
              : typeof item.size === "number"
                ? item.size
                : undefined;
          const previewKind = item.previewKind ?? previewKindFromType(fileType);

          return {
            id: safeText(item.id, `${receiptId}-ev-${index + 1}`),
            receiptId,
            title: fileName,
            type: item.type,
            detail: safeText(item.detail, fileType),
            fileName,
            fileType,
            fileSize,
            storageProvider: item.storageProvider ?? "mock",
            storagePath:
              safeText(item.storagePath) ||
              `mock://receipts/${receiptId}/evidence/${index + 1}`,
            publicUrl: safeText(item.publicUrl) || undefined,
            createdAt: safeText(item.createdAt, createdAt),
            previewKind,
          };
        })
      : [],
  };
}

export function saveLocalReceipt(receipt: Receipt): { ok: true } | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return { ok: false, error: "Local storage is not available on the server." };
  }

  const receipts = getLocalReceiptsSnapshot();
  const sanitizedReceipt = sanitizeReceiptForStorage(receipt);
  const next = [
    sanitizedReceipt,
    ...receipts.filter((item) => item.id !== sanitizedReceipt.id),
  ].slice(0, 24);
  const raw = JSON.stringify(next);

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.setItem(STORAGE_KEY, raw);
    lastRaw = raw;
    lastParsed = next;
  } catch {
    try {
      const fallback = JSON.stringify([sanitizedReceipt]);
      window.localStorage.setItem(STORAGE_KEY, fallback);
      lastRaw = fallback;
      lastParsed = [sanitizedReceipt];
    } catch {
      return {
        ok: false,
        error:
          "This browser storage is full. The receipt preview is still available, but it could not be saved locally.",
      };
    }
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
  return { ok: true };
}

export function getLocalReceiptById(id: string) {
  return getLocalReceiptsSnapshot().find((receipt) => receipt.id === id);
}

export function clearLocalReceipts() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  lastRaw = "[]";
  lastParsed = EMPTY_RECEIPTS;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
