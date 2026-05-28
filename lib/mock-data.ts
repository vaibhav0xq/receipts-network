import {
  Archive,
  Bug,
  Camera,
  FileCheck2,
  FlaskConical,
  HandCoins,
  Megaphone,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  PreviewKind,
  StorageProviderName,
  StoredReceiptMetadata,
} from "@/lib/storage/types";

export type ReceiptCategory =
  | "Scam Alert"
  | "Builder Proof"
  | "Bug Report"
  | "Community Proof"
  | "Research"
  | "Grant/Application"
  | "Creator Proof"
  | "Other";

export type Evidence = {
  id?: string;
  receiptId?: string;
  title: string;
  type: "Screenshot" | "Link" | "File" | "Thread" | "Archive";
  detail: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  storageProvider?: StorageProviderName;
  storagePath?: string;
  previewKind?: PreviewKind;
  name?: string;
  mimeType?: string;
  size?: number;
  previewUrl?: string;
  publicUrl?: string;
  file?: File;
  createdAt?: string;
};

export type Receipt = {
  id: string;
  title: string;
  category: ReceiptCategory;
  creator: string;
  timestamp: string;
  description: string;
  source: string;
  tags: string[];
  evidence: Evidence[];
  metadataStorage?: StoredReceiptMetadata;
  createdAt?: string;
  public?: boolean;
  isLocal?: boolean;
};

export type CategoryMeta = {
  icon: LucideIcon;
  tone: string;
};

export const categories: ReceiptCategory[] = [
  "Scam Alert",
  "Builder Proof",
  "Bug Report",
  "Community Proof",
  "Research",
  "Grant/Application",
  "Creator Proof",
  "Other",
];

export const categoryMeta: Record<ReceiptCategory, CategoryMeta> = {
  "Scam Alert": { icon: ShieldAlert, tone: "text-red-200" },
  "Builder Proof": { icon: FileCheck2, tone: "text-emerald-200" },
  "Bug Report": { icon: Bug, tone: "text-orange-200" },
  "Community Proof": { icon: Users, tone: "text-sky-100" },
  Research: { icon: FlaskConical, tone: "text-violet-100" },
  "Grant/Application": { icon: HandCoins, tone: "text-[#f4c56f]" },
  "Creator Proof": { icon: Camera, tone: "text-pink-100" },
  Other: { icon: Archive, tone: "text-stone-100" },
};

export const receipts: Receipt[] = [
  {
    id: "rn-1048",
    title: "Phishing wallet drain report preserved before deletion",
    category: "Scam Alert",
    creator: "@chainwatcher",
    timestamp: "May 28, 2026 01:22 IST",
    description:
      "A public receipt preserving screenshots, wallet addresses, deleted posts, and the original context for a coordinated phishing attempt targeting early testers.",
    source: "https://x.com/example/status/receipt-scam-alert",
    tags: ["phishing", "wallet-drain", "deleted-post", "community-safety"],
    createdAt: "2026-05-28T01:22:00+05:30",
    public: true,
    evidence: [
      {
        title: "Deleted campaign screenshot",
        type: "Screenshot",
        detail: "PNG capture, 1440x1180",
      },
      {
        title: "Wallet cluster notes",
        type: "File",
        detail: "Markdown report, 18 KB",
      },
      {
        title: "Original source link",
        type: "Link",
        detail: "Public post URL",
      },
    ],
  },
  {
    id: "rn-1021",
    title: "Mainnet launch contribution receipts for grant review",
    category: "Builder Proof",
    creator: "@nadiabuilds",
    timestamp: "May 27, 2026 22:10 IST",
    description:
      "Evidence package collecting commits, forum posts, deployment screenshots, and reviewer comments for a grant milestone submission.",
    source: "Grant milestone packet, Sprint 04",
    tags: ["grant", "milestone", "mainnet", "builder-proof"],
    createdAt: "2026-05-27T22:10:00+05:30",
    public: true,
    evidence: [
      {
        title: "Deployment terminal capture",
        type: "Screenshot",
        detail: "Signed upload preview",
      },
      {
        title: "Reviewer context thread",
        type: "Thread",
        detail: "8 linked messages",
      },
      {
        title: "Milestone attachment",
        type: "File",
        detail: "PDF, 1.2 MB",
      },
    ],
  },
  {
    id: "rn-0997",
    title: "Critical mobile bug report with reproduction proof",
    category: "Bug Report",
    creator: "@qa_mira",
    timestamp: "May 25, 2026 18:44 IST",
    description:
      "Reproduction steps, screen recordings, browser details, and issue context for a mobile signing flow failure caught during community testing.",
    source: "Internal beta feedback channel",
    tags: ["bug", "mobile", "wallet", "reproduction"],
    createdAt: "2026-05-25T18:44:00+05:30",
    public: true,
    evidence: [
      {
        title: "Reproduction screenshots",
        type: "Screenshot",
        detail: "4 image sequence",
      },
      {
        title: "Session notes",
        type: "Archive",
        detail: "Exported issue context",
      },
    ],
  },
];

export const builtFor = [
  "Web3 users",
  "builders",
  "moderators",
  "researchers",
  "creators",
  "grant applicants",
];

export const features = [
  {
    title: "Capture proof",
    description:
      "Turn fragile links, screenshots, reports, and community context into a durable public receipt.",
    icon: Sparkles,
  },
  {
    title: "Store evidence",
    description:
      "Package files, source URLs, notes, tags, and metadata now, with Shelby-powered persistence next.",
    icon: Archive,
  },
  {
    title: "Share receipts",
    description:
      "Publish polished proof pages that communities, reviewers, and followers can inspect quickly.",
    icon: Megaphone,
  },
];
