"use client";

import Image from "next/image";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";
import { newsletterSchema } from "@/lib/schemas/api";
import { validateFormData } from "@/lib/forms/client";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const STORAGE_SUBSCRIBED = "wunmzy_newsletter_subscribed";
const STORAGE_DISMISSED = "wunmzy_newsletter_dismissed_at";
/** Wait this long after first page visit before showing the modal. */
const DELAY_MS = 2 * 60 * 1000;
/** After dismiss, wait this long before offering again. */
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const initialState: NewsletterState = { ok: false, message: "" };

function shouldOfferPopup(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(STORAGE_SUBSCRIBED) === "1") return false;
    const dismissedAt = Number(localStorage.getItem(STORAGE_DISMISSED) || "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return false;
  } catch {
    /* private mode — still show */
  }
  return true;
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!shouldOfferPopup()) return;
    const timer = window.setTimeout(() => {
      if (shouldOfferPopup()) setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      setDone(true);
      try {
        localStorage.setItem(STORAGE_SUBSCRIBED, "1");
      } catch {
        /* ignore */
      }
      toast.success(state.message);
      window.setTimeout(() => setOpen(false), 1600);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next && !done) {
      try {
        localStorage.setItem(STORAGE_DISMISSED, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("source", "popup");
    const result = validateFormData(newsletterSchema, formData);
    if (!result.ok) {
      setError(result.errors.email ?? result.message);
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const next = await subscribeNewsletter(initialState, formData);
      setState(next);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[420px]">
        <div className="newsletter-popup-card relative overflow-hidden rounded-2xl border border-[#e4dfd4] bg-[#f7f3ec] shadow-[0_28px_80px_-24px_rgba(40,32,20,0.45)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,110,0.22),_transparent_55%),linear-gradient(160deg,#faf7f1_0%,#f0ebe2_55%,#e8e0d4_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#c9a96e]/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[#8b7355]/10 blur-3xl"
          />

          <div className="relative px-7 pb-7 pt-10 sm:px-9 sm:pb-9 sm:pt-11">
            <div className="mb-6 flex justify-center">
              <div className="newsletter-popup-mark relative h-14 w-14 overflow-hidden rounded-full border border-[#d9d0c2] bg-white/70 shadow-sm backdrop-blur-sm">
                <Image
                  src={BRAND.markUrl}
                  alt=""
                  fill
                  className="object-contain p-2"
                  sizes="56px"
                />
              </div>
            </div>

            <DialogHeader className="space-y-3 text-center sm:text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7a62]">
                Wunmzy Co
              </p>
              <DialogTitle className="font-display text-[1.85rem] font-medium leading-tight tracking-tight text-[#1c1a16]">
                Stay in the look
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[18rem] text-[0.95rem] leading-relaxed text-[#5c564c]">
                New drops, restocks, and private offers — straight to your inbox.
              </DialogDescription>
            </DialogHeader>

            {done ? (
              <p className="newsletter-popup-success mt-8 text-center font-display text-xl text-[#1c1a16]">
                You&apos;re on the list
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-7 space-y-3" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-popup-email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="newsletter-popup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    aria-invalid={!!error}
                    className="h-12 border-[#d9d0c2] bg-white/80 text-base shadow-inner backdrop-blur-sm placeholder:text-[#9a9286] focus-visible:ring-[#c9a96e]/40"
                  />
                  {error ? (
                    <p className="text-xs text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-12 w-full bg-[#1c1a16] text-[0.95rem] tracking-wide text-[#f7f3ec] hover:bg-[#2e2a24]"
                >
                  {pending ? "Joining…" : "Join the newsletter"}
                </Button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="mx-auto block w-full py-1 text-center text-xs tracking-wide text-[#8a7a62] transition hover:text-[#1c1a16]"
                >
                  Not now
                </button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
