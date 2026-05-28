"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Archive, FileText, Layers3, Search, ShieldCheck } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Navbar } from "@/components/Navbar";
import { ReceiptCard } from "@/components/ReceiptCard";
import { categories, receipts, type Receipt } from "@/lib/mock-data";
import {
  clearLocalReceipts,
  getLocalReceiptsSnapshot,
  subscribeToLocalReceipts,
} from "@/lib/local-receipts";
import { listSupabaseReceipts } from "@/lib/supabase/receipts";

const statIcons = {
  "Total receipts": FileText,
  "Public receipts": ShieldCheck,
  "Evidence files": Archive,
  Categories: Layers3,
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

function receiptTime(receipt: Receipt) {
  const time = receipt.createdAt ? new Date(receipt.createdAt).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function dedupeById(receiptsToDedupe: Receipt[]) {
  const byId = new Map<string, Receipt>();

  receiptsToDedupe.forEach((receipt) => {
    if (!byId.has(receipt.id)) {
      byId.set(receipt.id, receipt);
    }
  });

  return Array.from(byId.values()).sort((a, b) => receiptTime(b) - receiptTime(a));
}

export default function DashboardPage() {
  const [supabaseReceipts, setSupabaseReceipts] = useState<Receipt[]>([]);
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const localReceipts = useSyncExternalStore<Receipt[]>(
    subscribeToLocalReceipts,
    mounted ? getLocalReceiptsSnapshot : getEmptyLocalReceiptsSnapshot,
    getEmptyLocalReceiptsSnapshot,
  );

  const allReceipts = useMemo(
    () => dedupeById([...localReceipts, ...supabaseReceipts, ...receipts]),
    [localReceipts, supabaseReceipts],
  );

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let cancelled = false;

    async function loadSupabaseReceipts() {
      try {
        const nextReceipts = await listSupabaseReceipts();
        if (!cancelled) {
          setSupabaseReceipts(nextReceipts);
        }
      } catch (error) {
        logDevError("Remote receipt list sync failed:", error);
      } finally {
        if (!cancelled) {
          setSupabaseLoaded(true);
        }
      }
    }

    void loadSupabaseReceipts();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const stats = useMemo(() => {
    const uniqueCategories = new Set(allReceipts.map((receipt) => receipt.category));

    return [
      { label: "Total receipts", value: allReceipts.length },
      {
        label: "Public receipts",
        value: allReceipts.filter((receipt) => receipt.public !== false).length,
      },
      {
        label: "Evidence files",
        value: allReceipts.reduce((sum, receipt) => sum + receipt.evidence.length, 0),
      },
      { label: "Categories", value: uniqueCategories.size },
    ];
  }, [allReceipts]);

  function clearLocalDemoReceipts() {
    if (
      window.confirm(
        "Clear local demo receipts saved in this browser? Mock demo receipts will remain.",
      )
    ) {
      clearLocalReceipts();
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0d0b]">
      <div className="receipt-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute left-1/3 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[#f4c56f]/14 blur-3xl" />
      <Navbar />

      <main className="relative mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4c56f]">
                Dashboard
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-stone-400">
                {mounted && supabaseLoaded
                  ? "Demo, local, and remote metadata"
                  : "Loading receipt metadata..."}
              </span>
            </div>
            <h1 className="mt-3 max-w-full text-4xl font-black tracking-tight text-stone-50 sm:text-6xl">
              Receipt command center.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-400">
              Monitor public proof pages, evidence counts, categories, and shareable
              links from one premium workspace.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#f4c56f]" aria-hidden="true" />
            <span className="min-w-0 truncate text-sm text-stone-500">
              Search receipts, tags, creators
            </span>
          </div>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = statIcons[stat.label as keyof typeof statIcons];
            return (
              <article key={stat.label} className="glass-panel min-w-0 rounded-3xl p-5">
                <div className="rounded-2xl border border-[#f4c56f]/20 bg-[#f4c56f]/10 p-3 text-[#f4c56f]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-6 text-3xl font-black text-stone-50">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-stone-400">{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 glass-panel rounded-3xl p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {categories.slice(0, 6).map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
            <button className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-stone-300 transition hover:border-[#f4c56f]/35 hover:text-[#f4c56f]">
              Static filters
            </button>
          </div>
          {mounted && localReceipts.length ? (
            <div className="mt-5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={clearLocalDemoReceipts}
                className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-stone-500 transition hover:border-red-300/30 hover:text-red-200"
              >
                Clear local demo receipts
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allReceipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </section>

        {!allReceipts.length ? (
          <section className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-lg font-black text-stone-50">No receipts yet.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
              Create a receipt to populate this dashboard with local frontend data.
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
