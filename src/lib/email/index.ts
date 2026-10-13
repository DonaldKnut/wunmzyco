import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  template: string;
  metadata?: Record<string, unknown>;
};

async function logAttempt(
  payload: EmailPayload,
  status: string,
  error?: string,
) {
  await prisma.notificationLog.create({
    data: {
      channel: "email",
      toAddress: payload.to,
      template: payload.template,
      status,
      error,
      metadataJson: (payload.metadata ?? {}) as object,
    },
  });
}

export async function sendEmail(payload: EmailPayload): Promise<{ sent: boolean; warning?: string }> {
  const env = getEnv();

  if (env.EMAIL_PROVIDER === "console" || !env.RESEND_API_KEY) {
    logger.info("Email (console provider)", {
      to: payload.to,
      subject: payload.subject,
      template: payload.template,
    });
    await logAttempt(payload, "console");
    return {
      sent: false,
      warning: "Email delivery disabled — using console provider or missing RESEND_API_KEY",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      await logAttempt(payload, "failed", text);
      logger.error("Resend send failed", { status: res.status });
      return { sent: false, warning: "Failed to send email" };
    }

    await logAttempt(payload, "sent");
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logAttempt(payload, "failed", message);
    return { sent: false, warning: message };
  }
}

export function orderConfirmationHtml(params: {
  customerName: string;
  orderNumber: string;
  totalFormatted: string;
  trackingUrl: string;
}) {
  return `
    <div style="font-family: Georgia, serif; color: #111; line-height: 1.5;">
      <h1 style="font-weight: 500;">Thank you, ${params.customerName}</h1>
      <p>We've received your order <strong>${params.orderNumber}</strong>.</p>
      <p>Total: ${params.totalFormatted}</p>
      <p><a href="${params.trackingUrl}">Track your order</a></p>
      <p style="color:#666;font-size:14px;">Wunmzy Co</p>
    </div>
  `;
}

export function paymentConfirmationHtml(params: {
  customerName: string;
  orderNumber: string;
  totalFormatted: string;
}) {
  return `
    <div style="font-family: Georgia, serif; color: #111; line-height: 1.5;">
      <h1 style="font-weight: 500;">Payment confirmed</h1>
      <p>Hi ${params.customerName}, we've confirmed payment for order <strong>${params.orderNumber}</strong>.</p>
      <p>Amount: ${params.totalFormatted}</p>
      <p style="color:#666;font-size:14px;">Wunmzy Co</p>
    </div>
  `;
}
