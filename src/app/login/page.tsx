import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { signInWithEmail, signInWithGoogle } from "@/app/actions";
import { isDatabaseConfigured } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "登入",
  description: "登入香港教育評價平台，以已驗證身份提交評論。",
};

export default function LoginPage() {
  const googleReady = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const emailReady = Boolean(isDatabaseConfigured && process.env.EMAIL_SERVER && process.env.EMAIL_FROM);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <p className="eyebrow">登入</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">使用真實身份參與評論</h1>
          <p className="mt-3 text-slate-300">登入後可提交身份驗證、撰寫評論及管理你的帳戶。</p>
        </div>

        <div className="surface space-y-4 p-6">
          {googleReady ? (
            <form action={signInWithGoogle}>
              <button className="primary-button w-full justify-center" type="submit">
                使用 Google 登入
              </button>
            </form>
          ) : (
            <ProviderNotice />
          )}

          {emailReady ? (
            <form action={signInWithEmail} className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">電郵地址</span>
                <input className="field" name="email" type="email" required placeholder="parent@example.com" />
              </label>
              <button className="secondary-button w-full gap-2" type="submit">
                <Mail className="size-4" aria-hidden="true" />
                收取登入連結
              </button>
            </form>
          ) : null}
        </div>

        <Link className="text-sm text-cyan-200 hover:text-cyan-100" href="/institutions">
          先瀏覽機構
        </Link>
      </div>
    </main>
  );
}

function ProviderNotice() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
      Google 登入暫時未能使用。
    </div>
  );
}
