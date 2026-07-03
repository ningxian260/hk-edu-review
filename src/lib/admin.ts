import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  if (!isDatabaseConfigured) {
    return {
      institutionCount: 8,
      reviewCount: 9,
      pendingReviewCount: 0,
      pendingVerificationCount: 0,
      pendingReviews: [],
      pendingVerifications: [],
      databaseReady: false,
    };
  }

  const [institutionCount, reviewCount, pendingReviewCount, pendingVerificationCount, pendingReviews, pendingVerifications] =
    await Promise.all([
      prisma.institution.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.review.findMany({
        where: { status: "PENDING" },
        include: { institution: true, user: true },
        orderBy: { createdAt: "asc" },
        take: 12,
      }),
      prisma.verificationRequest.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "asc" },
        take: 12,
      }),
    ]);

  return {
    institutionCount,
    reviewCount,
    pendingReviewCount,
    pendingVerificationCount,
    pendingReviews,
    pendingVerifications,
    databaseReady: true,
  };
}
