import type { CartLine, MenuItem, PizzaItem } from "@/types";
import { pizzaAddOns, vegVegetablePricing } from "@/data/pizzas";

/**
 * Server-side re-verification of cart line pricing.
 *
 * POST /api/orders already recomputes the order SUBTOTAL from the
 * submitted lines' quantity * unitPrice — but until this module was
 * added, `unitPrice` itself was taken verbatim from the client with no
 * check against the real menu. A tampered request could set any
 * `unitPrice` it wanted (e.g. ₹1 for a ₹500 pizza) and the "server-side
 * recomputation" would faithfully multiply that fabricated price by the
 * quantity and charge it. This closes that gap: every line's price is
 * independently rebuilt here from the authoritative menu catalog
 * (getMenuItems() — DB-backed when configured) and the static
 * add-on/topping price list, and only that recomputed price is ever
 * charged — the client's unitPrice is used only as a display hint until
 * it's been verified.
 */

export interface PriceCheckResult {
  /** Lines with unitPrice replaced by the server-verified price. */
  verifiedLines: CartLine[];
  /** True if any submitted line's price didn't match what the server
   * computed — useful for logging/monitoring tampering attempts, even
   * though the order still proceeds at the correct (server) price. */
  hadMismatch: boolean;
  /** Non-empty if a line couldn't be priced at all (unknown item, or
   * item currently unavailable) — the caller should reject the order. */
  errors: string[];
}

function computePizzaUnitPrice(
  pizza: PizzaItem,
  customization: CartLine["customization"]
): number {
  const size = customization?.size ?? "regular";
  let price = pizza.prices[size];

  if (customization?.extraCheese) price += pizzaAddOns.extraCheese[size];
  if (customization?.cheeseBurst) price += pizzaAddOns.cheeseBurst[size];
  if (customization?.panBase) price += pizzaAddOns.panBase[size];
  if (customization?.extraToppings?.length) {
    price += customization.extraToppings.length * vegVegetablePricing[size];
  }

  return price;
}

/**
 * Re-derives the correct price for every submitted cart line against the
 * real menu catalog. Call this in POST /api/orders before computing the
 * order subtotal — never trust `line.unitPrice` as submitted.
 */
export function verifyLinePrices(
  submittedLines: CartLine[],
  menuItems: MenuItem[]
): PriceCheckResult {
  const menuById = new Map(menuItems.map((item) => [item.id, item]));
  const errors: string[] = [];
  let hadMismatch = false;

  const verifiedLines: CartLine[] = submittedLines.map((line) => {
    const menuItem = menuById.get(line.itemId);

    if (!menuItem) {
      // Unknown or currently-unavailable item (getMenuItems() only
      // returns is_available = true rows) — can't verify a price for
      // this at all, so flag it and leave the line as-is; the caller
      // rejects the whole order when `errors` is non-empty.
      errors.push(`"${line.name}" is not currently available.`);
      return line;
    }

    const correctPrice =
      menuItem.type === "pizza"
        ? computePizzaUnitPrice(menuItem, line.customization)
        : menuItem.price;

    if (Math.abs(correctPrice - line.unitPrice) > 0.01) {
      hadMismatch = true;
    }

    return { ...line, unitPrice: correctPrice, basePrice: menuItem.type === "pizza" ? menuItem.prices[line.customization?.size ?? "regular"] : menuItem.price };
  });

  return { verifiedLines, hadMismatch, errors };
}
