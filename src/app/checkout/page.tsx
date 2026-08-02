import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Da Pizza Hub",
  description:
    "Securely complete your order at Da Pizza Hub. Fast checkout for 100% Pure Veg pizzas, burgers, pasta, wraps, garlic bread, shakes and more.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}