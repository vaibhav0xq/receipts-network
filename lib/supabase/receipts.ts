import type { Evidence, Receipt } from "@/lib/mock-data";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const RECEIPTS_TABLE = "receipts";
const EVIDENCE_TABLE = "receipt_evidence";
const TAGS_TABLE = "receipt_tags";

type ReceiptRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  creator_handle: string;
  source_context: string | null;
  is_public: boolean | null;
  storage_provider: string | null;
  metadata_storage_path: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type EvidenceRow = {
  id: string;
  receipt_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  preview_kind: Evidence["previewKind"] | null;
  storage_provider: Evidence["storageProvider"] | null;
  storage_path: string;
  public_url: string | null;
  created_at: string | null;
};

type TagRow = {
  receipt_id: string;
  tag: string;
};

function toReceiptRow(receipt: Receipt): ReceiptRow {
  const now = new Date().toISOString();

  return {
    id: receipt.id,
    title: receipt.title,
    description: receipt.description,
    category: receipt.category,
    creator_handle: receipt.creator,
    source_context: receipt.source || null,
    is_public: receipt.public !== false,
    storage_provider: receipt.metadataStorage?.storageProvider ?? "mock",
    metadata_storage_path:
      receipt.metadataStorage?.storagePath ??
      `mock://receipts/${receipt.id}/metadata.json`,
    created_at: receipt.createdAt ?? now,
    updated_at: now,
  };
}

function toEvidenceRows(receipt: Receipt): EvidenceRow[] {
  return receipt.evidence.map((item, index) => ({
    id: item.id ?? `${receipt.id}-evidence-${index + 1}`,
    receipt_id: receipt.id,
    file_name: item.fileName ?? item.name ?? item.title,
    file_type: item.fileType ?? item.mimeType ?? item.detail,
    file_size: item.fileSize ?? item.size ?? 0,
    preview_kind: item.previewKind ?? null,
    storage_provider: item.storageProvider ?? "mock",
    storage_path:
      item.storagePath ??
      `mock://receipts/${receipt.id}/evidence/${index + 1}`,
    public_url: item.publicUrl ?? null,
    created_at: item.createdAt ?? receipt.createdAt ?? new Date().toISOString(),
  }));
}

function toTagRows(receipt: Receipt): TagRow[] {
  return receipt.tags.map((tag) => ({
    receipt_id: receipt.id,
    tag,
  }));
}

function fromRows(
  receiptRow: ReceiptRow,
  evidenceRows: EvidenceRow[] = [],
  tagRows: TagRow[] = [],
): Receipt {
  return {
    id: receiptRow.id,
    title: receiptRow.title,
    description: receiptRow.description,
    category: receiptRow.category as Receipt["category"],
    creator: receiptRow.creator_handle,
    source: receiptRow.source_context ?? "",
    tags: tagRows.map((row) => row.tag),
    evidence: evidenceRows.map((row) => ({
      id: row.id,
      receiptId: row.receipt_id,
      title: row.file_name,
      type: row.preview_kind === "image" ? "Screenshot" : "File",
      detail: `${row.file_type} - ${row.file_size} bytes`,
      fileName: row.file_name,
      fileType: row.file_type,
      fileSize: row.file_size,
      storageProvider: row.storage_provider ?? "mock",
      storagePath: row.storage_path,
      publicUrl: row.public_url ?? undefined,
      previewKind: row.preview_kind ?? "file",
      createdAt: row.created_at ?? undefined,
    })),
    metadataStorage: {
      receiptId: receiptRow.id,
      storageProvider:
        receiptRow.storage_provider === "shelby" ? "shelby" : "mock",
      storagePath:
        receiptRow.metadata_storage_path ??
        `mock://receipts/${receiptRow.id}/metadata.json`,
      createdAt: receiptRow.created_at ?? new Date().toISOString(),
    },
    createdAt: receiptRow.created_at ?? undefined,
    timestamp: receiptRow.created_at ?? "Remote receipt",
    public: receiptRow.is_public !== false,
  };
}

function isDuplicateInsertError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "23505" || message.includes("duplicate key");
}

function logRemoteError(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
}

export async function createSupabaseReceipt(receipt: Receipt): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return { ok: true, skipped: true };
  }

  const { error: receiptError } = await supabase
    .from(RECEIPTS_TABLE)
    .insert(toReceiptRow(receipt));

  if (receiptError) {
    if (isDuplicateInsertError(receiptError)) {
      return { ok: true, skipped: true };
    }

    logRemoteError("Receipt insert failed:", receiptError);
    return {
      ok: false,
      error: "Remote sync is temporarily unavailable.",
    };
  }

  const evidenceRows = toEvidenceRows(receipt);
  if (evidenceRows.length) {
    const { error: evidenceError } = await supabase
      .from(EVIDENCE_TABLE)
      .insert(evidenceRows);

    if (evidenceError) {
      if (!isDuplicateInsertError(evidenceError)) {
        logRemoteError("Evidence insert failed:", evidenceError);
        return {
          ok: false,
          error: "Remote sync is temporarily unavailable.",
        };
      }
    }
  }

  const tagRows = toTagRows(receipt);
  if (tagRows.length) {
    const { error: tagsError } = await supabase
      .from(TAGS_TABLE)
      .insert(tagRows);

    if (tagsError) {
      if (!isDuplicateInsertError(tagsError)) {
        logRemoteError("Tag insert failed:", tagsError);
        return {
          ok: false,
          error: "Remote sync is temporarily unavailable.",
        };
      }
    }
  }

  return { ok: true };
}

export async function getSupabaseReceiptById(id: string) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: receiptRow, error: receiptError } = await supabase
    .from(RECEIPTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle<ReceiptRow>();

  if (receiptError || !receiptRow) {
    if (receiptError) {
      logRemoteError("Remote receipt lookup failed:", receiptError);
    }
    return null;
  }

  const [{ data: evidenceRows }, { data: tagRows }] = await Promise.all([
    supabase
      .from(EVIDENCE_TABLE)
      .select("*")
      .eq("receipt_id", id)
      .returns<EvidenceRow[]>(),
    supabase
      .from(TAGS_TABLE)
      .select("*")
      .eq("receipt_id", id)
      .returns<TagRow[]>(),
  ]);

  return fromRows(receiptRow, evidenceRows ?? [], tagRows ?? []);
}

export async function listSupabaseReceipts() {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: receiptRows, error } = await supabase
    .from(RECEIPTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .returns<ReceiptRow[]>();

  if (error || !receiptRows?.length) {
    if (error) {
      logRemoteError("Remote receipt list failed:", error);
    }
    return [];
  }

  const receiptIds = receiptRows.map((row) => row.id);
  const [{ data: evidenceRows }, { data: tagRows }] = await Promise.all([
    supabase
      .from(EVIDENCE_TABLE)
      .select("*")
      .in("receipt_id", receiptIds)
      .returns<EvidenceRow[]>(),
    supabase
      .from(TAGS_TABLE)
      .select("*")
      .in("receipt_id", receiptIds)
      .returns<TagRow[]>(),
  ]);

  return receiptRows.map((row) =>
    fromRows(
      row,
      (evidenceRows ?? []).filter((item) => item.receipt_id === row.id),
      (tagRows ?? []).filter((item) => item.receipt_id === row.id),
    ),
  );
}
