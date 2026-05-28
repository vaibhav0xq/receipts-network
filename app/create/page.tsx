"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CloudUpload,
  Copy,
  Eye,
  FileText,
  Hash,
  Link2,
  User,
} from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Navbar } from "@/components/Navbar";
import { categories, type Evidence, type Receipt, type ReceiptCategory } from "@/lib/mock-data";
import { formatFileSize, saveLocalReceipt } from "@/lib/local-receipts";
import { getStorageModeLabel, getStorageProvider } from "@/lib/storage";
import { createSupabaseReceipt } from "@/lib/supabase/receipts";

type Errors = Partial<Record<"title" | "category" | "creator" | "description", string>>;

function logDevError(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
}

function makeEvidenceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function evidenceTypeFor(file: File): Evidence["type"] {
  if (file.type.startsWith("image/")) return "Screenshot";
  if (file.type.startsWith("video/")) return "File";
  if (file.type.includes("pdf")) return "File";
  return "Archive";
}

function previewKindFor(file: File): Evidence["previewKind"] {
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

export default function CreateReceiptPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ReceiptCategory>("Scam Alert");
  const [creator, setCreator] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [createdReceiptId, setCreatedReceiptId] = useState("");
  const [createdReceiptUrl, setCreatedReceiptUrl] = useState("");
  const [hasPublished, setHasPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [supabaseWarning, setSupabaseWarning] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const evidenceRef = useRef<Evidence[]>([]);
  const successPanelRef = useRef<HTMLDivElement>(null);
  const submissionInFlightRef = useRef(false);
  const storageModeLabel = getStorageModeLabel();

  useEffect(() => {
    evidenceRef.current = evidence;
  }, [evidence]);

  useEffect(() => {
    return () => {
      evidenceRef.current.forEach((item) => {
        if (item.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean),
    [tags],
  );

  const previewReceipt: Receipt = {
    id: createdReceiptId || "rn-preview",
    title: title.trim() || "Untitled receipt draft",
    category,
    creator: creator.trim() || "@creator",
    timestamp: "Previewing now",
    createdAt: new Date().toISOString(),
    description:
      description.trim() ||
      "Add the context reviewers need: what happened, what proof is attached, and why it matters.",
    source: source.trim() || "Source URL or context will appear here",
    tags: parsedTags.length ? parsedTags : ["proof", "receipt"],
    evidence,
    public: true,
  };

  const totalSelectedSize = useMemo(
    () => evidence.reduce((sum, item) => sum + (item.fileSize ?? item.size ?? 0), 0),
    [evidence],
  );
  const largeSelection = totalSelectedSize > 25 * 1024 * 1024;

  function clearFieldError(field: keyof Errors) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateTitle(value: string) {
    setTitle(value);
    if (value.trim()) {
      clearFieldError("title");
    }
  }

  function updateCategory(value: ReceiptCategory) {
    setCategory(value);
    if (value) {
      clearFieldError("category");
    }
  }

  function updateCreator(value: string) {
    setCreator(value);
    if (value.trim()) {
      clearFieldError("creator");
    }
  }

  function updateDescription(value: string) {
    setDescription(value);
    if (value.trim()) {
      clearFieldError("description");
    }
  }

  function addFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const mapped = fileArray.map((file) => {
      const previewKind = previewKindFor(file);
      const previewUrl =
        previewKind === "image" ? URL.createObjectURL(file) : undefined;
      const id = makeEvidenceId();

      return {
        id,
        title: file.name,
        name: file.name,
        fileName: file.name,
        type: evidenceTypeFor(file),
        detail: `${file.type || "Unknown file"} - ${formatFileSize(file.size)}`,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageProvider: "mock",
        storagePath: `pending://local-session/${id}`,
        previewKind,
        previewUrl,
        file,
        createdAt: new Date().toISOString(),
      } satisfies Evidence;
    });

    setEvidence((current) => [...current, ...mapped]);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeEvidence(id: string | undefined) {
    setEvidence((current) => {
      const item = current.find((evidenceItem) => evidenceItem.id === id);
      if (item?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return current.filter((evidenceItem) => evidenceItem.id !== id);
    });
  }

  function validate() {
    const nextErrors: Errors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!category) nextErrors.category = "Category is required.";
    if (!creator.trim()) nextErrors.creator = "Creator handle is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function resetForm() {
    evidenceRef.current.forEach((item) => {
      if (item.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    setTitle("");
    setCategory("Scam Alert");
    setCreator("");
    setSource("");
    setDescription("");
    setTags("");
    setEvidence([]);
    setErrors({});
    setCreatedReceiptId("");
    setCreatedReceiptUrl("");
    setHasPublished(false);
    setIsPublishing(false);
    setPublishError("");
    setSupabaseWarning("");
    setCopied(false);
    submissionInFlightRef.current = false;
  }

  async function publishReceipt() {
    if (submissionInFlightRef.current || isPublishing || hasPublished) {
      return;
    }

    setPublishError("");
    setSupabaseWarning("");
    if (!validate()) return;

    submissionInFlightRef.current = true;
    setIsPublishing(true);
    await Promise.resolve();

    const now = new Date();
    const id = `rn-${now.getTime().toString(36)}`;
    const publicPath = `/r/${id}`;
    const fullUrl = `${window.location.origin}${publicPath}`;
    const storage = getStorageProvider();
    let uploadedEvidence: Evidence[];
    let metadataStorage: Receipt["metadataStorage"];

    try {
      uploadedEvidence = await Promise.all(
        evidence.map(async (item) => {
          const file = item.file;
          if (!file) {
            return item;
          }

          const stored = await storage.uploadEvidenceFile(file, id);

          return {
            ...item,
            id: stored.id,
            receiptId: stored.receiptId,
            title: stored.fileName,
            fileName: stored.fileName,
            fileType: stored.fileType,
            fileSize: stored.fileSize,
            mimeType: stored.fileType,
            size: stored.fileSize,
            storageProvider: stored.storageProvider,
            storagePath: stored.storagePath,
            publicUrl: stored.publicUrl,
            previewKind: stored.previewKind,
            createdAt: stored.createdAt,
            previewUrl: item.previewUrl,
            detail: `${stored.fileType} - ${formatFileSize(stored.fileSize)}`,
          } satisfies Evidence;
        }),
      );
      metadataStorage = await storage.uploadReceiptMetadata({
        receiptId: id,
        title: title.trim(),
        category,
        creator: creator.trim(),
        source: source.trim(),
        description: description.trim(),
        tags: parsedTags,
        evidenceCount: uploadedEvidence.length,
        createdAt: now.toISOString(),
      });
    } catch (error) {
      logDevError("Receipt storage adapter failed:", error);
      setPublishError(
        "Receipt could not be published right now. Please try again in local MVP mode.",
      );
      setIsPublishing(false);
      submissionInFlightRef.current = false;
      return;
    }
    const receipt: Receipt = {
      ...previewReceipt,
      id,
      timestamp: now.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      createdAt: now.toISOString(),
      evidence: uploadedEvidence,
      metadataStorage,
      isLocal: true,
    };

    try {
      const result = saveLocalReceipt(receipt);
      if (!result.ok) {
        logDevError("Local receipt save failed:", result.error);
        setPublishError(
          "This browser could not save the receipt locally. Please free up browser storage and try again.",
        );
        setIsPublishing(false);
        submissionInFlightRef.current = false;
        return;
      }
    } catch (error) {
      logDevError("Unexpected local receipt save failure:", error);
      setPublishError(
        "This browser could not save the receipt locally. Please try again.",
      );
      setIsPublishing(false);
      submissionInFlightRef.current = false;
      return;
    }

    try {
      const supabaseResult = await createSupabaseReceipt(receipt);
      if (!supabaseResult.ok) {
        logDevError("Remote receipt metadata sync failed:", supabaseResult.error);
        setSupabaseWarning(
          "Receipt saved locally. Remote sync is temporarily unavailable.",
        );
      }
    } catch (error) {
      logDevError("Remote receipt metadata sync failed:", error);
      setSupabaseWarning(
        "Receipt saved locally. Remote sync is temporarily unavailable.",
      );
    }

    setCreatedReceiptId(id);
    setCreatedReceiptUrl(fullUrl);
    setHasPublished(true);
    setIsPublishing(false);
    window.setTimeout(() => {
      successPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      successPanelRef.current?.focus();
    }, 50);
  }

  async function copyCreatedLink() {
    if (!createdReceiptUrl) return;
    await navigator.clipboard.writeText(createdReceiptUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0d0b]">
      <div className="receipt-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute right-[-18rem] top-20 h-[34rem] w-[34rem] rounded-full bg-[#f4c56f]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-14rem] h-96 w-96 rounded-full bg-[#6f3f1c]/25 blur-3xl" />
      <Navbar />

      <main className="relative mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4c56f]">
            Create receipt
          </p>
          <h1 className="mt-3 max-w-full text-4xl font-black tracking-tight text-stone-50 sm:text-6xl">
            Package proof into a polished public receipt.
          </h1>
          <p className="mt-5 text-base leading-8 text-stone-400">
            Shape the public page now. Evidence persistence will use Shelby hot
            storage when the adapter is connected.
          </p>
          <span className="mt-5 inline-flex rounded-full border border-[#f4c56f]/20 bg-[#f4c56f]/10 px-3 py-1 text-xs font-semibold text-[#f4c56f]">
            {storageModeLabel}
          </span>
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <form className="glass-panel min-w-0 rounded-3xl p-5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="min-w-0 sm:col-span-2">
                <span className="text-sm font-semibold text-stone-200">Title</span>
                <input
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  className="mt-2 w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-stone-50 outline-none transition placeholder:text-stone-600 focus:border-[#f4c56f]/45 focus:bg-white/[0.08]"
                  placeholder="What should this receipt prove?"
                />
                {errors.title ? <p className="mt-2 text-xs text-red-300">{errors.title}</p> : null}
              </label>

              <label className="min-w-0">
                <span className="text-sm font-semibold text-stone-200">Category</span>
                <select
                  value={category}
                  onChange={(event) => updateCategory(event.target.value as ReceiptCategory)}
                  className="mt-2 w-full min-w-0 rounded-2xl border border-white/10 bg-[#17120e] px-4 py-4 text-stone-50 outline-none transition focus:border-[#f4c56f]/45"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                {errors.category ? (
                  <p className="mt-2 text-xs text-red-300">{errors.category}</p>
                ) : null}
              </label>

              <label className="min-w-0">
                <span className="text-sm font-semibold text-stone-200">
                  Creator handle
                </span>
                <div className="mt-2 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 focus-within:border-[#f4c56f]/45">
                  <User className="h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                  <input
                    value={creator}
                    onChange={(event) => updateCreator(event.target.value)}
                    className="w-full min-w-0 bg-transparent text-stone-50 outline-none placeholder:text-stone-600"
                    placeholder="@yourhandle"
                  />
                </div>
                {errors.creator ? (
                  <p className="mt-2 text-xs text-red-300">{errors.creator}</p>
                ) : null}
              </label>

              <label className="min-w-0 sm:col-span-2">
                <span className="text-sm font-semibold text-stone-200">
                  Source URL or context
                </span>
                <div className="mt-2 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 focus-within:border-[#f4c56f]/45">
                  <Link2 className="h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                  <input
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    className="w-full min-w-0 bg-transparent text-stone-50 outline-none placeholder:text-stone-600"
                    placeholder="Paste a URL or describe where this came from"
                  />
                </div>
              </label>

              <label className="min-w-0 sm:col-span-2">
                <span className="text-sm font-semibold text-stone-200">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(event) => updateDescription(event.target.value)}
                  className="mt-2 min-h-36 w-full min-w-0 resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-stone-50 outline-none transition placeholder:text-stone-600 focus:border-[#f4c56f]/45 focus:bg-white/[0.08]"
                  placeholder="Add context, why it matters, what disappeared, and what reviewers should inspect."
                />
                {errors.description ? (
                  <p className="mt-2 text-xs text-red-300">{errors.description}</p>
                ) : null}
              </label>

              <label className="min-w-0 sm:col-span-2">
                <span className="text-sm font-semibold text-stone-200">Tags</span>
                <div className="mt-2 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 focus-within:border-[#f4c56f]/45">
                  <Hash className="h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    className="w-full min-w-0 bg-transparent text-stone-50 outline-none placeholder:text-stone-600"
                    placeholder="phishing, grant, beta-test, research"
                  />
                </div>
              </label>

              <div className="min-w-0 sm:col-span-2">
                <span className="text-sm font-semibold text-stone-200">
                  Evidence files
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,text/plain,text/markdown,video/*,.md"
                  onChange={onFileChange}
                  className="sr-only"
                />
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDrop}
                  className="mt-2 cursor-pointer rounded-3xl border border-dashed border-[#f4c56f]/35 bg-[#f4c56f]/[0.055] p-6 text-center transition hover:border-[#f4c56f]/60 hover:bg-[#f4c56f]/[0.08] sm:p-8"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#f4c56f]/25 bg-[#f4c56f]/10 text-[#f4c56f]">
                    <CloudUpload className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-base font-bold text-stone-50">
                    Drop files here or click to browse
                  </p>
                  <p className="mt-2 text-sm text-stone-400">
                    Images, PDFs, text, markdown, and videos are supported in this
                    frontend MVP.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#f4c56f]">
                    Frontend MVP stores file metadata only. Shelby storage will persist
                    actual evidence files.
                  </p>
                </div>

                {evidence.length ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-stone-400">
                    Selected {evidence.length} files, total{" "}
                    {formatFileSize(totalSelectedSize)}. Large files are allowed, but
                    only metadata is saved locally.
                  </div>
                ) : null}

                {largeSelection ? (
                  <div className="mt-3 rounded-2xl border border-[#f4c56f]/25 bg-[#f4c56f]/10 p-3 text-xs leading-5 text-[#f4c56f]">
                    Actual file persistence for selections above 25 MB requires the
                    Shelby storage adapter. Publishing will save metadata only.
                  </div>
                ) : null}

                {evidence.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {evidence.map((item, index) => (
                      <EvidenceCard
                        key={`${item.id}-${index}`}
                        evidence={item}
                        compact
                        onRemove={() => removeEvidence(item.id)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={publishReceipt}
              disabled={isPublishing || hasPublished}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f4c56f] px-6 py-4 text-sm font-black text-[#1d1308] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd98f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isPublishing
                ? "Publishing..."
                : hasPublished
                  ? "Receipt created - use actions below"
                  : "Publish mock receipt"}
              {hasPublished ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            {publishError ? (
              <p className="mt-3 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-200">
                {publishError}
              </p>
            ) : null}
            {supabaseWarning ? (
              <p className="mt-3 rounded-2xl border border-[#f4c56f]/25 bg-[#f4c56f]/10 p-3 text-sm text-[#f4c56f]">
                {supabaseWarning}
              </p>
            ) : null}
            {hasPublished ? (
              <div
                ref={successPanelRef}
                tabIndex={-1}
                className="gold-glow mt-5 rounded-3xl border border-[#f4c56f]/30 bg-[#f4c56f]/[0.08] p-5 outline-none sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-3xl font-black text-stone-50">
                      Receipt created
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-300">
                      Your public receipt is ready in local MVP mode.
                    </p>
                    <p className="mt-4 rounded-2xl border border-white/10 bg-[#0f0d0b]/60 p-3 break-all text-sm font-semibold text-[#f4c56f]">
                      /r/{createdReceiptId}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-stone-500">
                      This receipt is saved in this browser. Shelby persistence comes
                      next.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/r/${createdReceiptId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4c56f] px-4 py-3 text-sm font-black text-[#1d1308] transition hover:bg-[#ffd98f]"
                      >
                        View receipt
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={copyCreatedLink}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-stone-200 transition hover:border-[#f4c56f]/35 hover:text-[#f4c56f]"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                        {copied ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-stone-200 transition hover:border-[#f4c56f]/35 hover:text-[#f4c56f]"
                      >
                        Create another receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </form>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-28 xl:self-start">
            <div className="glass-panel min-w-0 rounded-3xl p-5 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f4c56f]">
                    Live preview
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-stone-50">
                    Public receipt card
                  </h2>
                </div>
                <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-[#f4c56f]">
                  <Eye className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <div className="min-w-0 rounded-3xl border border-white/10 bg-[#120f0c]/80 p-5">
                <CategoryBadge category={previewReceipt.category} />
                <h3 className="mt-5 break-words text-2xl font-black leading-tight text-stone-50">
                  {previewReceipt.title}
                </h3>
                <p className="mt-4 break-words text-sm leading-6 text-stone-400">
                  {previewReceipt.description}
                </p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-200">
                    <FileText className="h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                    Evidence stack
                  </div>
                  <div className="mt-4 grid gap-3">
                    {(previewReceipt.evidence.length
                      ? previewReceipt.evidence
                      : [
                          {
                            title: "Evidence will appear here",
                            type: "Archive" as const,
                            detail: "Upload files to populate this stack",
                          },
                        ]
                    )
                      .slice(0, 3)
                      .map((item, index) => (
                        <EvidenceCard key={`${item.title}-${index}`} evidence={item} compact />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
