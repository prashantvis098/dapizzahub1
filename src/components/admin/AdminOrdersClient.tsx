"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  MapPin,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  Bike,
  MessageCircle,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/types";
import { branches as fallbackBranches } from "@/data/branches";
import { buildWhatsAppOrderLink, buildCustomerConfirmationMessage, toWhatsAppPhone } from "@/lib/whatsapp";

const POLL_INTERVAL_MS = 8000;

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "out_for_delivery", "completed"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-accent/20 text-accent border-accent/30",
  preparing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  out_for_delivery: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-white/10 text-white/40 border-white/10",
};

// Fallback map built from the static branch list, used until the live
// /api/admin/branches fetch resolves (or if it fails) — so a branch name
// always renders, but prefers the admin-edited name once it's available.
const fallbackBranchNames: Record<string, string> = Object.fromEntries(
  fallbackBranches.map((b) => [b.id, b.name])
);

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

// A short, generated two-tone chime — no external audio file dependency.
function playAlertSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    [880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.4);
    });
  } catch {
    // Audio isn't critical — fail silently (e.g. if autoplay is blocked
    // before the user has interacted with the page at all).
  }
}

export function AdminOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [branchNames, setBranchNames] = useState<Record<string, string>>(fallbackBranchNames);
  const knownIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);

  const branchName = useCallback(
    (branchId: string): string => branchNames[branchId] ?? branchId,
    [branchNames]
  );

  // Fetched once on mount so order cards show the current admin-edited
  // branch name (e.g. after a rename in /admin/branches) instead of a
  // frozen copy of the original static data. Falls back to the static
  // names above if this fails (e.g. DATABASE_URL not configured) or
  // while it's still loading, so a name always renders either way.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/branches", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.success || !Array.isArray(data.branches)) return;
        const live: Record<string, string> = {};
        for (const row of data.branches) {
          if (row?.id) live[row.id] = row.name ?? row.id;
        }
        if (Object.keys(live).length > 0) {
          setBranchNames((prev) => ({ ...prev, ...live }));
        }
      })
      .catch(() => {
        // Keep the static fallback — not critical enough to show an error.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load orders.");
        return;
      }

      const fetched: OrderRecord[] = data.orders;
      const newOnes = fetched.filter((o) => !knownIds.current.has(o.id));

      if (!isFirstLoad.current && newOnes.length > 0 && soundOn) {
        playAlertSound();
      }

      fetched.forEach((o) => knownIds.current.add(o.id));
      isFirstLoad.current = false;
      setOrders(fetched);
      setError(null);
    } catch {
      setError("Connection lost — retrying...");
    } finally {
      setLoading(false);
    }
  }, [router, soundOn]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: number, status: OrderStatus) {
    // Optimistic update so staff see the change instantly, not after the
    // next poll cycle.
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // On failure, the next poll (within POLL_INTERVAL_MS) will
      // reconcile the displayed status back to what's actually saved.
    }
  }

  const filteredOrders =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Orders
              {newCount > 0 && (
                <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white align-middle">
                  {newCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-ink-secondary">Auto-refreshes every 8 seconds</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundOn((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
              aria-label={soundOn ? "Mute alert sound" : "Unmute alert sound"}
              title={soundOn ? "Sound on" : "Sound off"}
            >
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              onClick={fetchOrders}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
              aria-label="Refresh now"
              title="Refresh now"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {(["all", "new", "preparing", "out_for_delivery", "completed", "cancelled"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  statusFilter === s
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/10 text-white/50 hover:bg-white/5"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]}
              </button>
            )
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">
            No {statusFilter === "all" ? "" : STATUS_LABELS[statusFilter].toLowerCase()} orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} branchName={branchName} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
  branchName,
}: {
  order: OrderRecord;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
  branchName: (branchId: string) => string;
}) {
  const nextStatusIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = nextStatusIndex >= 0 ? STATUS_FLOW[nextStatusIndex + 1] : undefined;

  const whatsappLink = buildWhatsAppOrderLink(
    toWhatsAppPhone(order.customerPhone),
    buildCustomerConfirmationMessage({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      orderType: order.orderType,
      branchName: branchName(order.branchId),
    })
  );

  return (
    <div
      className={`rounded-3xl border p-5 transition sm:p-6 ${
        order.status === "new"
          ? "border-accent/40 bg-accent/5"
          : "border-white/10 bg-card"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-white">{order.orderNumber}</span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {branchName(order.branchId)} · {timeAgo(order.createdAt)}
          </p>
        </div>
        <span className="text-lg font-bold text-white">{formatINR(order.total)}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-white">{order.customerName}</p>
          <a
            href={`tel:${order.customerPhone}`}
            className="mt-1 flex items-center gap-1.5 text-sm text-ink-secondary hover:text-accent"
          >
            <Phone size={13} /> {order.customerPhone}
          </a>
          {order.deliveryAddress && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-secondary">
              <MapPin size={13} className="mt-0.5 shrink-0" /> {order.deliveryAddress}
            </p>
          )}
          {order.scheduleMode === "later" && order.scheduledFor && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-amber-400">
              <Clock size={13} /> Scheduled: {order.scheduledFor}
            </p>
          )}
        </div>

        <div className="space-y-1 text-sm text-ink-secondary">
          {order.items.map((line, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span>
                {line.quantity}× {line.name}
                {line.customizationSummary ? ` (${line.customizationSummary})` : ""}
              </span>
              <span className="shrink-0 text-white/60">
                {formatINR(line.unitPrice * line.quantity)}
              </span>
            </div>
          ))}
          <div className="mt-2 border-t border-white/10 pt-2 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Bike size={11} /> Delivery
              </span>
              <span>{order.deliveryFee > 0 ? formatINR(order.deliveryFee) : "Free"}</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold text-white/80">
              <span>{order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 px-4 py-2 text-xs font-semibold text-[#25D366] transition hover:bg-[#25D366]/25"
        >
          <MessageCircle size={13} /> WhatsApp Customer
        </a>
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-bright"
          >
            Mark as {STATUS_LABELS[nextStatus]}
          </button>
        )}
        {order.status !== "cancelled" && order.status !== "completed" && (
          <button
            onClick={() => onUpdateStatus(order.id, "cancelled")}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/50 transition hover:bg-white/5 hover:text-white/80"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
