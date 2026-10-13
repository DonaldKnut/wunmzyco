import { Suspense } from "react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { StorefrontUiProvider } from "@/components/providers/storefront-ui-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <StorefrontUiProvider>
      <Suspense fallback={<Skeleton className="h-9 w-full rounded-none" />}>
        <AnnouncementBar />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-16 w-full rounded-none" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-none" />}>
        <SiteFooter />
      </Suspense>
    </StorefrontUiProvider>
  );
}
