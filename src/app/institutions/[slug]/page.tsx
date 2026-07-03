import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { RatingBar, RatingStars } from "@/components/rating";
import { getInstitutionBySlug } from "@/lib/institutions";
import { identityLabels, institutionTypeLabels, ratingCategoryLabels } from "@/lib/labels";
import { averageRatings } from "@/lib/review-policy";

type InstitutionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: InstitutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const institution = await getInstitutionBySlug(slug);

  if (!institution) {
    return { title: "找不到機構" };
  }

  return {
    title: institution.name,
    description: institution.shortDescription,
    openGraph: {
      title: institution.name,
      description: institution.shortDescription,
      images: [institution.coverImage],
    },
  };
}

export default async function InstitutionPage({ params, searchParams }: InstitutionPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const institution = await getInstitutionBySlug(slug);

  if (!institution) {
    notFound();
  }

  const breakdown = Object.keys(ratingCategoryLabels).map((key) => {
    const values = institution.reviews.map((review) => review.breakdown[key as keyof typeof review.breakdown]);
    return {
      key,
      label: ratingCategoryLabels[key as keyof typeof ratingCategoryLabels],
      value: averageRatings(values),
    };
  });
  const status = Array.isArray(query.status) ? query.status[0] : query.status;

  return (
    <main>
      {status === "review-submitted" ? (
        <div className="border-b border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-center text-sm text-emerald-100">
          評論已提交，管理員審核後會顯示在頁面。
        </div>
      ) : null}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={institution.coverImage} alt={`${institution.name} 封面`} fill priority className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/88 to-[#070a12]/45" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-sm text-cyan-100">
                {institutionTypeLabels[institution.type]}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200">
                {institution.district.region} · {institution.district.name}
              </span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">{institution.name}</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-200">{institution.overview}</p>
            <div className="flex flex-wrap items-center gap-4">
              <RatingStars value={institution.averageRating} count={institution.reviewCount} />
              <Link className="primary-button" href={`/institutions/${institution.slug}/review`}>
                撰寫評論
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6">
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold text-white">分項評分</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {breakdown.map((item) => (
                  <RatingBar key={item.key} label={item.label} value={item.value} />
                ))}
              </div>
            </div>

            <div className="surface p-6">
              <h2 className="text-2xl font-semibold text-white">已驗證評論</h2>
              <div className="mt-6 space-y-4">
                {institution.reviews.length > 0 ? (
                  institution.reviews.map((review) => (
                    <article key={review.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <RatingStars value={review.rating} />
                          <h3 className="mt-3 text-xl font-semibold text-white">{review.title}</h3>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          {identityLabels[review.identity]}
                        </span>
                      </div>
                      <p className="mt-4 leading-7 text-slate-300">{review.content}</p>
                      <p className="mt-4 text-sm text-slate-500">
                        {review.reviewerName} · {new Date(review.createdAt).toLocaleDateString("zh-HK")}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-slate-400">暫時未有已發布評論。</p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold text-white">機構資料</h2>
              <dl className="mt-6 space-y-4 text-sm">
                {institution.address ? (
                  <InfoRow icon={MapPin} label="地址" value={institution.address} />
                ) : null}
                {institution.contactPhone ? <InfoRow icon={Phone} label="電話" value={institution.contactPhone} /> : null}
                {institution.contactEmail ? <InfoRow icon={Mail} label="電郵" value={institution.contactEmail} /> : null}
                {institution.website ? (
                  <div>
                    <dt className="text-slate-500">網站</dt>
                    <dd className="mt-1">
                      <a className="inline-flex items-center gap-2 text-cyan-200 hover:text-cyan-100" href={institution.website} target="_blank" rel="noreferrer">
                        官方網站
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-slate-500">學費</dt>
                  <dd className="mt-1 text-slate-200">{institution.tuitionFee ?? "未提供"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">資料來源</dt>
                  <dd className="mt-1">
                    <a className="text-cyan-200 hover:text-cyan-100" href={institution.sourceUrl} target="_blank" rel="noreferrer">
                      {institution.sourceLabel}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="surface p-6">
              <h2 className="text-2xl font-semibold text-white">課程分類</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {institution.categories.map((category) => (
                  <Link
                    href={`/institutions?category=${category.slug}`}
                    key={category.slug}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200 hover:border-cyan-200/40"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-slate-200">{value}</dd>
    </div>
  );
}
