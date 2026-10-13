"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: NewsletterState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email
        </Label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email"
          autoComplete="email"
        />
      </div>
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? "Joining…" : "Join the list"}
      </Button>
      {state.message ? (
        <p
          className="w-full text-sm text-muted-foreground sm:col-span-2"
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
