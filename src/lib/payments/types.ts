export type InitializePaymentInput = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type InitializePaymentResult = {
  provider: string;
  reference: string;
  authorizationUrl: string;
  accessCode?: string;
  raw?: unknown;
};

export type VerifyPaymentInput = {
  reference: string;
};

export type VerifyPaymentResult = {
  provider: string;
  reference: string;
  status: "successful" | "failed" | "pending" | "abandoned";
  amountKobo: number;
  currency: string;
  paidAt?: Date | null;
  providerStatus?: string;
  raw?: unknown;
};

export type RefundPaymentInput = {
  reference: string;
  amountKobo: number;
  reason?: string;
};

export type RefundPaymentResult = {
  success: boolean;
  providerRefundId?: string;
  status: "processing" | "completed" | "failed" | "not_supported";
  message?: string;
  raw?: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  initialize(input: InitializePaymentInput): Promise<InitializePaymentResult>;
  verify(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  refund?(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}
