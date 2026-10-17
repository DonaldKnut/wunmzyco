"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, { type: "success" | "info"; text: string }> = {
  signedIn: { type: "success", text: "Signed in successfully" },
  signedOut: { type: "success", text: "Signed out" },
  reset: { type: "success", text: "Password updated — you can sign in now" },
};

/** Shows one-shot toasts from URL query flags, then strips them from the URL. */
export function FlashToast() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    const key =
      params.get("signedIn") === "1"
        ? "signedIn"
        : params.get("signedOut") === "1"
          ? "signedOut"
          : params.get("reset") === "1"
            ? "reset"
            : null;
    if (!key) return;

    const token = `${pathname}?${key}`;
    if (seen.current === token) return;
    seen.current = token;

    const msg = MESSAGES[key];
    if (msg?.type === "success") toast.success(msg.text);
    else if (msg) toast.message(msg.text);

    const next = new URLSearchParams(params.toString());
    next.delete("signedIn");
    next.delete("signedOut");
    next.delete("reset");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
