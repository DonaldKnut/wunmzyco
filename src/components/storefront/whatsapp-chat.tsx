"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Minus, X } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "We're online",
  "Chat with us on WhatsApp",
  "Outfit help in minutes",
  "Ask about sizes & styles",
] as const;

const FIRST_OPEN_AFTER_MS = 8_000;
const AUTO_CLOSE_AFTER_MS = 12_000;
const REOPEN_EVERY_MS = 6 * 60_000;
const LAST_KEY = "wunmzy-wa-last-auto-open";

export function WhatsAppChat({
  className,
  hideOnAdmin = true,
}: {
  className?: string;
  hideOnAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const closeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const suppressAutoCloseRef = useRef(false);

  function clearTimer(ref: { current: number | null }) {
    if (ref.current != null) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  }

  function markAutoOpen() {
    try {
      sessionStorage.setItem(LAST_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  function readLastAutoOpen() {
    try {
      const raw = sessionStorage.getItem(LAST_KEY);
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  }

  function scheduleAutoOpen(delayMs: number) {
    clearTimer(openTimerRef);
    openTimerRef.current = window.setTimeout(() => {
      markAutoOpen();
      suppressAutoCloseRef.current = false;
      setOpen(true);
    }, delayMs);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // One auto-open cycle per delay window — not every few seconds
  useEffect(() => {
    if (!mounted) return;

    const last = readLastAutoOpen();
    const elapsed = Date.now() - last;
    const delay =
      !last || Number.isNaN(last)
        ? FIRST_OPEN_AFTER_MS
        : Math.max(REOPEN_EVERY_MS - elapsed, 1_000);

    scheduleAutoOpen(delay);

    return () => clearTimer(openTimerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only scheduler
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    if (suppressAutoCloseRef.current) return;

    clearTimer(closeTimerRef);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      scheduleAutoOpen(REOPEN_EVERY_MS);
    }, AUTO_CLOSE_AFTER_MS);

    return () => clearTimer(closeTimerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setMsgVisible(false);
      window.setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 280);
    }, 3500);
    return () => window.clearInterval(id);
  }, [open]);

  if (hideOnAdmin && pathname?.startsWith("/admin")) return null;
  // Keep auth screens clear — FAB/panel can cover mobile inputs
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/reset-password")
  ) {
    return null;
  }
  if (!mounted) return null;

  const href = whatsappLink(
    BRAND.whatsappNumber,
    "Hi Wunmzy Co — I’d like to chat about an outfit.",
  );

  function openManual() {
    clearTimer(closeTimerRef);
    clearTimer(openTimerRef);
    suppressAutoCloseRef.current = true;
    setOpen(true);
  }

  function closeManual() {
    clearTimer(closeTimerRef);
    clearTimer(openTimerRef);
    suppressAutoCloseRef.current = false;
    setOpen(false);
    markAutoOpen();
    scheduleAutoOpen(REOPEN_EVERY_MS);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openManual}
        className={cn(
          "wa-fab-pulse fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(17,17,17,0.2)] transition duration-300 hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
          className,
        )}
        aria-label="Open WhatsApp chat — we're online"
        aria-expanded={false}
      >
        <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-emerald-200 ring-2 ring-[#25D366] wa-online-dot" />
        <MessageCircle className="h-6 w-6" aria-hidden />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-40 w-[min(calc(100vw-1.5rem),17.5rem)] flex-col items-end gap-2",
        className,
      )}
      aria-expanded={true}
    >
      <div className="wa-panel w-full overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-[0_16px_40px_rgba(17,17,17,0.16)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-[#25D366] px-3 py-2.5 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-200 ring-2 ring-[#25D366] wa-online-dot" />
            </span>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight">Wunmzy Co</p>
              <p
                key={MESSAGES[msgIndex]}
                className={cn(
                  "truncate text-[11px] text-white/90 transition-all duration-300",
                  msgVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                )}
              >
                {MESSAGES[msgIndex]}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={closeManual}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20"
              aria-label="Minimize WhatsApp chat"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={closeManual}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20"
              aria-label="Close WhatsApp chat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-3 px-3 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            We&apos;re online now — ask about Corporate, Street, Dinner, or Party looks.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Start chat
          </a>
        </div>
      </div>
    </div>
  );
}
