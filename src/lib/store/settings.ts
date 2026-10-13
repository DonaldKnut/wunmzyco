import { prisma } from "@/lib/db";

export const DEFAULT_STORE_SETTINGS = {
  storeName: "Wunmzy Co",
  tagline: "Curated women's thrift & fashion",
  contactEmail: "hello@wunmzyco.com",
  homepageHeroTitle: "Style that feels like you",
  homepageHeroSubtitle:
    "Thoughtfully curated thrift and women's fashion for everyday confidence.",
  announcementBar: null as string | null,
  announcementActive: false,
  instagramUrl: null as string | null,
  twitterUrl: null as string | null,
  facebookUrl: null as string | null,
  tiktokUrl: null as string | null,
  aboutCopy: null as string | null,
  shippingPolicy: null as string | null,
  returnsPolicy: null as string | null,
  privacyPolicy: null as string | null,
  termsOfService: null as string | null,
};

export type StoreSettingsView = typeof DEFAULT_STORE_SETTINGS;

export async function getStoreSettings(): Promise<StoreSettingsView> {
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    if (!row) return DEFAULT_STORE_SETTINGS;
    return {
      storeName: row.storeName,
      tagline: row.tagline,
      contactEmail: row.contactEmail,
      homepageHeroTitle: row.homepageHeroTitle,
      homepageHeroSubtitle: row.homepageHeroSubtitle,
      announcementBar: row.announcementBar,
      announcementActive: row.announcementActive,
      instagramUrl: row.instagramUrl,
      twitterUrl: row.twitterUrl,
      facebookUrl: row.facebookUrl,
      tiktokUrl: row.tiktokUrl,
      aboutCopy: row.aboutCopy,
      shippingPolicy: row.shippingPolicy,
      returnsPolicy: row.returnsPolicy,
      privacyPolicy: row.privacyPolicy,
      termsOfService: row.termsOfService,
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
