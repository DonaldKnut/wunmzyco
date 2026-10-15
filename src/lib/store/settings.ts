import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";

export const DEFAULT_STORE_SETTINGS = {
  storeName: BRAND.storeName as string,
  tagline: BRAND.tagline as string,
  contactEmail: BRAND.contactEmail as string,
  whatsappNumber: BRAND.whatsappNumber as string,
  logoUrl: BRAND.logoUrl as string,
  faviconUrl: BRAND.logoUrl as string,
  homepageHeroTitle: BRAND.homepageHeroTitle as string,
  homepageHeroSubtitle: BRAND.homepageHeroSubtitle as string,
  announcementBar: BRAND.announcementBar as string,
  announcementActive: true,
  instagramUrl: BRAND.instagramUrl as string,
  twitterUrl: null as string | null,
  facebookUrl: BRAND.facebookUrl as string,
  tiktokUrl: BRAND.tiktokUrl as string,
  aboutCopy: BRAND.aboutCopy as string,
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
      storeName: row.storeName || DEFAULT_STORE_SETTINGS.storeName,
      tagline: row.tagline || DEFAULT_STORE_SETTINGS.tagline,
      contactEmail: row.contactEmail || DEFAULT_STORE_SETTINGS.contactEmail,
      whatsappNumber: row.whatsappNumber ?? DEFAULT_STORE_SETTINGS.whatsappNumber,
      logoUrl: row.logoUrl ?? DEFAULT_STORE_SETTINGS.logoUrl,
      faviconUrl: row.faviconUrl ?? DEFAULT_STORE_SETTINGS.faviconUrl,
      homepageHeroTitle: row.homepageHeroTitle || DEFAULT_STORE_SETTINGS.homepageHeroTitle,
      homepageHeroSubtitle: row.homepageHeroSubtitle || DEFAULT_STORE_SETTINGS.homepageHeroSubtitle,
      announcementBar: row.announcementBar ?? DEFAULT_STORE_SETTINGS.announcementBar,
      announcementActive: row.announcementActive,
      instagramUrl: row.instagramUrl ?? DEFAULT_STORE_SETTINGS.instagramUrl,
      twitterUrl: row.twitterUrl,
      facebookUrl: row.facebookUrl ?? DEFAULT_STORE_SETTINGS.facebookUrl,
      tiktokUrl: row.tiktokUrl ?? DEFAULT_STORE_SETTINGS.tiktokUrl,
      aboutCopy: row.aboutCopy ?? DEFAULT_STORE_SETTINGS.aboutCopy,
      shippingPolicy: row.shippingPolicy,
      returnsPolicy: row.returnsPolicy,
      privacyPolicy: row.privacyPolicy,
      termsOfService: row.termsOfService,
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
