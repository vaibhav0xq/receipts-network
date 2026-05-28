"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Check,
  ExternalLink,
  FileCheck2,
  Paperclip,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Navbar } from "@/components/Navbar";
import { receipts, type Receipt } from "@/lib/mock-data";
import {
  getLocalReceiptById,
  getLocalReceiptsSnapshot,
  isValidUrl,
  subscribeToLocalReceipts,
} from "@/lib/local-receipts";
import { getSupabaseReceiptById } from "@/lib/supabase/receipts";

type PublicReceiptClientProps = {
  id?: string;
};

const EMPTY_LOCAL_RECEIPTS: Receipt[] = [];

function getEmptyLocalReceiptsSnapshot() {
  return EMPTY_LOCAL_RECEIPTS;
}

function subscribeToHydration() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

function logDevError(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
}

function formatCreatedAt(receipt: Receipt) {
  const date = receipt.createdAt ? new Date(receipt.createdAt) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return receipt.timestamp;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PublicReceiptClient({ id }: PublicReceiptClientProps) {
  const params = useParams<{ id?: string }>();
  const receiptId = id ?? params.id ?? "rn-1048";
  const [supabaseReceipt, setSupabaseReceipt] = useState<Receipt | null>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const localReceipts = useSyncExternalStore<Receipt[]>(
    subscribeToLocalReceipts,
    mounted ? getLocalReceiptsSnapshot : getEmptyLocalReceiptsSnapshot,
    getEmptyLocalReceiptsSnapshot,
  );

  const receipt = useMemo(
    () =>
      (mounted ? getLocalReceiptById(receiptId) : undefined) ??
      localReceipts.find((item) => item.id === receiptId) ??
      supabaseReceipt ??
      receipts.find((item) => item.id === receiptId) ??
      receipts[0],
    [localReceipts, mounted, receiptId, supabaseReceipt],
  );

  useEffect(() => {
    if (!mounted || localReceipts.some((item) => item.id === receiptId)) {
      return;
    }

    let cancelled = false;

    async function loadSupabaseReceipt() {
      try {
        const nextReceipt = await getSupabaseReceiptById(receiptId);
        if (!cancelled) {
          setSupabaseReceipt(nextReceipt);
        }
      } catch (error) {
        logDevError("Remote receipt lookup failed:", error);
      }
    }

    void loadSupabaseReceipt();

    return () => {
      cancelled = true;
    };
  }, [localReceipts, mounted, receiptId]);

  const sourceIsUrl = isValidUrl(receipt.source);
  const createdAt = formatCreatedAt(receipt);
  const currentUrl =
    typeof window === "undefined" ? `/r/${receipt.id}` : window.location.href;

  async function shareReceipt() {
    const shareData = {
      title: receipt.title,
      text: `Receipt from Receipts Network: ${receipt.title}`,
      url: currentUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fall through to copy when share is cancelled or unavailable at runtime.
      }
    }

    await navigator.clipboard.writeText(currentUrl);
    setShareState("copied");
    window.setTimeout(() => setShareState("idle"), 1600);
  }

  const trustItems = [
    {
      label: "Timestamped",
      detail: createdAt,
      icon: CalendarClock,
    },
    {
      label: "Shelby-ready",
      detail: "Storage adapter prepared; Shelby upload pending",
      icon: FileCheck2,
    },
    {
      label: "Public receipt",
      detail: "Anyone with the link can view this receipt",
      icon: BadgeCheck,
    },
    {
      label: "Evidence attached",
      detail: `${receipt.evidence.length} evidence ${
        receipt.evidence.length === 1 ? "file" : "files"
      }`,
      icon: Paperclip,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0d0b]">
      <div className="receipt-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute right-[-18rem] top-16 h-[34rem] w-[34rem] rounded-full bg-[#f4c56f]/14 blur-3xl" />
      <Navbar />

      <main className="relative mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-stone-400 transition hover:text-[#f4c56f]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <section className="glass-panel min-w-0 rounded-3xl p-5 sm:p-8 lg:p-10">
          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-5xl">
              <CategoryBadge category={receipt.category} />
              <h1 className="mt-5 max-w-full break-words text-4xl font-black leading-tight tracking-tight text-stone-50 sm:text-6xl">
                {receipt.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-400">
                <span className="break-words font-bold text-stone-200">
                  {receipt.creator}
                </span>
                <span>{createdAt}</span>
                {receipt.isLocal ? (
                  <span className="rounded-full border border-[#f4c56f]/20 bg-[#f4c56f]/10 px-2 py-0.5 text-xs font-semibold text-[#f4c56f]">
                    Local receipt
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={shareReceipt}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f4c56f] px-5 py-3 text-sm font-black text-[#1d1308] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd98f]"
            >
              {shareState === "copied" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden="true" />
              )}
              {shareState === "copied" ? "Link copied" : "Share"}
            </button>
          </div>

          <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[1fr_24rem]">
            <div className="min-w-0 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#120f0c]/78 p-5 sm:p-6">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#f4c56f]">
                  Receipt description
                </h2>
                <p className="mt-4 break-words text-base leading-8 text-stone-300">
                  {receipt.description}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#f4c56f]">
                  Source URL / context
                </h2>
                <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-[#f4c56f]/15 bg-[#f4c56f]/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                  {sourceIsUrl ? (
                    <a
                      href={receipt.source}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 break-all text-sm font-semibold text-stone-100 transition hover:text-[#f4c56f]"
                    >
                      {receipt.source}
                    </a>
                  ) : (
                    <p className="min-w-0 break-words text-sm font-semibold text-stone-200">
                      {receipt.source}
                    </p>
                  )}
                  {sourceIsUrl ? (
                    <ExternalLink
                      className="h-4 w-4 shrink-0 text-[#f4c56f]"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#f4c56f]">
                  Evidence
                </h2>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(receipt.evidence.length
                    ? receipt.evidence
                    : [
                        {
                          title: "No evidence attached",
                          type: "Archive" as const,
                          detail: "This receipt was created without files",
                        },
                      ]
                  ).map((evidence, index) => (
                    <EvidenceCard key={`${evidence.title}-${index}`} evidence={evidence} />
                  ))}
                </div>
              </div>
            </div>

            <aside className="min-w-0 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
                <div className="flex items-center gap-2 text-sm font-black text-stone-50">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                  Trust panel
                </div>
                <div className="mt-5 grid gap-3">
                  {trustItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-[#0f0d0b]/55 p-3"
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-stone-100">{item.label}</p>
                          <p className="mt-1 break-words text-xs leading-5 text-stone-400">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-[#f4c56f]/18 bg-[#f4c56f]/[0.06] p-5">
                <h2 className="text-sm font-black text-stone-50">
                  Shelby-ready storage references
                </h2>
                <p className="mt-3 text-xs leading-5 text-stone-400">
                  Frontend MVP data is stored locally. Evidence persistence will use
                  Shelby hot storage when the upload adapter is connected.
                </p>
                <div className="mt-4 space-y-3 text-xs text-stone-400">
                  <p className="break-all">
                    metadata:{" "}
                    {receipt.metadataStorage?.storagePath ??
                      `mock://receipts/${receipt.id}/metadata.json`}
                  </p>
                  <p className="break-all">
                    provider: {receipt.metadataStorage?.storageProvider ?? "mock"}
                  </p>
                  {receipt.evidence.slice(0, 3).map((item) => (
                    <p key={item.id ?? item.title} className="break-all">
                      evidence: {item.storagePath ?? `mock://receipts/${receipt.id}/evidence`}
                    </p>
                  ))}
                  <p className="break-all">proof://pending-shelby-anchor</p>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap gap-2">
                {receipt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="max-w-full break-words rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-semibold text-stone-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
