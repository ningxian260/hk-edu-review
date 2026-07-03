import { Search } from "lucide-react";

import { categories as fallbackCategories, districts as fallbackDistricts, type PublicCategory, type PublicDistrict } from "@/lib/demo-data";

export function FilterForm({
  query,
  district,
  category,
  type,
  districts = fallbackDistricts,
  categories = fallbackCategories,
}: {
  query?: string;
  district?: string;
  category?: string;
  type?: string;
  districts: PublicDistrict[];
  categories: PublicCategory[];
}) {
  return (
    <form action="/institutions" className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <label className="relative">
        <span className="sr-only">搜尋機構</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          name="q"
          defaultValue={query}
          placeholder="搜尋機構名稱、科目或課程"
          className="field pl-11"
        />
      </label>
      <select className="field" name="district" defaultValue={district ?? ""} aria-label="地區">
        <option value="">所有地區</option>
        {districts.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.region} · {item.name}
          </option>
        ))}
      </select>
      <select className="field" name="category" defaultValue={category ?? ""} aria-label="分類">
        <option value="">所有分類</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <select className="field" name="type" defaultValue={type ?? ""} aria-label="教育類型">
        <option value="">所有類型</option>
        <option value="SCHOOL">學校</option>
        <option value="EDUCATION_CENTRE">教育中心</option>
      </select>
      <button className="primary-button justify-center" type="submit">
        搜尋
      </button>
    </form>
  );
}
