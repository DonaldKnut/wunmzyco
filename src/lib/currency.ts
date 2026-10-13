/** All money amounts are stored as integer kobo (1 NGN = 100 kobo). */

export const NGN_LOCALE = "en-NG";
export const CURRENCY = "NGN" as const;

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) {
    throw new Error("Invalid naira amount");
  }
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  if (!Number.isInteger(kobo)) {
    throw new Error("Kobo amount must be an integer");
  }
  return kobo / 100;
}

export function formatNgn(kobo: number): string {
  if (!Number.isInteger(kobo)) {
    throw new Error("Amount must be integer kobo");
  }
  return new Intl.NumberFormat(NGN_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(koboToNaira(kobo));
}

export function addKobo(...amounts: number[]): number {
  return amounts.reduce((sum, value) => {
    if (!Number.isInteger(value)) {
      throw new Error("All amounts must be integer kobo");
    }
    return sum + value;
  }, 0);
}

export function multiplyKobo(unitKobo: number, quantity: number): number {
  if (!Number.isInteger(unitKobo) || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Invalid multiply inputs");
  }
  return unitKobo * quantity;
}

export function assertPositiveKobo(amount: number, label = "amount"): void {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`${label} must be a non-negative integer in kobo`);
  }
}

/** Paystack expects the amount in the lowest currency unit (kobo for NGN). */
export function toPaystackAmount(kobo: number): number {
  assertPositiveKobo(kobo, "Paystack amount");
  if (kobo < 100) {
    throw new Error("Paystack minimum amount is ₦1.00 (100 kobo)");
  }
  return kobo;
}
