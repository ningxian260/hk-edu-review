import "dotenv/config";

import { randomUUID } from "node:crypto";
import { Client } from "pg";

type SourceSchool = {
  name: string | null;
  slug: string | null;
  type: string | null;
  region: string | null;
  district: string | null;
  categories: string | null;
  short_description: string | null;
  overview: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  curriculum: string | null;
  year_levels: string | null;
  language_of_instruction: string | null;
  tuition_fee: string | null;
  admission_page: string | null;
  source_url: string | null;
  source_label: string | null;
  source_checked_date: string | null;
  notes: string | null;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes("[PROJECT-REF]") || databaseUrl.includes("[PRISMA-PASSWORD]")) {
  throw new Error("Please set DATABASE_URL before importing schools.");
}

const client = new Client({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000,
});

const categories = [
  { name: "STEM", slug: "stem" },
  { name: "英文", slug: "english" },
  { name: "中文", slug: "chinese" },
  { name: "數學", slug: "mathematics" },
  { name: "編程", slug: "coding" },
  { name: "機械人", slug: "robotics" },
  { name: "Playgroup", slug: "playgroup" },
  { name: "面試準備", slug: "interview-preparation" },
  { name: "IB", slug: "ib" },
  { name: "DSE", slug: "dse" },
];

const categoryAliases = new Map<string, string>([
  ["STEM", "stem"],
  ["英文", "english"],
  ["English", "english"],
  ["中文", "chinese"],
  ["Chinese", "chinese"],
  ["數學", "mathematics"],
  ["Mathematics", "mathematics"],
  ["編程", "coding"],
  ["Coding", "coding"],
  ["機械人", "robotics"],
  ["Robotics", "robotics"],
  ["Playgroup", "playgroup"],
  ["面試準備", "interview-preparation"],
  ["Interview Preparation", "interview-preparation"],
  ["IB", "ib"],
  ["DSE", "dse"],
]);

const districtNames = new Map<string, { name: string; region: string; slug: string }>([
  ["Central and Western", { name: "中西區", region: "香港島", slug: "central-and-western" }],
  ["Eastern", { name: "東區", region: "香港島", slug: "eastern" }],
  ["Southern", { name: "南區", region: "香港島", slug: "southern" }],
  ["Wan Chai", { name: "灣仔", region: "香港島", slug: "wan-chai" }],
  ["Kowloon City", { name: "九龍城", region: "九龍", slug: "kowloon-city" }],
  ["Kwun Tong", { name: "觀塘", region: "九龍", slug: "kwun-tong" }],
  ["Sham Shui Po", { name: "深水埗", region: "九龍", slug: "sham-shui-po" }],
  ["North", { name: "北區", region: "新界", slug: "north" }],
  ["Sai Kung", { name: "西貢", region: "新界", slug: "sai-kung" }],
  ["Sha Tin", { name: "沙田", region: "新界", slug: "sha-tin" }],
  ["Tai Po", { name: "大埔", region: "新界", slug: "tai-po" }],
  ["Islands", { name: "離島", region: "新界", slug: "islands" }],
  ["Tsuen Wan", { name: "荃灣", region: "新界", slug: "tsuen-wan" }],
  ["Tuen Mun", { name: "屯門", region: "新界", slug: "tuen-mun" }],
]);

