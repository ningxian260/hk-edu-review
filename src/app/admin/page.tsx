import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { moderateReview, moderateVerification } from "@/app/actions";
import { getAdminDashboard } from "@/lib/admin";
import { identityLabels, reviewStatusLabels } from "@/lib/labels";
import { canAccessAdmin } from "@/lib/review-policy";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "管理後台",
  description: "審核香港教育評價平台的身份驗證申請和評論。",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [session, query] = await Promise.all([auth(), searchParams]);

  if (!session?.user) {
    redirect("/login");
  }

  if (!canAccessAdmin(session.user.role)) {
    return (
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl surface p-8">
          <h1 className="text-3xl font-semibold text-white">沒有管理權限</h1>
          <p className="mt-3 text-slate-400">只有管理員可以查看後台。請確認你的帳戶已由 `ADMIN_EMAIL` 建立或提升權限。</p>
          <Link className="primary-button mt-6" href="/">
            返回首頁
          </Link>
        </div>
      </main>
    );
  }

  const dashboard = await getAdminDashboard();
  const status = Array.isArray(query.status) ? query.status[0] : query.status;

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="eyebrow">管理後台</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">審核中心</h1>
          <p className="mt-3 max-w-3xl text-slate-300">管理員可審核身份驗證申請、發布或拒絕評論，並查看平台基本指標。</p>
        </div>

        {!dashboard.databaseReady || status === "database-required" ? (
          <div className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
            目前尚未連接 PostgreSQL。公開頁面會使用預覽資料；後台審核功能需先設定 `DATABASE_URL` 並初始化資料庫。
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["機構總數", dashboard.institutionCount],
            ["評論總數", dashboard.reviewCount],
            ["待審評論", dashboard.pendingReviewCount],
            ["待審身份", dashboard.pendingVerificationCount],
          ].map(([label, value]) => (
            <div key={String(label)} className="surface p-5">
              <p className="text-sm text-slate-400">{String(label)}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{String(value)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface p-6">
            <h2 className="text-2xl font-semibold text-white">待審評論</h2>
            <div className="mt-6 space-y-4">
              {dashboard.pendingReviews.length > 0 ? (
                dashboard.pendingReviews.map((review) => (
                  <article key={review.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                    <p className="text-sm text-cyan-200">{review.institution.name}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{review.title}</h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{review.content}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {review.user.name ?? review.user.email ?? "用戶"} · {review.rating} 星 · {reviewStatusLabels[review.status]}
                    </p>
                    <ModerationForm action={moderateReview} idName="reviewId" idValue={review.id} />
                  </article>
                ))
              ) : (
                <p className="text-slate-400">暫時沒有待審評論。</p>
              )}
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="text-2xl font-semibold text-white">待審身份驗證</h2>
            <div className="mt-6 space-y-4">
              {dashboard.pendingVerifications.length > 0 ? (
                dashboard.pendingVerifications.map((request) => (
                  <article key={request.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                    <p className="text-sm text-cyan-200">{identityLabels[request.requestedIdentity]}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{request.user.name ?? request.user.email ?? "用戶"}</h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{request.statement}</p>
                    <VerificationProof
                      fileName={request.proofFileName}
                      fileType={request.proofFileType}
                      requestId={request.id}
                      uploaded={Boolean(request.proofFilePath)}
                    />
                    <VerificationForm requestId={request.id} />
                  </article>
                ))
              ) : (
                <p className="text-slate-400">暫時沒有待審身份驗證。</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function VerificationProof({
  fileName,
  fileType,
  requestId,
  uploaded,
}: {
  fileName: string | null;
  fileType: string | null;
  requestId: string;
  uploaded: boolean;
}) {
  if (!uploaded) {
    return <p className="mt-3 text-xs text-slate-500">文件：未上載</p>;
  }

  const fileUrl = `/admin/verification-files/${requestId}`;
  const isImage = fileType?.startsWith("image/");

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>文件：{fileName ?? "已上載證明文件"}</span>
        <Link className="text-cyan-200 underline-offset-4 hover:underline" href={fileUrl} target="_blank">
          開啟原檔
        </Link>
      </div>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={fileName ?? "身份證明文件預覽"}
          className="max-h-56 w-full rounded-2xl border border-white/10 object-contain"
          src={fileUrl}
        />
      ) : null}
    </div>
  );
}

function ModerationForm({
  action,
  idName,
  idValue,
}: {
  action: (formData: FormData) => Promise<void>;
  idName: string;
  idValue: string;
}) {
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input type="hidden" name={idName} value={idValue} />
      <input className="field" name="note" placeholder="審核備註" />
      <div className="flex gap-2">
        <button className="primary-button" name="status" value="PUBLISHED" type="submit">
          發布
        </button>
        <button className="secondary-button" name="status" value="REJECTED" type="submit">
          拒絕
        </button>
      </div>
    </form>
  );
}

function VerificationForm({ requestId }: { requestId: string }) {
  return (
    <form action={moderateVerification} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input type="hidden" name="requestId" value={requestId} />
      <input className="field" name="note" placeholder="審核備註" />
      <div className="flex gap-2">
        <button className="primary-button" name="status" value="APPROVED" type="submit">
          核准
        </button>
        <button className="secondary-button" name="status" value="REJECTED" type="submit">
          拒絕
        </button>
      </div>
    </form>
  );
}
