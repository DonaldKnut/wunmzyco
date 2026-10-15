import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { BRAND } from "../src/lib/brand";

const prisma = new PrismaClient();

async function main() {
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
      announcementBar: BRAND.announcementBar,
      announcementActive: true,
      instagramUrl: BRAND.instagramUrl,
      facebookUrl: BRAND.facebookUrl,
      tiktokUrl: BRAND.tiktokUrl,
      homepageHeroTitle: BRAND.homepageHeroTitle,
      homepageHeroSubtitle: BRAND.homepageHeroSubtitle,
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
      instagramUrl: BRAND.instagramUrl,
      facebookUrl: BRAND.facebookUrl,
      tiktokUrl: BRAND.tiktokUrl,
      homepageHeroTitle: BRAND.homepageHeroTitle,
      homepageHeroSubtitle: BRAND.homepageHeroSubtitle,
      aboutCopy: BRAND.aboutCopy,
    },
  });

  console.log("Brand settings applied.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
