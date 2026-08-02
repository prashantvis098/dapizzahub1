import { pizzas } from "@/data/pizzas";
import { burgers, fries, pastas, wraps, breads, shakes, mocktails, desserts, otherSides } from "@/data/food";
import { branches, brand } from "@/data/branches";
import { formatINR } from "./utils";

/**
 * Da Pizza Hub AI Assistant — grounded response engine.
 *
 * This is a lightweight, rule-based assistant that answers customer
 * questions using the ACTUAL menu/branch/pricing data in this codebase —
 * not a hallucinated LLM response. It works immediately, with no API
 * key, no external cost, and no risk of quoting wrong prices.
 *
 * To upgrade this to a full LLM-powered assistant (for open-ended
 * conversation), route unmatched queries to the Anthropic API from a
 * server route, passing this same menu data as context so the model
 * stays grounded in real prices — see the comment at the bottom of
 * this file for exactly how to do that.
 */

const allSimpleItems = [...burgers, ...fries, ...pastas, ...wraps, ...breads, ...shakes, ...mocktails, ...desserts, ...otherSides];

export interface AssistantReply {
  text: string;
  suggestions?: string[];
}

function findMenuMatch(query: string): string | null {
  const q = query.toLowerCase();

  const pizzaMatch = pizzas.find((p) => q.includes(p.name.toLowerCase()));
  if (pizzaMatch) {
    return `${pizzaMatch.name} — ${pizzaMatch.description}. Pricing: Regular ${formatINR(
      pizzaMatch.prices.regular
    )}, Medium ${formatINR(pizzaMatch.prices.medium)}, Large ${formatINR(pizzaMatch.prices.large)}. Want me to add it to your cart?`;
  }

  const itemMatch = allSimpleItems.find((item) => q.includes(item.name.toLowerCase()));
  if (itemMatch) {
    return `${itemMatch.name} is ${formatINR(itemMatch.price)}. Would you like to add it to your cart?`;
  }

  return null;
}

export function getAssistantReply(userMessage: string): AssistantReply {
  const q = userMessage.toLowerCase().trim();

  // Direct menu item match first
  const menuMatch = findMenuMatch(q);
  if (menuMatch) {
    return { text: menuMatch };
  }

  // Branches / location
  if (/branch|location|address|nearest|kaha|kahan/.test(q)) {
    const list = branches.map((b) => `• ${b.name} — ${b.address}`).join("\n");
    return {
      text: `We have ${branches.length} branches:\n\n${list}\n\nWant directions to your nearest one?`,
      suggestions: ["Show branches on map", "Call nearest branch"],
    };
  }

  // Delivery
  if (/deliver|delivery|free deliv/.test(q)) {
    return {
      text: `We offer free delivery within ${brand.freeDeliveryRadiusKm} KM of any branch, on orders above ${formatINR(
        brand.minOrder
      )}. Orders typically arrive in 30–45 minutes.`,
    };
  }

  // Payment
  if (/payment|upi|cod|cash|pay/.test(q)) {
    return {
      text: "We accept UPI and Cash on Delivery (COD) at all branches. You can choose your preferred method at checkout.",
    };
  }

  // Veg / pure veg
  if (/veg\b|vegetarian|non.?veg|meat/.test(q)) {
    return {
      text: "Da Pizza Hub is 100% pure vegetarian — every item, every branch, no exceptions.",
    };
  }

  // Customization
  if (/customi[sz]e|topping|extra cheese|cheese burst|pan base/.test(q)) {
    return {
      text: "You can fully customize any pizza — choose your size, add extra cheese, cheese burst, pan base, or extra vegetable toppings. Tap 'Customize' on any pizza to try it.",
      suggestions: ["Show pizza menu"],
    };
  }

  // Minimum order
  if (/minimum|min order/.test(q)) {
    return { text: `Our minimum order value is ${formatINR(brand.minOrder)}.` };
  }

  // Combos
  if (/combo|deal|offer/.test(q)) {
    return {
      text: "We have combo deals for every group size — Student, Couple, Family and Party combos. Check the Combo Deals section on our homepage or menu page for current pricing.",
      suggestions: ["Show combos"],
    };
  }

  // Greetings
  if (/^(hi|hello|hey|namaste)\b/.test(q)) {
    return {
      text: `Hi! I'm the Da Pizza Hub assistant. Ask me about our menu, prices, branches, delivery, or anything else — I'm happy to help you order.`,
      suggestions: ["Show best sellers", "Where are your branches?", "Do you deliver to me?"],
    };
  }

  // Thanks
  if (/thank/.test(q)) {
    return { text: "You're welcome! Enjoy your meal. 🍕" };
  }

  // Fallback
  return {
    text: "I couldn't find that in our menu, but I can help with pizza prices, customization, branches, delivery, or payment questions. You can also call us or message on WhatsApp for anything specific.",
    suggestions: ["Show best sellers", "Where are your branches?", "What payment methods do you accept?"],
  };
}

/**
 * ---- Upgrading to a full LLM (optional) ----
 *
 * To let the assistant handle open-ended conversation beyond these rules,
 * create a server route (e.g. src/app/api/assistant/route.ts) that calls
 * the Anthropic API, passing the menu/branch data as context so answers
 * stay grounded in real prices instead of guessing:
 *
 *   const response = await fetch("https://api.anthropic.com/v1/messages", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       model: "claude-sonnet-4-6",
 *       max_tokens: 300,
 *       system: `You are Da Pizza Hub's ordering assistant. Only answer
 *         using this menu data: ${JSON.stringify({ pizzas, allSimpleItems, branches })}.
 *         Never invent prices or items not listed here.`,
 *       messages: [{ role: "user", content: userMessage }],
 *     }),
 *   });
 *
 * This keeps the assistant fast and free for common questions (via the
 * rules above) while falling back to the LLM only when nothing matches.
 */
