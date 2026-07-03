import type { Metadata } from "next";

import { FilterForm } from "@/components/filter-form";
import { InstitutionCard } from "@/components/institution-card";
import { getFilterOptions, getInstitutions } from "@/lib/institutions";

export const metadata: Metadata = {
  title: "搜尋教育機構",
  description: "按地區、科目和教育類型搜尋香港學校及教育中心。",
};

type InstitutionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InstitutionsPage({ searchParams }: InstitutionsPageProps) {
  const params = await searchParams;
  const filters = {
    query: getParam(params.q),
    district: getParam(params.district),
    category: getParam(params.category),
    type: getParam(params.type),
  };
  const [institutions, filterOptions] = await Promise.all([getInstitutions(filters), getFilterOptions()]);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="eyebrow">搜尋與篩選</p>
          <h1 className="text-4xl font-semibold text-white">尋找香港教育機構</h1>
          <p className="max-w-3xl text-slate-300">
            透過地區、科目和教育類型篩選，查看每間機構的基本資料、來源和已驗證評論。
          </p>
        </div>

        <FilterForm {...filters} {...filterOptions} />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">找到 {institutions.length} 間機構</p>
        </div>

        {institutions.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {institutions.map((institution) => (
              <InstitutionCard key={institution.slug} institution={institution} />
            ))}
          </div>
        ) : (
          <div className="surface p-8 text-center">
            <h2 className="text-2xl font-semibold text-white">暫時沒有符合條件的機構</h2>
            <p className="mt-3 text-slate-400">請嘗試放寬搜尋字眼或移除部分篩選條件。</p>
          </div>
        )}
      </div>
    </main>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
