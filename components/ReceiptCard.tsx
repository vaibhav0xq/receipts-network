"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Clock, Copy, Paperclip } from "lucide-react";
import type { Receipt } from "@/lib/mock-data";
import { CategoryBadge } from "@/components/CategoryBadge";

type ReceiptCardProps = {
  receipt: Receipt;
};

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [copied, setCopied] = useState(false);
  const href = `/r/${receipt.id}`;

  async function copyLink() {
    const origin = window.location.origin;
    await navigator.clipboard.writeText(`${origin}${href}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="group glass-panel min-w-0 rounded-3xl p-5 transition duration-300 hover:-translate-y-1.5 hover:border-[#f4c56f]/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryBadge category={receipt.category} />
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-400">
          <Paperclip className="h-3.5 w-3.5 text-[#f4c56f]" aria-hidden="true" />
          {receipt.evidence.length} files
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold leading-snug text-stone-50">
        {receipt.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-400">
        {receipt.description}
      </p>
      <div className="mt-5 flex items-center gap-2 text-xs text-stone-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {receipt.timestamp}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="min-w-0 break-words text-sm font-semibold text-stone-300">
          {receipt.creator}
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold text-stone-300 transition hover:border-[#f4c56f]/35 hover:text-[#f4c56f]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#f4c56f]/20 bg-[#f4c56f]/10 px-3 py-2 text-xs font-bold text-[#f4c56f] transition group-hover:border-[#f4c56f]/45 group-hover:bg-[#f4c56f]/15"
        >
          Public link
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
