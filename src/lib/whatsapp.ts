import { CartLine } from "@/types";
import { formatINR } from "./utils";

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

/**
 * Customer phone numbers are stored as plain 10-digit Indian numbers (see
 * the `maxLength={10}` phone field in CheckoutClient.tsx) — no country
 * code. wa.me links require the country code with no "+", spaces or
 * leading zero (e.g. "919876543210"), so this normalizes before building
 * a customer-facing WhatsApp link. If the number already has a country
 * code (11-13 digits) or looks malformed, it's passed through as-is
 * rather than guessed at.
 */
export function toWhatsAppPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
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

/**
 * Staff → customer order confirmation message. Used from the admin
 * orders dashboard: staff taps "WhatsApp Customer" on a new order, this
 * message is prefilled, staff reviews and hits send in WhatsApp. Not
 * automatic — see the note at the top of this file on why (no paid
 * WhatsApp Business API configured).
 */
export function buildCustomerConfirmationMessage(params: {
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; customizationSummary?: string }[];
  total: number;
  orderType: "delivery" | "pickup";
  branchName: string;
}): string {
  const { customerName, orderNumber, items, total, orderType, branchName } = params;
  const itemLines = items
    .map((l) => `• ${l.quantity}x ${l.name}${l.customizationSummary ? ` (${l.customizationSummary})` : ""}`)
    .join("\n");

  const fulfilment =
    orderType === "delivery"
      ? "Your order is on its way and should reach you in around 30–45 minutes."
      : `Your order will be ready for pickup at our ${branchName} branch shortly.`;

  return `Hi ${customerName}! 🍕 Your Da Pizza Hub order #${orderNumber} is confirmed:\n\n${itemLines}\n\nTotal: ${formatINR(total)}\n\n${fulfilment}\n\nThank you for ordering with Da Pizza Hub!`;
}

/**
 * Staff → lapsed-customer follow-up message. Used from the admin
 * "Follow Up" list (customers who haven't ordered in ~4-5+ days) — staff
 * reviews the customer, taps WhatsApp, sends this prefilled nudge.
 */
export function buildFollowUpMessage(params: {
  customerName: string;
  daysSinceLastOrder: number;
  favoriteItem?: string;
}): string {
  const { customerName, daysSinceLastOrder, favoriteItem } = params;
  const favLine = favoriteItem
    ? ` We noticed you love our ${favoriteItem} — it's waiting for you!`
    : "";

  return `Hi ${customerName}! 👋 It's been a while since your last order with Da Pizza Hub (${daysSinceLastOrder} days).${favLine} We'd love to serve you again — check out our latest menu and offers. Order anytime, we're here!`;
}

/**
 * Staff → new-customer welcome/follow-up message. Used for customers
 * who've placed exactly one order, to encourage a second visit.
 */
export function buildNewCustomerFollowUpMessage(params: {
  customerName: string;
}): string {
  return `Hi ${params.customerName}! 🍕 Thank you for your first order with Da Pizza Hub — we hope you loved it! We'd love to have you back. Check out our menu for more delicious options anytime.`;
}

/**
 * Staff → self (or owner) morning report message. Built from real numbers
 * returned by GET /api/admin/reports/morning — never invented. Used by
 * the admin Morning Report page's "Send to WhatsApp" button.
 */
export function buildMorningReportMessage(params: {
  reportDate: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledOrders: number;
  topItems: { name: string; quantity: number }[];
  branchBreakdown: { branchId: string; revenue: number; orders: number }[];
}): string {
  const {
    reportDate,
    revenue,
    orders,
    averageOrderValue,
    newCustomers,
    repeatCustomers,
    cancelledOrders,
    topItems,
    branchBreakdown,
  } = params;

  const dateLabel = new Date(reportDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const topItemsLines = topItems.length
    ? topItems.map((it, i) => `${i + 1}. ${it.name} — ${it.quantity} sold`).join("\n")
    : "No orders";

  const branchLines = branchBreakdown.length
    ? branchBreakdown.map((b) => `• ${b.branchId}: ${formatINR(b.revenue)} (${b.orders} orders)`).join("\n")
    : "No orders";

  return `📊 Da Pizza Hub — Morning Report\n${dateLabel}\n\n💰 Revenue: ${formatINR(revenue)}\n📦 Orders: ${orders} (avg ${formatINR(averageOrderValue)})\n❌ Cancelled: ${cancelledOrders}\n\n👥 Customers: ${newCustomers} new, ${repeatCustomers} repeat\n\n🏆 Top Items:\n${topItemsLines}\n\n🏪 By Branch:\n${branchLines}`;
}
