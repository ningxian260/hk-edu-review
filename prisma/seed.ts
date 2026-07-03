import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { categories, districts, institutions } from "../src/lib/demo-data";

if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("[PROJECT-REF]") ||
  process.env.DATABASE_URL.includes("[PRISMA-PASSWORD]") ||
  process.env.DATABASE_URL.includes("[DB-REGION]")
) {
  throw new Error("Please replace DATABASE_URL with your real Supabase connection string before seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      name: "平台管理員",
      role: UserRole.ADMIN,
    },
  });

  for (const district of districts) {
    await prisma.district.upsert({
      where: { slug: district.slug },
      update: {
        name: district.name,
        region: district.region,
      },
      create: district,
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const institution of institutions) {
    const district = await prisma.district.findUniqueOrThrow({ where: { slug: institution.district.slug } });
    const categoryConnections = institution.categories.map((category) => ({ slug: category.slug }));

    await prisma.institution.upsert({
      where: { slug: institution.slug },
      update: {
        name: institution.name,
        type: institution.type,
        districtId: district.id,
        overview: institution.overview,
        shortDescription: institution.shortDescription,
        address: institution.address,
        contactEmail: institution.contactEmail,
        contactPhone: institution.contactPhone,
        website: institution.website,
        tuitionFee: institution.tuitionFee,
        sourceUrl: institution.sourceUrl,
        sourceLabel: institution.sourceLabel,
        coverImage: institution.coverImage,
        categories: { set: categoryConnections },
      },
      create: {
        name: institution.name,
        slug: institution.slug,
        type: institution.type,
        districtId: district.id,
        overview: institution.overview,
        shortDescription: institution.shortDescription,
        address: institution.address,
        contactEmail: institution.contactEmail,
        contactPhone: institution.contactPhone,
        website: institution.website,
        tuitionFee: institution.tuitionFee,
        sourceUrl: institution.sourceUrl,
        sourceLabel: institution.sourceLabel,
        coverImage: institution.coverImage,
        categories: { connect: categoryConnections },
        photos: {
          create: institution.photos,
        },
      },
    });
  }

  console.log(`Seed complete. Admin email: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
