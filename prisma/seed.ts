import { PrismaClient } from "@prisma/client";
import { nairaToKobo } from "../src/lib/currency";

const prisma = new PrismaClient();

async function seedDeliveryZones() {
  const zones = [
    {
      code: "LAGOS_MAINLAND",
      name: "Lagos Mainland",
      description: "Mainland delivery rates — edit in admin",
      baseFeeKobo: nairaToKobo(1500),
      includedWeightGrams: 1000,
      incrementalFeeKobo: nairaToKobo(350),
      weightBandGrams: 1000,
      freeDeliveryThresholdKobo: nairaToKobo(75000),
      estimatedWindow: "1–3 business days",
      sortOrder: 1,
    },
    {
      code: "LAGOS_ISLAND",
      name: "Lagos Island",
      description: "Island delivery rates — edit in admin",
      baseFeeKobo: nairaToKobo(2000),
      includedWeightGrams: 1000,
      incrementalFeeKobo: nairaToKobo(450),
      weightBandGrams: 1000,
      freeDeliveryThresholdKobo: nairaToKobo(80000),
      estimatedWindow: "1–2 business days",
      sortOrder: 2,
    },
    {
      code: "OTHER_LAGOS",
      name: "Other Lagos",
      description: "Extended Lagos coverage — edit in admin",
      baseFeeKobo: nairaToKobo(2500),
      includedWeightGrams: 1000,
      incrementalFeeKobo: nairaToKobo(500),
      weightBandGrams: 1000,
      estimatedWindow: "2–4 business days",
      sortOrder: 3,
    },
    {
      code: "OTHER_NIGERIA",
      name: "Other Nigeria",
      description: "Nationwide delivery — edit in admin",
      baseFeeKobo: nairaToKobo(4500),
      includedWeightGrams: 1000,
      incrementalFeeKobo: nairaToKobo(800),
      weightBandGrams: 1000,
      minChargeKobo: nairaToKobo(4500),
      maxChargeKobo: nairaToKobo(15000),
      estimatedWindow: "3–7 business days",
      sortOrder: 4,
    },
  ] as const;

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { code: zone.code },
      create: { ...zone, isActive: true, ruleVersion: 1 },
      update: {
        name: zone.name,
        description: zone.description,
        baseFeeKobo: zone.baseFeeKobo,
        includedWeightGrams: zone.includedWeightGrams,
        incrementalFeeKobo: zone.incrementalFeeKobo,
        weightBandGrams: zone.weightBandGrams,
        freeDeliveryThresholdKobo: "freeDeliveryThresholdKobo" in zone ? zone.freeDeliveryThresholdKobo : undefined,
        minChargeKobo: "minChargeKobo" in zone ? zone.minChargeKobo : undefined,
        maxChargeKobo: "maxChargeKobo" in zone ? zone.maxChargeKobo : undefined,
        estimatedWindow: zone.estimatedWindow,
        sortOrder: zone.sortOrder,
        isActive: true,
      },
    });
  }
}

/** Remove previously seeded demo catalogue so the store starts clean. */
async function clearLegacyDemoCatalog() {
  await prisma.productCollection.deleteMany({
    where: {
      OR: [
        { product: { slug: { startsWith: "demo-" } } },
        { collection: { slug: { startsWith: "demo-" } } },
      ],
    },
  });
  await prisma.productCategory.deleteMany({
    where: {
      OR: [
        { product: { slug: { startsWith: "demo-" } } },
        { category: { slug: { startsWith: "demo-" } } },
      ],
    },
  });
  await prisma.productImage.deleteMany({
    where: { product: { slug: { startsWith: "demo-" } } },
  });
  await prisma.cartItem.deleteMany({
    where: { product: { slug: { startsWith: "demo-" } } },
  });
  await prisma.product.deleteMany({
    where: {
      OR: [{ slug: { startsWith: "demo-" } }, { sku: { startsWith: "DEMO-" } }, { name: { contains: "[DEMO]" } }],
    },
  });
  await prisma.category.deleteMany({
    where: { OR: [{ slug: { startsWith: "demo-" } }, { name: { contains: "[DEMO]" } }] },
  });
  await prisma.collection.deleteMany({
    where: { OR: [{ slug: { startsWith: "demo-" } }, { name: { contains: "[DEMO]" } }] },
  });
}

