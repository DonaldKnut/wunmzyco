import { redirect } from "next/navigation";

export const metadata = { title: "Search" };

/** Search lives in the marketplace on /shop; keep old /search?q= links working. */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  redirect(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
}
