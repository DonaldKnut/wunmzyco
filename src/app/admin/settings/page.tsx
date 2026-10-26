import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { updateStoreSettings } from "@/server/actions/settings";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminCard,
  AdminCardBody,
  AdminCardHeader,
  Button,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@/components/admin/ui";

export default async function AdminSettingsPage() {
  const user = await requirePermission("settings:read");
  const canWrite = hasPermission(user.role, "settings:write");

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {},
    update: {},
  });

  return (
    <>
      <PageHeader icon="settings" title="Store settings" description="Branding, policies, and operational defaults." />

      <AdminCard>
        <AdminCardHeader title="General" />
        <AdminCardBody>
          <form
            action={async (formData) => {
              "use server";
              await updateStoreSettings(formData);
            }}
            className="max-w-2xl space-y-4"
          >
            <Field label="Store name">
              <Input name="storeName" defaultValue={settings.storeName} required disabled={!canWrite} />
            </Field>
            <Field label="Tagline">
              <Input name="tagline" defaultValue={settings.tagline} disabled={!canWrite} />
            </Field>
            <Field label="Contact email">
              <Input
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                required
                disabled={!canWrite}
              />
            </Field>
            <Field label="WhatsApp number">
              <Input name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ""} disabled={!canWrite} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Logo (Cloudinary)">
                <ImageUploadField
                  name="logoUrl"
                  folder="branding"
                  defaultValue={settings.logoUrl ?? ""}
                  disabled={!canWrite}
                  previewClassName="aspect-square max-w-[10rem]"
                />
              </Field>
              <Field label="Favicon (Cloudinary)">
                <ImageUploadField
                  name="faviconUrl"
                  folder="branding"
                  defaultValue={settings.faviconUrl ?? ""}
                  disabled={!canWrite}
                  previewClassName="aspect-square max-w-[10rem]"
                />
              </Field>
            </div>
            <Field label="Announcement bar">
              <Input name="announcementBar" defaultValue={settings.announcementBar ?? ""} disabled={!canWrite} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="announcementActive"
                defaultChecked={settings.announcementActive}
                disabled={!canWrite}
              />
              Show announcement bar
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Default weight (g)">
                <Input
                  name="defaultWeightGrams"
                  type="number"
                  defaultValue={settings.defaultWeightGrams}
                  disabled={!canWrite}
                />
              </Field>
              <Field label="Global low stock threshold">
                <Input
                  name="lowStockThreshold"
                  type="number"
                  defaultValue={settings.lowStockThreshold}
                  disabled={!canWrite}
                />
              </Field>
              <Field label="Reservation (minutes)">
                <Input
                  name="reservationMinutes"
                  type="number"
                  defaultValue={settings.reservationMinutes}
                  disabled={!canWrite}
                />
              </Field>
            </div>

            <p className="rounded-md border border-[#e8e4dc] bg-[#f5f2ec] px-3 py-2 text-xs text-[#5c5a54]">
              Homepage hero copy, announcement, and slider images are managed under{" "}
              <a href="/admin/homepage" className="font-medium text-[#1a1a18] underline">
                Admin → Homepage
              </a>
              .
            </p>
            <input type="hidden" name="homepageHeroTitle" value={settings.homepageHeroTitle} />
            <input type="hidden" name="homepageHeroSubtitle" value={settings.homepageHeroSubtitle} />
            <Field label="About copy">
              <Textarea name="aboutCopy" defaultValue={settings.aboutCopy ?? ""} disabled={!canWrite} />
            </Field>
            <Field label="Shipping policy">
              <Textarea name="shippingPolicy" defaultValue={settings.shippingPolicy ?? ""} disabled={!canWrite} />
            </Field>
            <Field label="Returns policy">
              <Textarea name="returnsPolicy" defaultValue={settings.returnsPolicy ?? ""} disabled={!canWrite} />
            </Field>

            {canWrite ? (
              <Button type="submit">Save settings</Button>
            ) : (
              <p className="text-sm text-[#5c5a54]">Read-only for your role.</p>
            )}
          </form>
        </AdminCardBody>
      </AdminCard>
    </>
  );
}
