import { categoryMeta, type ReceiptCategory } from "@/lib/mock-data";

type CategoryBadgeProps = {
  category: ReceiptCategory;
  className?: string;
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const meta = categoryMeta[category];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${meta.tone}`} aria-hidden="true" />
      {category}
    </span>
  );
}
