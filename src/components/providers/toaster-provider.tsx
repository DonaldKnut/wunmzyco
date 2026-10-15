"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      visibleToasts={4}
      gap={10}
      offset={24}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "wunmzy-toast group flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl border border-white/40 px-4 py-3.5 font-sans text-sm text-foreground shadow-[0_12px_40px_rgba(17,17,17,0.12)] backdrop-blur-xl backdrop-saturate-150",
          title: "font-medium leading-snug",
          description: "mt-0.5 text-xs text-muted-foreground",
          actionButton:
            "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground",
          cancelButton: "rounded-full bg-white/40 px-3 py-1 text-xs font-medium",
          closeButton:
            "rounded-full border border-white/30 bg-white/30 p-1 text-foreground/70 transition hover:bg-white/50",
          success: "wunmzy-toast--success",
          error: "wunmzy-toast--error",
          info: "wunmzy-toast--info",
          warning: "wunmzy-toast--warning",
        },
      }}
    />
  );
}
