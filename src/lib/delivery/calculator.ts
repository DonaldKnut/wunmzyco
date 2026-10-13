/**
 * Server-side delivery fee calculator.
 *
 * Rounding: intermediate fees stay in integer kobo. Weight bands use
 * Math.ceil for partial bands so a fraction of a band is charged as a full band.
 * Missing product weights use the configured default and are flagged as estimated.
 */

export type DeliveryZoneInput = {
  id: string;
  code: string;
  name: string;
  baseFeeKobo: number;
  includedWeightGrams: number;
  incrementalFeeKobo: number;
  weightBandGrams: number;
  minChargeKobo: number | null;
  maxChargeKobo: number | null;
  freeDeliveryThresholdKobo: number | null;
  estimatedWindow: string | null;
  ruleVersion: number;
  isActive: boolean;
};

export type DeliveryQuoteBreakdown = {
  zoneCode: string;
  zoneName: string;
  weightGrams: number;
  includedWeightGrams: number;
  chargeableWeightGrams: number;
  bandsCharged: number;
  baseFeeKobo: number;
  incrementalFeeKobo: number;
  subtotalFeeKobo: number;
  freeDeliveryApplied: boolean;
  freeDeliveryThresholdKobo: number | null;
  minApplied: boolean;
  maxApplied: boolean;
  totalFeeKobo: number;
  weightEstimated: boolean;
  ruleVersion: number;
  estimatedWindow: string | null;
};

export type DeliveryQuoteResult = DeliveryQuoteBreakdown & {
  zoneId: string;
};

export function calculateShipmentWeight(
  items: Array<{ weightGrams: number | null | undefined; quantity: number }>,
  defaultWeightGrams: number,
): { totalGrams: number; estimated: boolean } {
  let total = 0;
  let estimated = false;
  for (const item of items) {
    const qty = item.quantity;
    if (!Number.isInteger(qty) || qty < 0) {
      throw new Error("Invalid item quantity for weight calculation");
    }
    const weight =
      item.weightGrams == null || item.weightGrams <= 0
        ? defaultWeightGrams
        : item.weightGrams;
    if (item.weightGrams == null || item.weightGrams <= 0) {
      estimated = true;
    }
    total += weight * qty;
  }
  return { totalGrams: total, estimated };
}

export function calculateDeliveryFee(
  zone: DeliveryZoneInput,
  weightGrams: number,
  options?: {
    subtotalKobo?: number;
    weightEstimated?: boolean;
  },
): DeliveryQuoteResult {
  if (!zone.isActive) {
    throw new Error("Selected delivery zone is not available");
  }
  if (!Number.isInteger(weightGrams) || weightGrams < 0) {
    throw new Error("Weight must be a non-negative integer in grams");
  }
  if (zone.weightBandGrams <= 0) {
    throw new Error("Invalid weight band configuration");
  }

  const included = Math.max(0, zone.includedWeightGrams);
  const chargeable = Math.max(0, weightGrams - included);
  const bandsCharged =
    chargeable === 0 ? 0 : Math.ceil(chargeable / zone.weightBandGrams);
  const incrementalTotal = bandsCharged * zone.incrementalFeeKobo;
  let fee = zone.baseFeeKobo + incrementalTotal;
  let freeDeliveryApplied = false;
  let minApplied = false;
  let maxApplied = false;

  const threshold = zone.freeDeliveryThresholdKobo;
  if (
    threshold != null &&
    options?.subtotalKobo != null &&
    options.subtotalKobo >= threshold
  ) {
    fee = 0;
    freeDeliveryApplied = true;
  }

  if (!freeDeliveryApplied && zone.minChargeKobo != null && fee < zone.minChargeKobo) {
    fee = zone.minChargeKobo;
    minApplied = true;
  }
  if (!freeDeliveryApplied && zone.maxChargeKobo != null && fee > zone.maxChargeKobo) {
    fee = zone.maxChargeKobo;
    maxApplied = true;
  }

  return {
    zoneId: zone.id,
    zoneCode: zone.code,
    zoneName: zone.name,
    weightGrams,
    includedWeightGrams: included,
    chargeableWeightGrams: chargeable,
    bandsCharged,
    baseFeeKobo: zone.baseFeeKobo,
    incrementalFeeKobo: incrementalTotal,
    subtotalFeeKobo: zone.baseFeeKobo + incrementalTotal,
    freeDeliveryApplied,
    freeDeliveryThresholdKobo: threshold,
    minApplied,
    maxApplied,
    totalFeeKobo: fee,
    weightEstimated: options?.weightEstimated ?? false,
    ruleVersion: zone.ruleVersion,
    estimatedWindow: zone.estimatedWindow,
  };
}
