"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { submitCheckout, type CheckoutState } from "@/lib/actions/checkout";
import { checkoutFormSchema } from "@/lib/schemas/checkout";
import { validateFormData } from "@/lib/forms/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: CheckoutState = { ok: false, message: "" };

type Zone = { id: string; name: string; estimatedWindow: string | null };

type CheckoutFormProps = {
  zones: Zone[];
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

export function CheckoutForm({ zones, defaultEmail, defaultName, defaultPhone }: CheckoutFormProps) {
  const [state, action, pending] = useActionState(submitCheckout, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!state.message) return;
    toast.error(state.message);
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(checkoutFormSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <form action={action} onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-2" noValidate>
      <div className="space-y-6">
        <div>
          <h2 className="font-display mb-4 text-2xl">Delivery</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={defaultName} aria-invalid={!!errors.fullName} />
              <FieldError message={errors.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultEmail}
                aria-invalid={!!errors.email}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={defaultPhone} aria-invalid={!!errors.phone} />
              <FieldError message={errors.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street address</Label>
              <Input id="street" name="street" aria-invalid={!!errors.street} />
              <FieldError message={errors.street} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (optional)</Label>
              <Input id="landmark" name="landmark" />
              <FieldError message={errors.landmark} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" aria-invalid={!!errors.city} />
                <FieldError message={errors.city} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" aria-invalid={!!errors.state} />
                <FieldError message={errors.state} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryZoneId">Delivery zone</Label>
              {zones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Delivery zones are not configured yet. Please check back or contact us.
                </p>
              ) : (
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <select
                    id="deliveryZoneId"
                    name="deliveryZoneId"
                    className="flex h-10 w-full border border-input bg-background py-2 pl-9 pr-3 text-sm"
                    defaultValue=""
                    aria-invalid={!!errors.deliveryZoneId}
                  >
                    <option value="" disabled>
                      Select a zone
                    </option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                        {z.estimatedWindow ? ` · ${z.estimatedWindow}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <FieldError message={errors.deliveryZoneId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Delivery notes (optional)</Label>
              <Textarea id="deliveryNotes" name="deliveryNotes" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon (optional)</Label>
              <Input id="couponCode" name="couponCode" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-2xl">Payment</h2>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be redirected to complete payment securely. Totals include delivery based on
          your zone and cart weight.
        </p>
        <Button type="submit" size="lg" className="w-full" disabled={pending || zones.length === 0}>
          {pending ? "Processing…" : "Continue to payment"}
        </Button>
      </div>
    </form>
  );
}
