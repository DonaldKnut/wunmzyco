"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useAdminTour } from "@/components/admin/tour/tour-context";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;

/** Prefer a visible target (open mobile drawer / expanded desktop sidebar). */
function measure(selector?: string): Rect | null {
  if (!selector || typeof document === "undefined") return null;
  const nodes = Array.from(document.querySelectorAll(selector));
  let best: Rect | null = null;
  let bestScore = -1;

  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const visibleW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const visibleH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const score = visibleW * visibleH;
    if (score <= 0 && r.left < -20) continue; // fully off-canvas drawer

    if (score > bestScore) {
      bestScore = score;
      best = {
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      };
    }
  }

  return best;
}

export function AdminTourOverlay() {
  const { active, stepIndex, steps, next, prev, skip, stop } = useAdminTour();
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const step = steps[stepIndex];
  const prefersCenter = !step?.selector || step.placement === "center";
  const hasSpotlight = Boolean(rect) && !prefersCenter;
  const total = steps.length;

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!active || !step) return;

    function prepareSidebar() {
      try {
        if (localStorage.getItem("wunmzy-admin-sidebar") === "1") {
          localStorage.setItem("wunmzy-admin-sidebar", "0");
        }
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event("wunmzy-expand-sidebar"));
      if (step.needsSidebar && window.matchMedia("(max-width: 1023px)").matches) {
        window.dispatchEvent(new Event("wunmzy-open-mobile-sidebar"));
      }
      if (!step.needsSidebar && window.matchMedia("(max-width: 1023px)").matches) {
        window.dispatchEvent(new Event("wunmzy-close-mobile-sidebar"));
      }
    }

    function update() {
      if (prefersCenter) {
        setRect(null);
        return;
      }
      prepareSidebar();
      const nextRect = measure(step.selector);
      setRect(nextRect);
      if (nextRect && step.selector) {
        const el = document.querySelector(step.selector);
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    update();
    const t1 = window.setTimeout(update, 50);
    const t2 = window.setTimeout(update, 280);
    const t3 = window.setTimeout(update, 450);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step, stepIndex, prefersCenter]);

  React.useEffect(() => {
    if (!active) {
      window.dispatchEvent(new Event("wunmzy-close-mobile-sidebar"));
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, skip]);

  if (!mounted || !active || !step) return null;

  const placement = step.placement ?? "bottom";
  const showCenteredCard = !hasSpotlight;
  const tooltipStyle = tooltipPosition(rect, placement, showCenteredCard);

  return createPortal(
    <div
      className="fixed inset-0 z-[110]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-tour-title"
    >
      {hasSpotlight && rect ? (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(17, 17, 17, 0.62)",
            outline: "2px solid rgba(247, 243, 236, 0.85)",
          }}
        />
      ) : (
        <button
          type="button"
          aria-label="Dismiss tour overlay"
          className="absolute inset-0 bg-[#111]/60 backdrop-blur-[2px] transition-opacity"
          onClick={skip}
        />
      )}

      {hasSpotlight && rect ? (
        <button
          type="button"
          aria-label="Skip tour"
          className="absolute inset-0 cursor-default"
          style={{ clipPath: spotlightClip(rect) }}
          onClick={skip}
        />
      ) : null}

      <div
        className={cn(
          "absolute z-[111] w-[min(100vw-2rem,22rem)] animate-in fade-in-0 zoom-in-95 rounded-2xl border border-[#e8e4dc] bg-[#faf8f5] p-5 shadow-2xl duration-200",
          showCenteredCard && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={showCenteredCard ? undefined : tooltipStyle}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a776f]">
            Tour · {stepIndex + 1} / {total}
          </p>
          <button
            type="button"
            onClick={skip}
            className="text-xs text-[#7a776f] underline-offset-2 hover:text-[#1a1a18] hover:underline"
          >
            Skip
          </button>
        </div>

        <div className="mb-3 h-1 overflow-hidden rounded-full bg-[#eee9e0]">
          <div
            className="h-full rounded-full bg-[#1a1a18] transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          />
        </div>

        <h2 id="admin-tour-title" className="text-base font-semibold tracking-tight text-[#1a1a18]">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5c5a54]">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            className="h-9 rounded-md px-3 text-sm font-medium text-[#3d3b36] transition hover:bg-[#ebe6dd] disabled:pointer-events-none disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (stepIndex >= total - 1) stop();
              else next();
            }}
            className="inline-flex h-9 items-center rounded-md bg-[#1a1a18] px-4 text-sm font-medium text-[#faf8f5] transition hover:bg-[#2d2d2a]"
          >
            {stepIndex >= total - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function spotlightClip(rect: Rect): string {
  const { top, left, width, height } = rect;
  const right = left + width;
  const bottom = top + height;
  return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px)`;
}

function tooltipPosition(
  rect: Rect | null,
  placement: string,
  isCenter: boolean,
): React.CSSProperties | undefined {
  if (isCenter || !rect) return undefined;
  const gap = 14;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tipW = Math.min(vw - 32, 352);
  const isMobile = vw < 1024;

  let top = rect.top;
  let left = rect.left;

  // On mobile, drawer is left — place tooltip to the right of drawer or below target
  if (isMobile && (placement === "right" || placement === "left")) {
    top = Math.min(rect.top + rect.height + gap, vh - 240);
    left = Math.max(16, Math.min(rect.left, vw - tipW - 16));
  } else {
    switch (placement) {
      case "right":
        top = rect.top + rect.height / 2 - 80;
        left = rect.left + rect.width + gap;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 80;
        left = rect.left - tipW - gap;
        break;
      case "top":
        top = rect.top - gap - 160;
        left = rect.left + rect.width / 2 - tipW / 2;
        break;
      case "bottom":
      default:
        top = rect.top + rect.height + gap;
        left = rect.left + rect.width / 2 - tipW / 2;
        break;
    }
  }

  top = Math.max(16, Math.min(top, vh - 220));
  left = Math.max(16, Math.min(left, vw - tipW - 16));

  return { top, left, width: tipW };
}
