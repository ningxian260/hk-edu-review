import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { submitReview } from "@/app/actions";
import { getInstitutionBySlug } from "@/lib/institutions";
import { ratingCategoryLabels } from "@/lib/labels";

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "撰寫評論",
  description: "以已驗證身份提交香港教育機構評論。",
};

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const institution = await getInstitutionBySlug(slug);

  if (!institution) {
    redirect("/institutions");
  }

  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const action = submitReview.bind(null, institution.slug);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="eyebrow">撰寫評論</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{institution.name}</h1>
          <p className="mt-3 text-slate-300">評論會先進入審核隊列，發布後會顯示你的已驗證身份徽章。</p>
        </div>

        {!session?.user ? (
          <div className="surface p-6">
            <h2 className="text-2xl font-semibold text-white">請先登入</h2>
            <p className="mt-3 text-slate-400">平台不接受匿名評論，登入後才可提交內容。</p>
            <Link className="primary-button mt-5" href="/login">
              登入
            </Link>
          </div>
        ) : !session.user.verifiedIdentity ? (
          <div className="surface p-6">
            <h2 className="text-2xl font-semibold text-white">需要完成身份驗證</h2>
            <p className="mt-3 text-slate-400">請先提交家長、教師、學生、校友或教育專業身份證明，審核通過後即可評論。</p>
            <Link className="primary-button mt-5" href="/verify">
              提交身份驗證
            </Link>
          </div>
        ) : (
          <form action={action} className="surface space-y-5 p-6">
            {status === "database-required" ? (
              <StatusMessage text="請先設定 PostgreSQL DATABASE_URL 並執行資料庫初始化，才可保存評論。" />
            ) : null}
            {status === "invalid" ? <StatusMessage text="請檢查評分、標題和評論內容是否完整。" /> : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">整體評分</span>
              <RatingSelect name="rating" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(ratingCategoryLabels).map(([name, label]) => (
                <label key={name} className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
                  <RatingSelect name={name} />
                </label>
              ))}
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">評論標題</span>
              <input className="field" name="title" placeholder="例如：老師跟進細心，課程節奏清晰" required minLength={4} maxLength={100} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">詳細評論</span>
              <textarea
                className="field min-h-40 resize-y"
                name="content"
                placeholder="分享實際經驗、學習環境、家校溝通或課程安排。請避免提供學生個人私隱。"
                required
                minLength={20}
                maxLength={2500}
              />
            </label>
            <button className="primary-button w-full justify-center" type="submit">
              提交審核
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function RatingSelect({ name }: { name: string }) {
  return (
    <select className="field" name={name} defaultValue="5" required>
      <option value="5">5 星</option>
      <option value="4">4 星</option>
      <option value="3">3 星</option>
      <option value="2">2 星</option>
      <option value="1">1 星</option>
    </select>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{text}</div>;
}
