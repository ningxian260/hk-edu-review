import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Search, ShieldCheck, Star } from "lucide-react";

import { FilterForm } from "@/components/filter-form";
import { InstitutionCard } from "@/components/institution-card";
import { getDistrictStats, getFilterOptions, getInstitutions } from "@/lib/institutions";

export default async function Home() {
  const [institutions, districtStats, filterOptions] = await Promise.all([getInstitutions(), getDistrictStats(), getFilterOptions()]);
  const featured = institutions.slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/25 bg-pink-200/12 px-4 py-2 text-sm text-pink-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              不接受匿名評論，重視真實身份
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
                用可信評論，選擇適合孩子的香港教育機構。
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                搜尋學校、教育中心和學習課程，查看已驗證家長、教師、學生、校友及教育專業人士的真實評價。
              </p>
            </div>
            <FilterForm {...filterOptions} />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["已收錄機構", institutions.length.toString(), Building2],
                ["已驗證評論", institutions.reduce((total, item) => total + item.reviewCount, 0).toString(), BadgeCheck],
                ["平均評分", "4.4", Star],
              ].map(([label, value, Icon]) => (
                <div key={String(label)} className="surface p-4">
                  <Icon className="mb-3 size-5 text-pink-200" aria-hidden="true" />
                  <p className="text-2xl font-semibold text-white">{String(value)}</p>
                  <p className="mt-1 text-sm text-slate-400">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-x-12 top-8 h-72 rounded-full bg-pink-300/20 blur-3xl" />
            <div className="relative grid gap-4">
              {featured.map((institution, index) => (
                <div key={institution.slug} className={index === 1 ? "ml-12" : index === 2 ? "ml-24" : ""}>
                  <InstitutionCard institution={institution} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-pink-100/10 bg-pink-950/20 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">按地區瀏覽</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">香港島、九龍、新界，一眼比較</h2>
            </div>
            <Link className="secondary-button w-fit" href="/institutions">
              查看全部
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {districtStats.map((district) => (
              <Link
                href={`/institutions?district=${district.slug}`}
                key={district.slug}
                className="surface group flex items-center justify-between gap-4 p-5 transition hover:border-pink-300/50 hover:bg-white/[0.09]"
              >
                <span>
                  <span className="block text-sm text-pink-200">{district.region}</span>
                  <span className="mt-1 block text-xl font-semibold text-white">{district.name}</span>
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{district.count} 間</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center gap-3">
            <Search className="size-6 text-pink-200" aria-hidden="true" />
            <h2 className="text-3xl font-semibold text-white">精選機構</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {featured.map((institution) => (
              <InstitutionCard key={institution.slug} institution={institution} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
