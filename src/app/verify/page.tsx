import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { submitVerificationRequest } from "@/app/actions";
import { identityLabels } from "@/lib/labels";

type VerifyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "身份驗證",
  description: "提交文件式身份驗證，取得家長、教師、學生、校友或教育專業人士徽章。",
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  const status = Array.isArray(query.status) ? query.status[0] : query.status;

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="eyebrow">身份驗證</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">取得可信評論身份徽章</h1>
          <p className="mt-3 text-slate-300">平台會由管理員審核你提交的身份類型及證明文件。證明文件只供審核，不會公開顯示。</p>
        </div>

        {!session?.user ? (
          <div className="surface p-6">
            <h2 className="text-2xl font-semibold text-white">請先登入</h2>
            <p className="mt-3 text-slate-400">登入後才可提交身份驗證申請。</p>
            <Link className="primary-button mt-5" href="/login">
              登入
            </Link>
          </div>
        ) : (
          <form action={submitVerificationRequest} className="surface space-y-5 p-6">
            {status === "submitted" ? <StatusMessage tone="success" text="身份驗證申請已提交，管理員審核後會更新你的帳戶。" /> : null}
            {status === "identity-required" ? <StatusMessage tone="warning" text="提交評論前需要先完成身份驗證。" /> : null}
            {status === "database-required" ? <StatusMessage tone="warning" text="請先設定 PostgreSQL DATABASE_URL，才可保存身份驗證申請。" /> : null}
            {status === "invalid" ? <StatusMessage tone="warning" text="請檢查身份類型和說明是否完整。" /> : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">申請身份</span>
              <select className="field" name="identity" required>
                {Object.entries(identityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">身份說明</span>
              <textarea
                className="field min-h-36 resize-y"
                name="statement"
                placeholder="簡述你與相關教育機構或教育界的關係，例如家長、任教科目、就讀年級或專業背景。"
                required
                minLength={20}
                maxLength={1200}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">證明文件</span>
              <input
                className="field file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                name="proof"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <span className="mt-2 block text-xs text-slate-500">請避免上載不必要的敏感資料。MVP 會存放於非公開本地儲存位置。</span>
            </label>
            <button className="primary-button w-full justify-center" type="submit">
              提交身份驗證
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function StatusMessage({ text, tone }: { text: string; tone: "success" | "warning" }) {
  const className =
    tone === "success"
      ? "rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
      : "rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100";

  return <div className={className}>{text}</div>;
}
