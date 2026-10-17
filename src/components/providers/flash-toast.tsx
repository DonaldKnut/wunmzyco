"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { AUTH_FLASH_COOKIE } from "@/lib/auth/flash-constants";

const MESSAGES: Record<string, string> = {
  signedIn: "Signed in — welcome back",
  signedOut: "Signed out",
  reset: "Password updated — sign in with your new password",
};

function readAndClearFlash(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_FLASH_COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  const value = decodeURIComponent(match[1]);
  document.cookie = `${AUTH_FLASH_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
  return value;
}

/** Reads a one-shot flash cookie and toasts — no URL rewrite / navigation bounce. */
export function FlashToast() {
  const seen = useRef(false);

  useEffect(() => {
    if (seen.current) return;
    const kind = readAndClearFlash();
    if (!kind) return;
    seen.current = true;
    const text = MESSAGES[kind];
    if (text) toast.success(text);
  }, []);

  return null;
}
