"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Tag, Package, Layers, ArrowRight } from "lucide-react";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { formatNgn } from "@/lib/currency";
import { cn } from "@/lib/utils";

type SearchHit = {
  type: "product" | "category" | "collection";
  id: string;
  title: string;
  href: string;
  subtitle?: string;
  priceKobo?: number;
};

type SearchResponse = {
  ok: boolean;
  data?: { hits: SearchHit[]; query: string };
};

export function SearchDropdown() {
  const { searchOpen, closeSearch, openSearch } = useStorefrontUi();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setQuery("");
    setHits([]);
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch, openSearch]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!searchOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen, closeSearch]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, {
        credentials: "include",
      });
      const json = (await res.json()) as SearchResponse;
      if (json.ok && json.data) setHits(json.data.hits);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => void runSearch(query), 220);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  if (!searchOpen) return null;

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background/98 shadow-lg backdrop-blur">
      <div ref={panelRef} className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, collections…"
            className="h-12 w-full border border-border bg-card pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
            aria-label="Search the store"
          />
        </div>

        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <p className="px-1 py-6 text-sm text-muted-foreground">
              Start typing to search the catalogue. Press <kbd className="rounded border border-border px-1.5 py-0.5 text-xs">Esc</kbd> to close.
            </p>
          ) : loading ? (
            <p className="px-1 py-6 text-sm text-muted-foreground">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="px-1 py-6 text-sm text-muted-foreground">No matches for “{query.trim()}”.</p>
          ) : (
            <ul className="divide-y divide-border">
              {hits.map((hit) => (
                <li key={`${hit.type}-${hit.id}`}>
                  <Link
                    href={hit.href}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-1 py-3 transition-colors hover:bg-secondary/60"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground",
                      )}
                    >
                      {hit.type === "product" ? (
                        <Package className="h-4 w-4" />
                      ) : hit.type === "category" ? (
                        <Tag className="h-4 w-4" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{hit.title}</span>
                      <span className="block text-xs capitalize text-muted-foreground">
                        {hit.subtitle ?? hit.type}
                      </span>
                    </span>
                    {hit.priceKobo != null ? (
                      <span className="text-sm tabular-nums">{formatNgn(hit.priceKobo)}</span>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {query.trim() ? (
            <div className="border-t border-border pt-3">
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={closeSearch}
                className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
              >
                View all results
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
