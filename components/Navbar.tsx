import Link from "next/link";
import { FileText, Plus, WalletCards } from "lucide-react";
import { getStorageModeLabel } from "@/lib/storage";

export function Navbar() {
  const storageLabel = getStorageModeLabel();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0d0b]/80 backdrop-blur-2xl">
      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[#f4c56f]/30 bg-[#f4c56f]/10 text-[#f4c56f] shadow-[0_0_30px_rgba(244,197,111,0.16)] transition duration-300 group-hover:scale-105">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-sm font-bold tracking-wide text-stone-50 sm:text-base">
            Receipts Network
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-stone-300 md:flex">
          <Link href="/dashboard" className="transition hover:text-[#f4c56f]">
            Dashboard
          </Link>
          <Link href="/r/rn-1048" className="transition hover:text-[#f4c56f]">
            Public receipt
          </Link>
          <span className="rounded-full border border-[#f4c56f]/20 bg-[#f4c56f]/10 px-3 py-1 text-xs font-semibold text-[#f4c56f]">
            {storageLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-white/10 bg-white/[0.04] p-3 text-stone-200 transition hover:border-[#f4c56f]/30 hover:text-[#f4c56f] sm:inline-flex"
            aria-label="Open dashboard"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[#f4c56f] px-4 py-3 text-sm font-bold text-[#1d1308] shadow-[0_14px_45px_rgba(244,197,111,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd98f]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden min-[390px]:inline">Create Receipt</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