async function seedStoreSettings() {
  const { BRAND } = await import("../src/lib/brand");
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      storeName: BRAND.storeName,
      tagline: BRAND.tagline,
      contactEmail: BRAND.contactEmail,
      whatsappNumber: BRAND.whatsappNumber,
      logoUrl: BRAND.logoUrl,
      faviconUrl: BRAND.logoUrl,
      homepageHeroTitle: BRAND.homepageHeroTitle,
      homepageHeroSubtitle: BRAND.homepageHeroSubtitle,
      announcementBar: BRAND.announcementBar,
      announcementActive: true,
      instagramUrl: BRAND.instagramUrl,
      facebookUrl: BRAND.facebookUrl,
      tiktokUrl: BRAND.tiktokUrl,
      aboutCopy: BRAND.aboutCopy,
      defaultWeightGrams: 400,
      reservationMinutes: 30,
    },
    update: {
      storeName: BRAND.storeName,
      tagline: BRAND.tagline,
      contactEmail: BRAND.contactEmail,
      whatsappNumber: BRAND.whatsappNumber,
      logoUrl: BRAND.logoUrl,
      faviconUrl: BRAND.logoUrl,
      announcementBar: BRAND.announcementBar,
      announcementActive: true,
      homepageHeroTitle: BRAND.homepageHeroTitle,
      homepageHeroSubtitle: BRAND.homepageHeroSubtitle,
      instagramUrl: BRAND.instagramUrl,
      facebookUrl: BRAND.facebookUrl,
      tiktokUrl: BRAND.tiktokUrl,
      aboutCopy: BRAND.aboutCopy,
    },
  });
}

async function seedHomepageSlides() {
  const count = await prisma.homepageSlide.count();
  if (count > 0) return;
  const { BRAND } = await import("../src/lib/brand");
  await prisma.homepageSlide.createMany({
    data: [
      {
        eyebrow: BRAND.tagline,
        title: BRAND.slogan,
        subtitle: BRAND.homepageHeroSubtitle,
        ctaLabel: "Shop the edit",
        ctaHref: "/shop",
        imageUrl: BRAND.brandCardUrl,
        imageAlt: BRAND.storeName,
        tone: "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
        sortOrder: 0,
        isActive: true,
      },
      {
        eyebrow: BRAND.category,
        title: "Corporate · Street · Dinner · Party",
        subtitle: "Looks for every occasion — accessories and fashion that feel like you.",
        ctaLabel: "Browse arrivals",
        ctaHref: "/shop",
        tone: "from-[#efe8df] via-[#e0d5c6] to-[#c9b8a4]",
        sortOrder: 1,
        isActive: true,
      },
      {
        eyebrow: "Inquiries & orders",
        title: "Talk to us on WhatsApp",
        subtitle: `${BRAND.whatsappDisplay} · ${BRAND.webHandle}`,
        ctaLabel: "Contact Wunmzy",
        ctaHref: "/contact",
        tone: "from-[#f3efe8] via-[#e8e1d4] to-[#b7c0a8]/40",
        sortOrder: 2,
        isActive: true,
      },
    ],
  });
}

async function main() {
  console.log("Seeding Wunmzy Co foundation data…");
  await clearLegacyDemoCatalog();
  await seedStoreSettings();
  await seedHomepageSlides();
  await seedDeliveryZones();
  console.log("Seed complete — no sample products. Add catalogue via /admin/products.");
  console.log("Create an admin with: npm run admin:bootstrap");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
