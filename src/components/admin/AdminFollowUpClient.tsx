"use client";

import { useEffect, useState } from "react";
import { Users, MessageCircle, Clock, ShoppingBag } from "lucide-react";
import {
  buildWhatsAppOrderLink,
  buildFollowUpMessage,
  buildNewCustomerFollowUpMessage,
  toWhatsAppPhone,
} from "@/lib/whatsapp";

interface CustomerEntry {
  phone: string;
  name: string;
  lastOrderAt: string;
  orderCount: number;
  daysSinceLastOrder: number;
  favoriteItem: string | null;
}

interface FollowUpResponse {
  lapsed: CustomerEntry[];
  newSingleOrder: CustomerEntry[];
}

type Tab = "lapsed" | "new";

export function AdminFollowUpClient() {
  const [data, setData] = useState<FollowUpResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("lapsed");

  useEffect(() => {
    async function fetchFollowUps() {
      try {
        const res = await fetch("/api/admin/customers/followup", { cache: "no-store" });
        const json = await res.json();
        if (!json.success) {
          setError(json.message ?? "Failed to load follow-up list.");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to load follow-up list.");
      } finally {
        setLoading(false);
      }
    }
    fetchFollowUps();
  }, []);

  const list = tab === "lapsed" ? data?.lapsed ?? [] : data?.newSingleOrder ?? [];

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          <h1 className="text-lg font-semibold text-white sm:text-xl">Follow Up</h1>
        </div>
        <p className="text-xs text-ink-secondary">
          Customers worth reaching out to, so they don&apos;t drift away
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-5 flex gap-2">
          <TabButton active={tab === "lapsed"} onClick={() => setTab("lapsed")}>
            Lapsed Customers {data ? `(${data.lapsed.length})` : ""}
          </TabButton>
          <TabButton active={tab === "new"} onClick={() => setTab("new")}>
            New Customers {data ? `(${data.newSingleOrder.length})` : ""}
          </TabButton>
        </div>

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">Loading customer data...</div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">
            {tab === "lapsed"
              ? "No lapsed customers right now — everyone's ordering regularly."
              : "No first-time customers due for a follow-up right now."}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((customer) => (
              <CustomerRow key={customer.phone} customer={customer} isNew={tab === "new"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent text-white"
          : "border border-white/10 text-ink-secondary hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function CustomerRow({ customer, isNew }: { customer: CustomerEntry; isNew: boolean }) {
  const message = isNew
    ? buildNewCustomerFollowUpMessage({ customerName: customer.name })
    : buildFollowUpMessage({
        customerName: customer.name,
        daysSinceLastOrder: customer.daysSinceLastOrder,
        favoriteItem: customer.favoriteItem ?? undefined,
      });

  const whatsappLink = buildWhatsAppOrderLink(toWhatsAppPhone(customer.phone), message);

  return (
    <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{customer.name}</p>
          <p className="mt-0.5 text-sm text-ink-secondary">{customer.phone}</p>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 px-4 py-2 text-xs font-semibold text-[#25D366] transition hover:bg-[#25D366]/25"
        >
          <MessageCircle size={13} /> Send Follow-Up
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {customer.daysSinceLastOrder} day{customer.daysSinceLastOrder === 1 ? "" : "s"} since last order
        </span>
        <span className="flex items-center gap-1.5">
          <ShoppingBag size={12} />
          {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} total
        </span>
        {customer.favoriteItem && <span>Favorite: {customer.favoriteItem}</span>}
      </div>
    </div>
  );
}
