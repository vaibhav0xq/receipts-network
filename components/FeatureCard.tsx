import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <article className="group glass-panel rounded-3xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#f4c56f]/30">
      <div className="mb-8 inline-flex rounded-2xl border border-[#f4c56f]/25 bg-[#f4c56f]/10 p-3 text-[#f4c56f] transition duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-stone-50">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-400">{description}</p>
    </article>
  );
}
