"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";
import { newsletterSchema } from "@/lib/schemas/api";
import { validateFormData } from "@/lib/forms/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: NewsletterState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(newsletterSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setError(result.errors.email ?? result.message);
      return;
    }
    setError(undefined);
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-end"
      noValidate
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email
        </Label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Your email"
          autoComplete="email"
          aria-invalid={!!error}
        />
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? "Joining…" : "Join the list"}
      </Button>
    </form>
  );
}
