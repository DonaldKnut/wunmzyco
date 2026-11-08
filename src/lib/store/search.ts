import type { Prisma, ProductCondition } from "@prisma/client";

/** Words that carry no meaning for matching products ("red dress for dinner" → red, dress, dinner). */
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "with",
  "in",
  "on",
  "of",
  "to",
  "my",
  "me",
  "i",
  "im",
  "want",
  "need",
  "looking",
  "show",
  "find",
  "some",
  "any",
  "size",
  "sized",
  "colour",
  "color",
  "item",
  "items",
  "piece",
  "pieces",
  "naira",
  "price",
]);

export type ParsedSearch = {
  terms: string[];
  /** Naira */
  minPrice?: number;
  /** Naira */
  maxPrice?: number;
  onSale?: boolean;
  oneOfOne?: boolean;
  inStock?: boolean;
  condition?: ProductCondition;
};

const AMOUNT = String.raw`₦?\s*(\d[\d,]*(?:\.\d+)?\s*[km]?)`;

function parseAmount(raw: string): number | undefined {
  const m = raw
    .toLowerCase()
    .replace(/[₦,\s]/g, "")
    .match(/^(\d+(?:\.\d+)?)(k|m)?$/);
  if (!m) return undefined;
  const multiplier = m[2] === "k" ? 1_000 : m[2] === "m" ? 1_000_000 : 1;
  const value = Number(m[1]) * multiplier;
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Turn free text into search terms plus filters a shopper might type naturally,
 * e.g. "red gown under 20k", "tops 5k-15k", "jackets on sale", "like new bags".
 */
export function parseSearchQuery(input: string): ParsedSearch {
  const out: ParsedSearch = { terms: [] };
  let text = ` ${input.toLowerCase().slice(0, 120)} `;

  text = text.replace(
    new RegExp(String.raw`${AMOUNT}\s*(?:-|to|–)\s*${AMOUNT}`, "g"),
    (match, a: string, b: string) => {
      const lo = parseAmount(a);
      const hi = parseAmount(b);
      if (lo == null || hi == null) return match;
      out.minPrice = Math.min(lo, hi);
      out.maxPrice = Math.max(lo, hi);
      return " ";
    },
  );
  text = text.replace(
    new RegExp(String.raw`(?:under|below|less than|cheaper than|max|maximum|within|<=?)\s*${AMOUNT}`, "g"),
    (match, a: string) => {
      const n = parseAmount(a);
      if (n == null) return match;
      out.maxPrice = n;
      return " ";
    },
  );
  text = text.replace(
    new RegExp(String.raw`(?:over|above|more than|from|min|minimum|>=?)\s*${AMOUNT}`, "g"),
    (match, a: string) => {
      const n = parseAmount(a);
      if (n == null) return match;
      out.minPrice = n;
      return " ";
    },
  );

  const flag = (pattern: RegExp, apply: () => void) => {
    if (pattern.test(text)) {
      apply();
      text = text.replace(pattern, " ");
    }
  };
  flag(/\b(?:on sale|sales?|discount(?:ed)?|promo|deals?|cheap)\b/g, () => {
    out.onSale = true;
  });
  flag(/\b(?:one[\s-]of[\s-]one|1\s*of\s*1|unique|rare)\b/g, () => {
    out.oneOfOne = true;
  });
  flag(/\b(?:in stock|available)\b/g, () => {
    out.inStock = true;
  });
  flag(/\blike[\s-]new\b/g, () => {
    out.condition = "LIKE_NEW";
  });
  flag(/\bbrand[\s-]new\b/g, () => {
    out.condition = "NEW";
  });
  flag(/\bexcellent condition\b/g, () => {
    out.condition = "EXCELLENT";
  });

  const seen = new Set<string>();
  for (const raw of text.split(/[^a-z0-9&'#-]+/)) {
    const term = raw.replace(/^[-']+|[-']+$/g, "");
    if (!term || STOPWORDS.has(term)) continue;
    if (term.length < 2 && !/\d/.test(term)) continue;
    if (seen.has(term)) continue;
    seen.add(term);
    out.terms.push(term);
    if (out.terms.length >= 8) break;
  }

  return out;
}

/** "dresses" → ["dresses", "dress"], "tops" → ["tops", "top"]. */
function wordForms(term: string): string[] {
  const forms = new Set([term]);
  if (term.length > 4 && term.endsWith("es")) forms.add(term.slice(0, -2));
  if (term.length > 3 && term.endsWith("s")) forms.add(term.slice(0, -1));
  return [...forms];
}

function caseForms(word: string): string[] {
  return [word, word.toUpperCase(), word.charAt(0).toUpperCase() + word.slice(1)];
}

function termWhere(term: string): Prisma.ProductWhereInput {
  const forms = wordForms(term);
  const contains = (v: string) => ({ contains: v, mode: "insensitive" as const });
  const or: Prisma.ProductWhereInput[] = [];

  for (const v of forms) {
    or.push(
      { name: contains(v) },
      { description: contains(v) },
      { sku: contains(v) },
      { material: contains(v) },
      { measurements: contains(v) },
      { categories: { some: { category: { name: contains(v) } } } },
      { collections: { some: { collection: { name: contains(v) } } } },
      {
        variants: {
          some: {
            isActive: true,
            OR: [{ name: contains(v) }, { size: contains(v) }, { colour: contains(v) }],
          },
        },
      },
    );
  }

  const tagForms = forms.flatMap(caseForms);
  or.push({ colours: { hasSome: tagForms } }, { sizes: { hasSome: tagForms } });

  return { OR: or };
}

/** Price filter on what the shopper actually pays (sale price when one is set). */
export function effectivePriceWhere(minNaira?: number, maxNaira?: number): Prisma.ProductWhereInput | null {
  if (minNaira == null && maxNaira == null) return null;
  const range: Prisma.IntFilter = {};
  if (minNaira != null) range.gte = Math.round(minNaira * 100);
  if (maxNaira != null) range.lte = Math.round(maxNaira * 100);
  return {
    OR: [{ salePriceKobo: null, priceKobo: range }, { salePriceKobo: range }],
  };
}

/** Every term must match somewhere on the product (name, colour, category, …). */
export function searchTermsWhere(terms: string[]): Prisma.ProductWhereInput[] {
  return terms.map(termWhere);
}

/** Human-readable chips describing how a query was understood. */
export function describeParsedSearch(parsed: ParsedSearch): string[] {
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const chips: string[] = [];
  if (parsed.minPrice != null && parsed.maxPrice != null) {
    chips.push(`${fmt(parsed.minPrice)} – ${fmt(parsed.maxPrice)}`);
  } else if (parsed.maxPrice != null) {
    chips.push(`Under ${fmt(parsed.maxPrice)}`);
  } else if (parsed.minPrice != null) {
    chips.push(`Over ${fmt(parsed.minPrice)}`);
  }
  if (parsed.onSale) chips.push("On sale");
  if (parsed.oneOfOne) chips.push("One of one");
  if (parsed.inStock) chips.push("In stock");
  if (parsed.condition) chips.push(parsed.condition.replace(/_/g, " ").toLowerCase());
  return chips;
}
