export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DPH${y}${m}${d}-${rand}`;
}

export function estimatedDeliveryWindow(): string {
  const now = new Date();
  const min = new Date(now.getTime() + 30 * 60000);
  const max = new Date(now.getTime() + 45 * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${fmt(min)} - ${fmt(max)}`;
}
