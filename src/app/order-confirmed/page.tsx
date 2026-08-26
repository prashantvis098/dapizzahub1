import { OrderConfirmedClient } from "@/components/checkout/OrderConfirmedClient";
import { getBranches } from "@/lib/data";

export const metadata = {
  title: "Order Confirmed | Da Pizza Hub",
};

export default async function OrderConfirmedPage() {
  const branches = await getBranches();
  return <OrderConfirmedClient branches={branches} />;
}
