import { CartLine } from "@/types";
import { formatINR } from "./utils";
import { branches } from "@/data/branches";

/**
 * WhatsApp integration — real & working right now.
 *
 * This uses WhatsApp's public "click to chat" deep link (wa.me), which
 * opens WhatsApp (mobile or web) with a prefilled message. It requires
 * NO API key, NO Meta Business verification, and NO backend — it works
 * the moment this site is deployed.
 *
 * This is different from the WhatsApp Business Platform (Cloud API),
 * which is what you'd use to automatically SEND confirmations, delivery
 * updates, etc. without the customer needing to hit "send" themselves.
 * That requires a Meta-verified WhatsApp Business Account + access token.
 * See src/lib/petpooja.ts for notes on wiring that up when you're ready.
 */

export function buildWhatsAppOrderLink(phoneWithCountryCode: string, message?: string): string {
  const text = message ?? "Hi Da Pizza Hub! I'd like to place an order.";
  return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppCartMessage(
  lines: CartLine[],
  subtotal: number,
  orderNumber?: string
): string {
  const itemLines = lines
    .map((l) => {
      const custom = l.customizationSummary ? ` (${l.customizationSummary})` : "";
      return `• ${l.quantity}x ${l.name}${custom} — ${formatINR(l.unitPrice * l.quantity)}`;
    })
    .join("\n");

  const header = orderNumber
    ? `New order from Da Pizza Hub website\nOrder #${orderNumber}\n\n`
    : `Hi Da Pizza Hub! I'd like to place this order:\n\n`;

  return `${header}${itemLines}\n\nSubtotal: ${formatINR(subtotal)}\n\nPlease confirm and share the delivery timeline. Thank you!`;
}

export function buildWhatsAppCartLink(
  lines: CartLine[],
  subtotal: number,
  orderNumber?: string,
  branchId: string = branches[0].id
): string {
  const branch = branches.find((b) => b.id === branchId) ?? branches[0];
  const message = buildWhatsAppCartMessage(lines, subtotal, orderNumber);
  return buildWhatsAppOrderLink(branch.whatsapp, message);
}
