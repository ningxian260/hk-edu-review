import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";

import type { InstitutionSummary } from "@/lib/institutions";
import { institutionTypeLabels } from "@/lib/labels";
import { RatingStars } from "@/components/rating";

export function InstitutionCard({ institution }: { institution: InstitutionSummary }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={institution.coverImage}
          alt={`${institution.name} 封面圖`}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs font-medium text-gray-950 backdrop-blur">
          {institutionTypeLabels[institution.type]}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <Link href={`/institutions/${institution.slug}`} className="text-xl font-semibold text-gray-950 hover:text-gray-700">
            {institution.name}
          </Link>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-gray-700">{institution.shortDescription}</p>
        </div>
        <RatingStars value={institution.averageRating} count={institution.reviewCount} />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="size-4 shrink-0 text-gray-950" aria-hidden="true" />
          <span>{institution.district.region} · {institution.district.name}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {institution.categories.slice(0, 4).map((category) => (
            <span key={category.slug} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
              {category.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-gray-200 pt-4 text-xs text-gray-600">
          <ShieldCheck className="size-4 text-gray-950" aria-hidden="true" />
          已驗證身份評論，不接受匿名發佈
        </div>
      </div>
    </article>
  );
}
