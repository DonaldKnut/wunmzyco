"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-background text-foreground font-sans",
        },
      }}
    />
  );
}
