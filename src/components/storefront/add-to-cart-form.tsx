"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { addToCart, removeProductFromCart, setProductCartQuantity } from "@/lib/actions/cart";
import { formatNgn } from "@/lib/currency";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  stock: number;
  priceKobo: number | null;
  salePriceKobo: number | null;
};

type AddToCartFormProps = {
  productId: string;
  productName: string;
  stock: number;
  hasVariants: boolean;
  variants: Variant[];
  basePriceKobo: number;
  /** WhatsApp link that already names this item and links to it. */
  enquiryHref: string;
  /** Current quantity already in cart for this product (default variant or first). */
  initialCartQuantity?: number;
  isOneOfOne?: boolean;
};

const FORM_ID = "pdp-add-to-cart";

export function AddToCartForm({
  productId,
  productName,
  stock,
  hasVariants,
  variants,
  basePriceKobo,
  enquiryHref,
  initialCartQuantity = 0,
  isOneOfOne = false,
}: AddToCartFormProps) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [cartQty, setCartQty] = useState(initialCartQuantity);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pending, startTransition] = useTransition();
  const { bumpCart, openCart } = useStorefrontUi();
  const actionsRef = useRef<HTMLDivElement>(null);

  const selected = variants.find((v) => v.id === variantId);
  const available = hasVariants ? (selected?.stock ?? 0) : stock;
  const maxQty = isOneOfOne ? 1 : Math.max(1, available);
  const soldOut = available <= 0;
  const unitPrice = selected?.salePriceKobo ?? selected?.priceKobo ?? basePriceKobo;

  // Mobile: pin a slim buy bar once the main buttons scroll out of view.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function clampQty(n: number) {
    return Math.min(maxQty, Math.max(1, n));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (soldOut) return;
    const formData = new FormData(e.currentTarget);
    formData.set("quantity", String(quantity));
    startTransition(async () => {
      const result = await addToCart(formData);
      if (result.ok) {
        toast.success(result.message);
        setCartQty((q) => q + quantity);
        bumpCart();
        openCart();
      } else {
        toast.error(result.message);
      }
    });
  }

  function onSetCartQuantity(next: number) {
    startTransition(async () => {
      const result = await setProductCartQuantity({
        productId,
        variantId: hasVariants ? variantId || null : null,
        quantity: next,
      });
      if (result.ok) {
        setCartQty(next);
        bumpCart();
        toast.success(next === 0 ? "Removed from bag" : "Bag updated");
      } else {
        toast.error(result.message);
      }
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeProductFromCart({
        productId,
        variantId: hasVariants ? variantId || null : null,
      });
      if (result.ok) {
        setCartQty(0);
        bumpCart();
        toast.success("Removed from bag");
      } else {
        toast.error(result.message);
      }
    });
  }

  const addLabel = soldOut ? "Sold out" : pending ? "Adding…" : "Add to cart";

  return (
    <>
      <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
        <input type="hidden" name="productId" value={productId} />
        {hasVariants ? <input type="hidden" name="variantId" value={variantId} /> : null}

        {hasVariants && variants.length > 0 ? (
          <fieldset className="space-y-2.5">
            <legend className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Option
              {selected ? (
                <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                  {selected.name}
                </span>
              ) : null}
            </legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const isActive = v.id === variantId;
                const out = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={out || pending}
                    onClick={() => {
                      setVariantId(v.id);
                      setQuantity(1);
                    }}
                    aria-pressed={isActive}
                    className={cn(
                      "min-w-12 rounded-full border px-4 py-2 text-sm transition",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/60",
                      out && "cursor-not-allowed text-muted-foreground line-through opacity-60",
                    )}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {!soldOut && maxQty > 1 ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Quantity
            </span>
            <div className="inline-flex h-11 items-center rounded-full border border-border bg-background">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || pending}
                onClick={() => setQuantity((q) => clampQty(q - 1))}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= maxQty || pending}
                onClick={() => setQuantity((q) => clampQty(q + 1))}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div ref={actionsRef} className="grid gap-2.5 sm:grid-cols-2">
          <button
            type="submit"
            disabled={soldOut || pending}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide transition",
              soldOut
                ? "cursor-not-allowed bg-secondary text-muted-foreground"
                : "bg-[#121110] text-[#fbf9f5] hover:bg-[#2a2824]",
            )}
          >
            <ShoppingBag
              className={cn("h-4 w-4 text-[#d4af37]", pending && "animate-pulse")}
              aria-hidden
            />
            {addLabel}
          </button>
          <a
            href={enquiryHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-50/60 px-6 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            aria-label={`Ask about ${productName} on WhatsApp`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Ask on WhatsApp
          </a>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Add to cart, then pay online with Paystack or choose to pay via WhatsApp at checkout.
          Have a question first? Tap <span className="text-foreground">Ask on WhatsApp</span> — we
          get a link to this exact item.
        </p>

        {cartQty > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                In your bag:{" "}
                <strong className="tabular-nums text-foreground">{cartQty}</strong>
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Decrease bag quantity"
                  disabled={pending || cartQty <= 1}
                  onClick={() => onSetCartQuantity(cartQty - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background disabled:opacity-30"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Increase bag quantity"
                  disabled={pending || cartQty >= maxQty}
                  onClick={() => onSetCartQuantity(cartQty + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Remove from bag"
                  disabled={pending}
                  onClick={onRemove}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Checkout
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        ) : null}
      </form>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur transition-transform duration-300 lg:hidden",
          showStickyBar ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
        aria-hidden={!showStickyBar}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{productName}</p>
            <p className="text-base font-semibold tabular-nums text-foreground">
              {formatNgn(unitPrice)}
            </p>
          </div>
          <a
            href={enquiryHref}
            target="_blank"
            rel="noreferrer"
            tabIndex={showStickyBar ? 0 : -1}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-600/40 bg-emerald-50 text-emerald-800"
            aria-label={`Ask about ${productName} on WhatsApp`}
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button
            type="submit"
            form={FORM_ID}
            disabled={soldOut || pending}
            tabIndex={showStickyBar ? 0 : -1}
            className={cn(
              "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold",
              soldOut
                ? "bg-secondary text-muted-foreground"
                : "bg-[#121110] text-[#fbf9f5]",
            )}
          >
            <ShoppingBag className="h-4 w-4 text-[#d4af37]" aria-hidden />
            {addLabel}
          </button>
        </div>
      </div>
    </>
  );
}