const coverImages = [
  "/images/campus-night-01.png",
  "/images/campus-night-02.png",
  "/images/campus-night-03.png",
  "/images/campus-night-04.png",
  "/images/campus-night-05.png",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tidy(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed
    .replaceAll("请", "請")
    .replaceAll("准", "準")
    .replaceAll("为", "為")
    .replaceAll("课程", "課程")
    .replaceAll("学校", "學校")
    .replaceAll("国际", "國際");
}

function parseCategorySlugs(value: string | null) {
  const slugs = new Set<string>();
  const parts = value?.split(/[;；,，、]/).map((part) => part.trim()).filter(Boolean) ?? [];

  for (const part of parts) {
    const slug = categoryAliases.get(part);
    if (slug) {
      slugs.add(slug);
    }
  }

  if (slugs.size === 0) {
    slugs.add("english");
  }

  return Array.from(slugs);
}

function buildOverview(row: SourceSchool) {
  const existingOverview = tidy(row.overview);
  const details = [
    row.curriculum ? `課程：${tidy(row.curriculum)}` : undefined,
    row.year_levels ? `年級／年齡：${tidy(row.year_levels)}` : undefined,
    row.language_of_instruction ? `主要授課語言：${tidy(row.language_of_instruction)}` : undefined,
    row.admission_page ? `收生資料：${tidy(row.admission_page)}` : undefined,
  ].filter(Boolean);

  return [existingOverview, ...details].filter(Boolean).join("\n\n") || "資料以學校官方網站及公開資料為準。";
}

async function upsertCategory(name: string, slug: string) {
  const result = await client.query<{ id: string }>(
    `
      insert into "Category" ("id", "name", "slug")
      values ($1, $2, $3)
      on conflict ("slug") do update set "name" = excluded."name"
      returning "id"
    `,
    [randomUUID(), name, slug],
  );

  return result.rows[0].id;
}

async function upsertDistrict(district: { name: string; region: string; slug: string }) {
  const result = await client.query<{ id: string }>(
    `
      insert into "District" ("id", "name", "region", "slug")
      values ($1, $2, $3, $4)
      on conflict ("slug") do update set
        "name" = excluded."name",
        "region" = excluded."region"
      returning "id"
    `,
    [randomUUID(), district.name, district.region, district.slug],
  );

  return result.rows[0].id;
}

async function main() {
  await client.connect();
  await client.query("begin");

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";

    await client.query(
      `
        insert into "User" ("id", "email", "name", "role", "createdAt", "updatedAt")
        values ($1, $2, $3, 'ADMIN'::"UserRole", current_timestamp, current_timestamp)
        on conflict ("email") do update set
          "role" = 'ADMIN'::"UserRole",
          "updatedAt" = current_timestamp
      `,
      [randomUUID(), adminEmail, "平台管理員"],
    );

    const categoryIds = new Map<string, string>();
    for (const category of categories) {
      categoryIds.set(category.slug, await upsertCategory(category.name, category.slug));
    }

    const sourceRows = await client.query<SourceSchool>(`select * from "international-schools" order by name`);
    let imported = 0;

    for (const [index, row] of sourceRows.rows.entries()) {
      const name = tidy(row.name);
      if (!name) {
        continue;
      }

      const sourceDistrict = row.district?.trim() ?? "";
      const district = districtNames.get(sourceDistrict) ?? {
        name: sourceDistrict || "未分類地區",
        region: row.region?.includes("Kowloon") ? "九龍" : row.region?.includes("Island") ? "香港島" : "新界",
        slug: slugify(sourceDistrict || "uncategorised"),
      };

      const districtId = await upsertDistrict(district);
      const categorySlugs = parseCategorySlugs(row.categories);
      const slug = tidy(row.slug) ? slugify(tidy(row.slug)!) : slugify(name);
      const coverImage = coverImages[index % coverImages.length];

      const institution = await client.query<{ id: string }>(
        `
          insert into "Institution" (
            "id",
            "name",
            "slug",
            "type",
            "districtId",
            "overview",
            "shortDescription",
            "address",
            "contactEmail",
            "contactPhone",
            "website",
            "tuitionFee",
            "sourceUrl",
            "sourceLabel",
            "coverImage",
            "createdAt",
            "updatedAt"
          )
          values (
            $1,
            $2,
            $3,
            $4::"InstitutionType",
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            current_timestamp,
            current_timestamp
          )
          on conflict ("slug") do update set
            "name" = excluded."name",
            "type" = excluded."type",
            "districtId" = excluded."districtId",
            "overview" = excluded."overview",
            "shortDescription" = excluded."shortDescription",
            "address" = excluded."address",
            "contactEmail" = excluded."contactEmail",
            "contactPhone" = excluded."contactPhone",
            "website" = excluded."website",
            "tuitionFee" = excluded."tuitionFee",
            "sourceUrl" = excluded."sourceUrl",
            "sourceLabel" = excluded."sourceLabel",
            "coverImage" = excluded."coverImage",
            "updatedAt" = current_timestamp
          returning "id"
        `,
        [
          randomUUID(),
          name,
          slug,
          row.type === "EDUCATION_CENTRE" ? "EDUCATION_CENTRE" : "SCHOOL",
          districtId,
          buildOverview(row),
          tidy(row.short_description) ?? `${district.name}國際學校`,
          tidy(row.address),
          tidy(row.contact_email),
          tidy(row.contact_phone),
          tidy(row.website),
          tidy(row.tuition_fee) ?? "請以學校官方公布為準",
          tidy(row.source_url) ?? tidy(row.website) ?? "https://internationalschools.edb.gov.hk/",
          tidy(row.source_label) ?? "公開資料",
          coverImage,
        ],
      );

      const institutionId = institution.rows[0].id;

      await client.query(`delete from "_CategoryToInstitution" where "B" = $1`, [institutionId]);

      for (const categorySlug of categorySlugs) {
        const categoryId = categoryIds.get(categorySlug);
        if (!categoryId) {
          continue;
        }

        await client.query(
          `
            insert into "_CategoryToInstitution" ("A", "B")
            values ($1, $2)
            on conflict do nothing
          `,
          [categoryId, institutionId],
        );
      }

      await client.query(`delete from "InstitutionPhoto" where "institutionId" = $1`, [institutionId]);
      await client.query(
        `
          insert into "InstitutionPhoto" ("id", "institutionId", "url", "alt")
          values ($1, $2, $3, $4)
        `,
        [randomUUID(), institutionId, coverImage, `${name} 校園圖片`],
      );

      imported += 1;
    }

    await client.query("commit");
    console.log(`Imported ${imported} schools from international-schools.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
