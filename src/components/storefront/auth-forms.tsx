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

const initial: AuthFormState = { ok: false, message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

function useActionToast(state: AuthFormState) {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
}

export function LoginForm({
  next,
  staffHint,
}: {
  next?: string;
  staffHint?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionToast(state);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = validateFormData(loginFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        <FieldError message={errors.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
        />
        <FieldError message={errors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      {staffHint ? (
        <p className="text-center text-xs text-muted-foreground">
          Staff sign-in only — customer accounts use the same form but cannot access admin
          without a staff role.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="underline-offset-4 hover:underline">
            Forgot password?
          </Link>
          {" · "}
          <Link href="/register" className="underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>
      )}
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionToast(state);

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
        <Input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
        <FieldError message={errors.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        <FieldError message={errors.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
        />
        <p className="text-xs text-muted-foreground">
          At least 10 characters with upper, lower, and a number.
        </p>
        <FieldError message={errors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useActionToast(state);

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
    <form action={action} onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        <FieldError message={errors.email} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
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
  useActionToast(state);

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
    <form action={action} onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
        />
        <FieldError message={errors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
