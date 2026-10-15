"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { trackOrderAction, type TrackOrderState } from "@/lib/actions/track-order";
import { trackOrderSchema } from "@/lib/schemas/checkout";
import { validateFormData } from "@/lib/forms/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: TrackOrderState = { ok: false, message: "" };

export function TrackOrderForm({ presetToken }: { presetToken?: string }) {
  const [state, action, pending] = useActionState(trackOrderAction, initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success("Order found");
    else toast.error(state.message);
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = validateFormData(trackOrderSchema, formData);
    if (!result.ok) {
      e.preventDefault();
      setErrors(result.errors);
      return;
    }
    setErrors({});
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <form action={action} onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            name="orderNumber"
            placeholder="WNZ-…"
            aria-invalid={!!errors.orderNumber}
          />
          {errors.orderNumber ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.orderNumber}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Tracking token</Label>
          <Input
            id="token"
            name="token"
            defaultValue={presetToken}
            placeholder="From your confirmation email"
            aria-invalid={!!errors.token}
          />
          {errors.token ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.token}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {state.order ? (
        <div className="space-y-4 border border-border bg-card p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
            <p className="font-display text-2xl">{state.order.orderNumber}</p>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{state.order.status.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">{state.order.deliveryStatus.replace(/_/g, " ")}</dd>
            </div>
          </dl>
          {state.order.customerVisibleHistory.length > 0 ? (
            <ul className="space-y-3 border-t border-border pt-4 text-sm">
              {state.order.customerVisibleHistory.map((entry, i) => (
                <li key={`${entry.createdAt}-${i}`}>
                  <p className="font-medium">{entry.toStatus.replace(/_/g, " ")}</p>
                  {entry.note ? <p className="text-muted-foreground">{entry.note}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
