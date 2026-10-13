import { getStoreSettings } from "@/lib/store/settings";

export async function AnnouncementBar() {
  const settings = await getStoreSettings();
  if (!settings.announcementActive || !settings.announcementBar?.trim()) {
    return null;
  }
  return (
    <div className="border-b border-border bg-secondary/60 px-4 py-2 text-center text-xs tracking-wide text-foreground">
      {settings.announcementBar}
    </div>
  );
}
