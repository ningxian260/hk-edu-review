import { describe, expect, it } from "vitest";

import { averageRatings, canAccessAdmin, canSubmitVerifiedReview, normalizeRating } from "./review-policy";

describe("review policy", () => {
  it("allows only admins into the admin dashboard", () => {
    expect(canAccessAdmin("ADMIN")).toBe(true);
    expect(canAccessAdmin("USER")).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("requires authentication and approved verification before review submission", () => {
    expect(canSubmitVerifiedReview({ isAuthenticated: true, verificationStatus: "APPROVED" })).toBe(true);
    expect(canSubmitVerifiedReview({ isAuthenticated: true, verificationStatus: "PENDING" })).toBe(false);
    expect(canSubmitVerifiedReview({ isAuthenticated: false, verificationStatus: "APPROVED" })).toBe(false);
  });

  it("normalizes ratings to one through five only", () => {
    expect(normalizeRating("5")).toBe(5);
    expect(normalizeRating("1")).toBe(1);
    expect(normalizeRating("0")).toBeNull();
    expect(normalizeRating("6")).toBeNull();
    expect(normalizeRating("4.5")).toBeNull();
  });

  it("calculates one-decimal rating averages", () => {
    expect(averageRatings([5, 4, 4])).toBe(4.3);
    expect(averageRatings([])).toBe(0);
  });
});
