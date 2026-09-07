"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { PLAN } from "../lib/billing";

const STRIPE_API = "https://api.stripe.com/v1";

function formEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * Creates a Stripe Checkout session (credit card + PIX for Brazilian
 * accounts) and returns the hosted payment URL.
 */
export const createCheckout = action({
  args: {},
  handler: async (ctx): Promise<{ url: string; paymentId: string }> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "Pagamento online ainda não configurado neste ambiente. Defina STRIPE_SECRET_KEY nas chaves do projeto — enquanto isso, a administração pode ativar seu acesso manualmente.",
      );
    }

    const professional = await ctx.runQuery(api.professionals.getMine, {});
    if (!professional) {
      throw new Error("Complete a configuração inicial do seu espaço.");
    }
    if (professional.paidUntil && professional.paidUntil > Date.now()) {
      throw new Error("Sua assinatura já está ativa.");
    }

    const paymentId = await ctx.runMutation(
      internal.billing.createPendingPayment,
      { professionalId: professional._id },
    );

    const siteUrl = process.env.SITE_URL;
    const body: Record<string, string> = {
      mode: "payment",
      client_reference_id: paymentId,
      "metadata[paymentId]": paymentId,
      locale: "pt-BR",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "brl",
      "line_items[0][price_data][unit_amount]": String(PLAN.priceCents),
      "line_items[0][price_data][product_data][name]":
        `Retorno Massagem — ${PLAN.name} (${PLAN.periodDays} dias)`,
      "line_items[0][price_data][product_data][description]":
        "Assinatura mensal da plataforma de gestão para massoterapeutas",
    };
    if (siteUrl) {
      body.success_url = `${siteUrl}/assinatura`;
      body.cancel_url = `${siteUrl}/assinatura`;
    }

    const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": paymentId,
      },
      body: formEncode(body),
    });
    const session = (await response.json()) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    };
    if (!response.ok || !session.url) {
      throw new Error(
        session.error?.message ??
          "Não foi possível iniciar o pagamento. Tente novamente.",
      );
    }

    return { url: session.url, paymentId };
  },
});

/**
 * Checks the gateway for the latest checkout session of a payment record and
 * confirms it when the charge was approved (works for PIX and card).
 */
export const syncPayment = action({
  args: { paymentId: v.id("payments") },
  handler: async (
    ctx,
    { paymentId },
  ): Promise<{ paid: boolean; configured: boolean }> => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return { paid: false, configured: false };

    const payment = await ctx.runQuery(internal.billing.getPayment, { id: paymentId });
    if (!payment) return { paid: false, configured: true };
    if (payment.status === "paid") return { paid: true, configured: true };

    const reference = payment.externalReference ?? paymentId;
    const listResponse = await fetch(
      `${STRIPE_API}/checkout/sessions?client_reference_id=${encodeURIComponent(reference)}&limit=3&expand[]=data.payment_intent.payment_method`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    if (!listResponse.ok) return { paid: false, configured: true };
    const list = (await listResponse.json()) as {
      data?: Array<{
        id: string;
        payment_status?: string;
        payment_intent?:
          | string
          | { id: string; payment_method?: { type?: string } | null }
          | null;
      }>;
    };

    const paidSession = list.data?.find(
      (session) => session.payment_status === "paid",
    );
    if (!paidSession) return { paid: false, configured: true };

    const paymentMethod =
      typeof paidSession.payment_intent === "object"
        ? paidSession.payment_intent?.payment_method?.type
        : undefined;
    const method: "credit_card" | "pix" | "outros" =
      paymentMethod === "pix"
        ? "pix"
        : paymentMethod === "card"
          ? "credit_card"
          : "outros";
    const providerPaymentId =
      typeof paidSession.payment_intent === "object"
        ? paidSession.payment_intent?.id
        : typeof paidSession.payment_intent === "string"
          ? paidSession.payment_intent
          : paidSession.id;

    await ctx.runMutation(internal.billing.markPaid, {
      paymentId,
      providerPaymentId,
      method,
      paidAt: Date.now(),
    });
    return { paid: true, configured: true };
  },
});
