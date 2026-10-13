import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const base = absoluteUrl("/");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/checkout", "/api/"],
    },
    sitemap: `${base}sitemap.xml`,
  };
}
