"use client";

import { useActionState } from "react";
import { submitCheckout, type CheckoutState } from "@/lib/actions/checkout";
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

export function CheckoutForm({ zones, defaultEmail, defaultName, defaultPhone }: CheckoutFormProps) {
  const [state, action, pending] = useActionState(submitCheckout, initial);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="font-display mb-4 text-2xl">Delivery</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required defaultValue={defaultName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required defaultValue={defaultEmail} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required defaultValue={defaultPhone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street address</Label>
              <Input id="street" name="street" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (optional)</Label>
              <Input id="landmark" name="landmark" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryZoneId">Delivery zone</Label>
              {zones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Delivery zones are not configured yet. Please check back or contact us.
                </p>
              ) : (
                <>
                  <select
                    id="deliveryZoneId"
                    name="deliveryZoneId"
                    required
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
                    defaultValue=""
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
                </>
              )}
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
        {state.message ? (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending || zones.length === 0}>
          {pending ? "Processing…" : "Continue to payment"}
        </Button>
      </div>
    </form>
  );
}
