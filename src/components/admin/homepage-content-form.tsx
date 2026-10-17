"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateHomepageContent } from "@/server/actions/homepage";
import { Button, Field, Input, Textarea } from "@/components/admin/ui";

export function HomepageContentForm({
  canWrite,
  defaults,
}: {
  canWrite: boolean;
  defaults: {
    homepageHeroTitle: string;
    homepageHeroSubtitle: string;
    tagline: string;
    announcementBar: string;
    announcementActive: boolean;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canWrite) return;
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateHomepageContent(formData);
          if (result.ok) {
            toast.success("Homepage content saved");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      <Field label="Default hero title">
        <Input
          name="homepageHeroTitle"
          defaultValue={defaults.homepageHeroTitle}
          required
          disabled={!canWrite || pending}
        />
      </Field>
      <Field label="Default hero subtitle">
        <Textarea
          name="homepageHeroSubtitle"
          defaultValue={defaults.homepageHeroSubtitle}
          disabled={!canWrite || pending}
        />
      </Field>
      <Field label="Tagline (eyebrow fallback)">
        <Input name="tagline" defaultValue={defaults.tagline} disabled={!canWrite || pending} />
      </Field>
      <Field label="Announcement bar">
        <Input
          name="announcementBar"
          defaultValue={defaults.announcementBar}
          disabled={!canWrite || pending}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="announcementActive"
          defaultChecked={defaults.announcementActive}
          disabled={!canWrite || pending}
        />
        Show announcement bar
      </label>
      {canWrite ? (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save homepage content"}
        </Button>
      ) : (
        <p className="text-sm text-[#5c5a54]">Read-only for your role.</p>
      )}
    </form>
  );
}
