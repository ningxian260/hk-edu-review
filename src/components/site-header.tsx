import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { signOutUser } from "@/app/actions";
import { identityLabels, roleLabels } from "@/lib/labels";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-gray-300 bg-white text-gray-950">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-gray-950">香港教育評價平台</span>
            <span className="block truncate text-xs text-gray-600">真實身份 · 可信評論</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link className="nav-link" href="/institutions">
            搜尋機構
          </Link>
          <Link className="nav-link" href="/verify">
            身份驗證
          </Link>
          <Link className="nav-link" href="/admin">
            管理後台
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <div className="hidden max-w-48 text-right sm:block">
                <p className="truncate text-sm font-medium text-gray-950">{session.user.name ?? session.user.email}</p>
                <p className="truncate text-xs text-gray-600">
                  {session.user.verifiedIdentity ? identityLabels[session.user.verifiedIdentity] : roleLabels[session.user.role]}
                </p>
              </div>
              <form action={signOutUser}>
                <button className="secondary-button" type="submit">
                  登出
                </button>
              </form>
            </>
          ) : (
            <Link className="primary-button" href="/login">
              <Sparkles className="size-4" aria-hidden="true" />
              登入
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
