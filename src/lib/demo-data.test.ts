import { describe, expect, it } from "vitest";

import { institutions } from "./demo-data";

describe("seed institution data", () => {
  it("keeps institution slugs unique", () => {
    const slugs = institutions.map((institution) => institution.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps source URLs for every real institution", () => {
    for (const institution of institutions) {
      expect(institution.sourceUrl).toMatch(/^https:\/\//);
      expect(institution.sourceLabel.length).toBeGreaterThan(0);
    }
  });

  it("includes both schools and education centres", () => {
    expect(institutions.some((institution) => institution.type === "SCHOOL")).toBe(true);
    expect(institutions.some((institution) => institution.type === "EDUCATION_CENTRE")).toBe(true);
  });
});
