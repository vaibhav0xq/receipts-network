import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  DatabaseZap,
  FileText,
  Link2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EvidenceCard } from "@/components/EvidenceCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Navbar } from "@/components/Navbar";
import { builtFor, features, receipts } from "@/lib/mock-data";

export default function Home() {
  const featuredReceipt = receipts[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0d0b]">
      <div className="receipt-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-[-12%] top-0 h-96 w-96 rounded-full bg-[#f4c56f]/18 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] top-64 h-[32rem] w-[32rem] rounded-full bg-[#6f3f1c]/35 blur-3xl" />
      <Navbar />

      <main className="relative overflow-x-hidden">
        <section className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-4 pb-20 pt-14 sm:px-6 md:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 xl:gap-16">
          <div className="min-w-0">
            <div className="animate-pulse-gold mb-6 inline-flex items-center gap-2 rounded-full border border-[#f4c56f]/25 bg-[#f4c56f]/10 px-4 py-2 text-sm font-semibold text-[#f4c56f]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Shelby-ready public proof layer
            </div>
            <h1 className="max-w-5xl break-words text-5xl font-black leading-[0.95] tracking-tight text-stone-50 sm:text-6xl lg:text-7xl xl:text-8xl">
              Save internet receipts before they disappear.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Public proof pages for screenshots, links, files, scam evidence,
              builder proof, bug reports, research, and community receipts,
              packaged before fragile context vanishes.
            </p>
            <div className="mt-9 flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4c56f] px-6 py-4 text-sm font-black text-[#1d1308] shadow-[0_20px_70px_rgba(244,197,111,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd98f]"
              >
                Create Receipt
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-4 text-sm font-bold text-stone-100 transition duration-300 hover:-translate-y-1 hover:border-[#f4c56f]/35 hover:text-[#f4c56f]"
              >
                View dashboard
              </Link>
            </div>
          </div>

          <div className="relative min-h-[500px] min-w-0 sm:min-h-[540px]">
            <div className="animate-float-delayed absolute -left-2 top-8 z-10 hidden w-56 rounded-3xl border border-white/10 bg-[#1d1510]/80 p-4 shadow-2xl backdrop-blur-xl sm:block [--float-rotate:-5deg]">
              <div className="mb-3 inline-flex rounded-xl bg-red-400/10 p-2 text-red-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-stone-50">Scam evidence locked</p>
              <p className="mt-1 text-xs text-stone-400">3 files, 1 source link</p>
            </div>
            <div className="animate-float-slow absolute -right-1 bottom-16 z-10 hidden w-56 rounded-3xl border border-white/10 bg-[#21170f]/85 p-4 shadow-2xl backdrop-blur-xl md:block [--float-rotate:5deg]">
              <div className="mb-3 inline-flex rounded-xl bg-[#f4c56f]/10 p-2 text-[#f4c56f]">
                <DatabaseZap className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-stone-50">Shelby storage next</p>
              <p className="mt-1 text-xs text-stone-400">Prepared references</p>
            </div>

            <div className="animate-float-slow glass-panel gold-glow relative mx-auto w-full max-w-2xl rounded-3xl p-4 sm:p-7">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#120f0c]/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CategoryBadge category={featuredReceipt.category} />
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                    Public receipt
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-black leading-tight text-stone-50 sm:text-3xl">
                  {featuredReceipt.title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-stone-400">
                  {featuredReceipt.description}
                </p>
                <div className="mt-6 rounded-2xl border border-[#f4c56f]/15 bg-[#f4c56f]/[0.06] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4c56f]">
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    Source context
                  </div>
                  <p className="mt-2 truncate text-sm text-stone-200">
                    {featuredReceipt.source}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {featuredReceipt.evidence.slice(0, 2).map((evidence) => (
                    <EvidenceCard key={evidence.title} evidence={evidence} compact />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <span className="text-sm font-bold text-stone-300">
                    {featuredReceipt.creator}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f4c56f]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    Timestamped
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-6 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4c56f]">
                  Built for
                </p>
                <h2 className="mt-3 text-3xl font-black text-stone-50 sm:text-4xl">
                  Anyone who needs proof that survives the timeline.
                </h2>
              </div>
              <FileText className="h-12 w-12 text-[#f4c56f]" aria-hidden="true" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {builtFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-stone-200 transition hover:-translate-y-0.5 hover:border-[#f4c56f]/35 hover:text-[#f4c56f]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl px-6 py-12 sm:px-12">
            <h2 className="text-4xl font-black tracking-tight text-stone-50 sm:text-5xl">
              Make proof shareable before the trail goes cold.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">
              Start with mock receipts today. Shelby-backed storage, hashes, and
              permanent evidence references are designed to slot in next.
            </p>
            <Link
              href="/create"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#f4c56f] px-6 py-4 text-sm font-black text-[#1d1308] transition duration-300 hover:-translate-y-1 hover:bg-[#ffd98f]"
            >
              Create the first receipt
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
