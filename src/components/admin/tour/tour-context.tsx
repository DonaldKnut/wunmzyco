"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_TOUR_STEPS, TOUR_STORAGE_KEY } from "@/lib/admin/tour-steps";

type TourContextValue = {
  active: boolean;
  stepIndex: number;
  steps: typeof ADMIN_TOUR_STEPS;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
};

const TourContext = React.createContext<TourContextValue | null>(null);

function markSeen() {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function AdminTourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const autoStarted = React.useRef(false);

  const stop = React.useCallback(() => {
    setActive(false);
    setStepIndex(0);
    markSeen();
  }, []);

  const skip = React.useCallback(() => {
    stop();
  }, [stop]);

  const start = React.useCallback(() => {
    if (pathname !== "/admin") {
      router.push("/admin?tour=1");
      return;
    }
    setStepIndex(0);
    setActive(true);
  }, [pathname, router]);

  const next = React.useCallback(() => {
    setStepIndex((i) => {
      if (i >= ADMIN_TOUR_STEPS.length - 1) {
        markSeen();
        setActive(false);
        return 0;
      }
      return i + 1;
    });
  }, []);

  const prev = React.useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // First visit auto-start on overview
  React.useEffect(() => {
    if (autoStarted.current) return;
    if (pathname !== "/admin") return;
    try {
      if (localStorage.getItem(TOUR_STORAGE_KEY) === "done") return;
    } catch {
      return;
    }
    autoStarted.current = true;
    const t = window.setTimeout(() => {
      setStepIndex(0);
      setActive(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Resume tour after navigating from "Take a tour" while off overview
  React.useEffect(() => {
    if (pathname !== "/admin") return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") !== "1") return;
    setStepIndex(0);
    setActive(true);
    router.replace("/admin", { scroll: false });
  }, [pathname, router]);

  const value: TourContextValue = {
    active,
    stepIndex,
    steps: ADMIN_TOUR_STEPS,
    start,
    stop,
    next,
    prev,
    skip,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useAdminTour() {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error("useAdminTour must be used within AdminTourProvider");
  return ctx;
}
