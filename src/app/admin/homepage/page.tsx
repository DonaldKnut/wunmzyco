import Image from "next/image";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { DeleteSlideButton } from "@/components/admin/delete-slide-button";
import { HomepageContentForm } from "@/components/admin/homepage-content-form";
import { SlideFormModal } from "@/components/admin/slide-form-modal";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  Badge,
  PageHeader,
} from "@/components/admin/ui";

export default async function AdminHomepagePage() {
  const user = await requirePermission("settings:read");
  const canWrite = hasPermission(user.role, "settings:write");

  const [settings, slides] = await Promise.all([
    prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {},
      update: {},
    }),
    prisma.homepageSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <>
      <PageHeader
        icon="homepage"
        title="Homepage"
        description="Edit hero copy, announcement bar, and carousel slides with images."
        actions={canWrite ? <SlideFormModal /> : undefined}
      />

      <AdminCard className="mb-6">
        <AdminCardHeader
          title="Hero & announcement"
          description="Fallback title/subtitle used when a slide leaves fields empty, plus the top bar."
        />
        <AdminCardBody>
          <HomepageContentForm
            canWrite={canWrite}
            defaults={{
              homepageHeroTitle: settings.homepageHeroTitle,
              homepageHeroSubtitle: settings.homepageHeroSubtitle,
              tagline: settings.tagline,
              announcementBar: settings.announcementBar ?? "",
              announcementActive: settings.announcementActive,
            }}
          />
        </AdminCardBody>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader
          title={`Slides (${slides.length})`}
          description="Active slides appear in the homepage hero carousel. Upload an image for a full-bleed look."
          action={canWrite ? <SlideFormModal /> : undefined}
        />
        <AdminCardBody className="p-0">
          {slides.length === 0 ? (
            <div className="p-6 text-sm text-[#5c5a54]">
              No slides yet. Add one to control the homepage carousel (until then, brand fallbacks are
              shown).
            </div>
          ) : (
            <ul className="divide-y divide-[#eee9e0]">
              {slides.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-[#e8e4dc] bg-[#eee9e0]">
                    {s.imageUrl ? (
                      <Image
                        src={s.imageUrl}
                        alt={s.imageAlt || s.title}
                        fill
                        className="object-cover"
                        unoptimized={s.imageUrl.startsWith("/")}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-2 text-center text-[10px] text-[#7a776f]">
                        Gradient only
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-[#1a1a18]">{s.title}</p>
                      <Badge tone={s.isActive ? "success" : "neutral"}>
                        {s.isActive ? "Active" : "Hidden"}
                      </Badge>
                      <span className="text-[10px] uppercase tracking-wide text-[#7a776f]">
                        Order {s.sortOrder}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[#5c5a54]">{s.subtitle || "—"}</p>
                    <p className="mt-1 text-xs text-[#7a776f]">
                      {s.ctaLabel} → {s.ctaHref}
                    </p>
                  </div>
                  {canWrite ? (
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <SlideFormModal
                        mode="edit"
                        slide={{
                          id: s.id,
                          eyebrow: s.eyebrow,
                          title: s.title,
                          subtitle: s.subtitle,
                          ctaLabel: s.ctaLabel,
                          ctaHref: s.ctaHref,
                          imageUrl: s.imageUrl,
                          imageAlt: s.imageAlt,
                          tone: s.tone,
                          sortOrder: s.sortOrder,
                          isActive: s.isActive,
                        }}
                      />
                      <DeleteSlideButton slideId={s.id} title={s.title} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </AdminCardBody>
      </AdminCard>
    </>
  );
}
