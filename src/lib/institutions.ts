import { averageRatings } from "@/lib/review-policy";
import { categories as fallbackCategories, institutions as fallbackInstitutions, type PublicCategory, type PublicInstitution } from "@/lib/demo-data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type InstitutionFilters = {
  query?: string;
  district?: string;
  category?: string;
  type?: string;
};

export type InstitutionSummary = PublicInstitution & {
  averageRating: number;
  reviewCount: number;
};

export async function getInstitutions(filters: InstitutionFilters = {}): Promise<InstitutionSummary[]> {
  const institutions = isDatabaseConfigured ? await getInstitutionsFromDatabase() : fallbackInstitutions;
  const query = filters.query?.trim().toLowerCase();

  return institutions
    .filter((institution) => {
      const matchesQuery =
        !query ||
        institution.name.toLowerCase().includes(query) ||
        institution.shortDescription.toLowerCase().includes(query) ||
        institution.categories.some((category) => category.name.toLowerCase().includes(query));
      const matchesDistrict = !filters.district || institution.district.slug === filters.district;
      const matchesCategory = !filters.category || institution.categories.some((category) => category.slug === filters.category);
      const matchesType = !filters.type || institution.type === filters.type;

      return matchesQuery && matchesDistrict && matchesCategory && matchesType;
    })
    .map(toSummary);
}

export async function getInstitutionBySlug(slug: string) {
  const institutions = isDatabaseConfigured ? await getInstitutionsFromDatabase() : fallbackInstitutions;
  const institution = institutions.find((item) => item.slug === slug);

  return institution ? toSummary(institution) : null;
}

export async function getDistrictStats() {
  const institutions = await getInstitutions();
  const stats = new Map<string, { name: string; slug: string; region: string; count: number }>();

  for (const institution of institutions) {
    const current = stats.get(institution.district.slug) ?? {
      name: institution.district.name,
      slug: institution.district.slug,
      region: institution.district.region,
      count: 0,
    };

    current.count += 1;
    stats.set(institution.district.slug, current);
  }

  return Array.from(stats.values());
}

export async function getFilterOptions(): Promise<{ districts: PublicInstitution["district"][]; categories: PublicCategory[] }> {
  const institutions = isDatabaseConfigured ? await getInstitutionsFromDatabase() : fallbackInstitutions;
  const districts = new Map<string, PublicInstitution["district"]>();
  const categories = new Map<string, PublicCategory>();

  for (const institution of institutions) {
    districts.set(institution.district.slug, institution.district);

    for (const category of institution.categories) {
      categories.set(category.slug, category);
    }
  }

  return {
    districts: Array.from(districts.values()).sort((a, b) => `${a.region}${a.name}`.localeCompare(`${b.region}${b.name}`, "zh-Hant-HK")),
    categories: Array.from(categories.values()).sort(
      (a, b) =>
        fallbackCategories.findIndex((category) => category.slug === a.slug) -
        fallbackCategories.findIndex((category) => category.slug === b.slug),
    ),
  };
}

function toSummary(institution: PublicInstitution): InstitutionSummary {
  const publishedReviews = institution.reviews.filter((review) => review.status === "PUBLISHED");

  return {
    ...institution,
    reviews: publishedReviews,
    averageRating: averageRatings(publishedReviews.map((review) => review.rating)),
    reviewCount: publishedReviews.length,
  };
}

async function getInstitutionsFromDatabase(): Promise<PublicInstitution[]> {
  const institutions = await prisma.institution.findMany({
    include: {
      categories: true,
      district: true,
      photos: true,
      reviews: {
        where: { status: "PUBLISHED" },
        include: {
          ratingBreakdown: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return institutions.map((institution) => ({
    id: institution.id,
    name: institution.name,
    slug: institution.slug,
    type: institution.type,
    district: {
      name: institution.district.name,
      slug: institution.district.slug,
      region: institution.district.region as "香港島" | "九龍" | "新界",
    },
    categories: institution.categories.map((category) => ({ name: category.name, slug: category.slug })),
    overview: institution.overview,
    shortDescription: institution.shortDescription,
    address: institution.address ?? undefined,
    contactEmail: institution.contactEmail ?? undefined,
    contactPhone: institution.contactPhone ?? undefined,
    website: institution.website ?? undefined,
    tuitionFee: institution.tuitionFee ?? undefined,
    sourceUrl: institution.sourceUrl,
    sourceLabel: institution.sourceLabel,
    coverImage: institution.coverImage ?? "/images/campus-night-01.png",
    photos: institution.photos.map((photo) => ({ url: photo.url, alt: photo.alt })),
    reviews: institution.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      status: review.status,
      identity: review.identity,
      reviewerName: review.user.name ?? "已驗證用戶",
      breakdown: {
        teachingQuality: review.ratingBreakdown?.teachingQuality ?? review.rating,
        curriculum: review.ratingBreakdown?.curriculum ?? review.rating,
        teacherProfessionalism: review.ratingBreakdown?.teacherProfessionalism ?? review.rating,
        learningEnvironment: review.ratingBreakdown?.learningEnvironment ?? review.rating,
        communication: review.ratingBreakdown?.communication ?? review.rating,
        valueForMoney: review.ratingBreakdown?.valueForMoney ?? review.rating,
        studentEngagement: review.ratingBreakdown?.studentEngagement ?? review.rating,
      },
    })),
  }));
}
