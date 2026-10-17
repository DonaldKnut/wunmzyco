"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  type AuthFormState,
} from "@/lib/actions/auth";
import {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "@/lib/schemas/auth";
import { validateFormData } from "@/lib/forms/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: AuthFormState = { ok: false, message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

function useActionFeedback(state: AuthFormState) {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
}

function mergeErrors(
  client: Record<string, string>,
  server?: Record<string, string>,
): Record<string, string> {
  return { ...client, ...(server ?? {}) };
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionFeedback(state);

  const fieldErrors = mergeErrors(errors, state.fieldErrors);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(loginFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="w-full space-y-5" noValidate>
      <input type="hidden" name="next" value={next && next.startsWith("/admin") ? next : "/admin"} />

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@wunmzyco.com"
          aria-invalid={!!fieldErrors.email}
          className={cn(fieldErrors.email && "border-destructive")}
          disabled={pending}
        />
        <FieldError message={fieldErrors.email} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
          className={cn(fieldErrors.password && "border-destructive")}
          disabled={pending}
        />
        <FieldError message={fieldErrors.password} />
      </div>

      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in to dashboard"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionFeedback(state);
  const fieldErrors = mergeErrors(errors, state.fieldErrors);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(registerFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" aria-invalid={!!fieldErrors.name} disabled={pending} />
        <FieldError message={fieldErrors.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          disabled={pending}
        />
        <FieldError message={fieldErrors.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters with upper, lower, and a number.
        </p>
        <FieldError message={fieldErrors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Staff?{" "}
        <Link href="/login" className="underline-offset-4 hover:underline">
          Sign in here
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionFeedback(state);
  const fieldErrors = mergeErrors(errors, state.fieldErrors);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(forgotPasswordFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="w-full space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          disabled={pending}
        />
        <FieldError message={fieldErrors.email} />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionFeedback(state);
  const fieldErrors = mergeErrors(errors, state.fieldErrors);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(resetPasswordFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="w-full space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters with upper, lower, and a number.
        </p>
        <FieldError message={fieldErrors.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.confirmPassword}
          disabled={pending}
        />
        <FieldError message={fieldErrors.confirmPassword} />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
