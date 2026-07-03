import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";

import type { InstitutionSummary } from "@/lib/institutions";
import { institutionTypeLabels } from "@/lib/labels";
import { RatingStars } from "@/components/rating";

export function InstitutionCard({ institution }: { institution: InstitutionSummary }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.08]">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={institution.coverImage}
          alt={`${institution.name} 封面圖`}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b13] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-medium text-cyan-100 backdrop-blur">
          {institutionTypeLabels[institution.type]}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <Link href={`/institutions/${institution.slug}`} className="text-xl font-semibold text-white hover:text-cyan-200">
            {institution.name}
          </Link>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-300">{institution.shortDescription}</p>
        </div>
        <RatingStars value={institution.averageRating} count={institution.reviewCount} />
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="size-4 shrink-0 text-cyan-300" aria-hidden="true" />
          <span>{institution.district.region} · {institution.district.name}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {institution.categories.slice(0, 4).map((category) => (
            <span key={category.slug} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">
              {category.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" />
          已驗證身份評論，不接受匿名發佈
        </div>
      </div>
    </article>
  );
}
