import type { UserRole, VerificationStatus } from "@prisma/client";

export function canAccessAdmin(role?: UserRole | null) {
  return role === "ADMIN";
}

export function canSubmitVerifiedReview(input: {
  isAuthenticated: boolean;
  verificationStatus?: VerificationStatus | null;
}) {
  return input.isAuthenticated && input.verificationStatus === "APPROVED";
}

export function normalizeRating(value: FormDataEntryValue | null) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

export function averageRatings(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1));
}
