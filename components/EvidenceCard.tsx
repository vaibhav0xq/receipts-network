import { FileArchive, ImageIcon, Link2, MessageSquareText, Trash2, Video } from "lucide-react";
import type { Evidence } from "@/lib/mock-data";

const evidenceIcons = {
  Screenshot: ImageIcon,
  Link: Link2,
  File: FileArchive,
  Thread: MessageSquareText,
  Archive: FileArchive,
  Video,
};

type EvidenceCardProps = {
  evidence: Evidence;
  compact?: boolean;
  onRemove?: () => void;
};

export function EvidenceCard({ evidence, compact = false, onRemove }: EvidenceCardProps) {
  const Icon =
    evidence.previewKind === "video" || evidence.mimeType?.startsWith("video/")
      ? Video
      : evidenceIcons[evidence.type];
  const isImage =
    evidence.previewKind === "image" &&
    evidence.previewUrl &&
    !evidence.previewUrl.startsWith("data:");

  return (
    <div
      className={`group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#f4c56f]/35 hover:bg-white/[0.085] ${
        compact ? "w-full" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
          {evidence.storageProvider
            ? `${evidence.storageProvider} ${evidence.previewKind ?? "file"}`
            : evidence.previewKind ?? evidence.type}
        </span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-white/10 bg-white/[0.045] p-2 text-stone-400 transition hover:border-red-300/30 hover:text-red-200"
            aria-label={`Remove ${evidence.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {isImage ? (
        <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#0f0d0b]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.previewUrl}
            alt={evidence.title}
            className="h-32 w-full object-cover"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-white/10 bg-[#120f0c] p-3">
          <div className="grid h-20 grid-cols-5 gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-2">
            <div className="col-span-2 rounded-md bg-[#f4c56f]/18" />
            <div className="col-span-3 space-y-2">
              <div className="h-2 rounded-full bg-white/18" />
              <div className="h-2 w-4/5 rounded-full bg-white/10" />
              <div className="h-2 w-2/3 rounded-full bg-[#f4c56f]/20" />
            </div>
            <div className="col-span-5 h-8 rounded-md bg-gradient-to-r from-white/[0.08] to-[#f4c56f]/10" />
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-[#f4c56f]/20 bg-[#f4c56f]/10 p-2 text-[#f4c56f] transition duration-300 group-hover:scale-105">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-stone-50">
            {evidence.title}
          </p>
          <p className="mt-1 text-xs text-stone-400">{evidence.detail}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/10">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#f4c56f] to-[#9b6a35]" />
      </div>
    </div>
  );
}
