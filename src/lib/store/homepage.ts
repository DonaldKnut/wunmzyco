import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";

export type HomepageSlideView = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
  imageAlt: string | null;
  tone: string;
};

const FALLBACK_SLIDES: HomepageSlideView[] = [
  {
    id: "fallback-1",
    eyebrow: BRAND.tagline,
    title: BRAND.slogan,
    subtitle: BRAND.homepageHeroSubtitle,
    ctaLabel: "Shop the edit",
    ctaHref: "/shop",
    imageUrl: BRAND.brandCardUrl,
    imageAlt: BRAND.storeName,
    tone: "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
  },
  {
    id: "fallback-2",
    eyebrow: BRAND.category,
    title: "Corporate · Street · Dinner · Party",
    subtitle: "Looks for every occasion — accessories and fashion that feel like you.",
    ctaLabel: "Browse arrivals",
    ctaHref: "/shop",
    imageUrl: null,
    imageAlt: null,
    tone: "from-[#efe8df] via-[#e0d5c6] to-[#c9b8a4]",
  },
  {
    id: "fallback-3",
    eyebrow: "Inquiries & orders",
    title: "Talk to us on WhatsApp",
    subtitle: `${BRAND.whatsappDisplay} · ${BRAND.webHandle}`,
    ctaLabel: "Contact Wunmzy",
    ctaHref: "/contact",
    imageUrl: null,
    imageAlt: null,
    tone: "from-[#f3efe8] via-[#e8e1d4] to-[#b7c0a8]/40",
  },
];

export async function getHomepageSlides(): Promise<HomepageSlideView[]> {
  try {
    const rows = await prisma.homepageSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return FALLBACK_SLIDES;
    return rows.map((r) => ({
      id: r.id,
      eyebrow: r.eyebrow,
      title: r.title,
      subtitle: r.subtitle,
      ctaLabel: r.ctaLabel,
      ctaHref: r.ctaHref,
      imageUrl: r.imageUrl,
      imageAlt: r.imageAlt,
      tone: r.tone,
    }));
  } catch {
    return FALLBACK_SLIDES;
  }
}
