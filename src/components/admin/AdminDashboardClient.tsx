"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  XCircle,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Period { revenue: number; orders: number; }
interface StatsResponse {
  today: Period;
  week: Period;
  month: Period;
  status: { new: number; preparing: number; outForDelivery: number; completed: number; cancelled: number };
  topItems: { name: string; quantity: number }[];
}
interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusClass(status: string) {
  if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status === "preparing") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (status === "out_for_delivery") return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  if (status === "cancelled") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-accent/10 text-accent border-accent/20";
}

function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(initial = false) {
    if (!initial) setRefreshing(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
      ]);
      const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()]);
      if (!statsRes.ok || !statsData.success) throw new Error(statsData.message || "Failed to load dashboard.");
      if (!ordersRes.ok || !ordersData.success) throw new Error(ordersData.message || "Failed to load orders.");
      setStats(statsData);
      setOrders(ordersData.orders.slice(0, 6));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard(true);
    const timer = window.setInterval(() => loadDashboard(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const pending = useMemo(() => (stats?.status.new ?? 0), [stats]);
  const active = useMemo(() => (stats?.status.preparing ?? 0) + (stats?.status.outForDelivery ?? 0), [stats]);

  return (
    <div className="min-h-screen bg-bg pb-12">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/90 backdrop-blur-xl">
        <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 sm:px-7 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Staff Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Good morning, Da Pizza Hub</h1>
            <p className="mt-1 text-sm text-ink-secondary">Here&apos;s what&apos;s happening with the restaurant.</p>
          </div>
          <button
            onClick={() => loadDashboard()}
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="space-y-6 px-5 py-6 sm:px-7 lg:px-8">
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-card" />)}
          </div>
        ) : stats ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Today&apos;s Orders" value={String(stats.today.orders)} icon={ShoppingBag} note={`${stats.week.orders} orders in 7 days`} />
              <MetricCard label="Today&apos;s Revenue" value={formatINR(stats.today.revenue)} icon={TrendingUp} note={`${formatINR(stats.week.revenue)} in 7 days`} accent="gold" />
              <MetricCard label="Pending Orders" value={String(pending)} icon={Clock3} note="Waiting for staff action" accent="amber" />
              <MetricCard label="Active Orders" value={String(active)} icon={PackageCheck} note={`${stats.status.completed} completed`} accent="green" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
              <div className="rounded-2xl border border-white/10 bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Order Overview</h2>
                    <p className="mt-1 text-xs text-ink-secondary">Live status breakdown</p>
                  </div>
                  <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-bright">View orders <ArrowRight size={14} /></Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatusTile icon={Clock3} label="New" value={stats.status.new} />
                  <StatusTile icon={PackageCheck} label="Preparing" value={stats.status.preparing} />
                  <StatusTile icon={Truck} label="Delivery" value={stats.status.outForDelivery} />
                  <StatusTile icon={CheckCircle2} label="Completed" value={stats.status.completed} />
                  <StatusTile icon={XCircle} label="Cancelled" value={stats.status.cancelled} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <PeriodMini label="Today" period={stats.today} />
                  <PeriodMini label="Last 7 Days" period={stats.week} />
                  <PeriodMini label="Last 30 Days" period={stats.month} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-white">Top Selling Items</h2>
                  <p className="mt-1 text-xs text-ink-secondary">Last 30 days</p>
                </div>
                {stats.topItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-secondary">No sales data yet.</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topItems.slice(0, 5).map((item, index) => {
                      const max = stats.topItems[0].quantity || 1;
                      return (
                        <div key={`${item.name}-${index}`}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="truncate pr-3 text-white/80"><span className="mr-2 text-white/30">#{index + 1}</span>{item.name}</span>
                            <span className="shrink-0 text-xs text-white/40">{item.quantity} sold</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-accent to-orange-500" style={{ width: `${Math.max(8, (item.quantity / max) * 100)}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-card">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                  <p className="mt-1 text-xs text-ink-secondary">Latest orders from the website</p>
                </div>
                <Link href="/admin/orders" className="text-xs font-semibold text-accent hover:text-accent-bright">View all</Link>
              </div>
              {orders.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-ink-secondary">No orders yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <div key={order.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white">{order.orderNumber}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(order.status)}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-white/70">{order.customerName}</p>
                        <p className="mt-0.5 truncate text-xs text-white/35">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                        <div className="text-left sm:text-right"><p className="font-bold text-white">{formatINR(order.total)}</p><p className="mt-1 text-[11px] uppercase text-white/35">{order.paymentMethod} · {relativeTime(order.createdAt)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, note, accent = "red" }: { label: string; value: string; icon: LucideIcon; note: string; accent?: string }) {
  const iconClass = accent === "gold" ? "text-gold bg-gold/10" : accent === "amber" ? "text-amber-400 bg-amber-400/10" : accent === "green" ? "text-emerald-400 bg-emerald-400/10" : "text-accent bg-accent/10";
  return <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-card"><div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}><Icon size={19} /></div><p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p><p className="mt-1 text-xs text-white/35">{note}</p></div>;
}

function StatusTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3"><Icon size={16} className="text-white/40" /><p className="mt-3 text-xl font-bold text-white">{value}</p><p className="mt-0.5 text-[11px] text-white/35">{label}</p></div>;
}

function PeriodMini({ label, period }: { label: string; period: Period }) {
  return <div className="rounded-xl border border-white/5 bg-black/10 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-white/35">{label}</p><p className="mt-1 font-bold text-white">{formatINR(period.revenue)}</p><p className="mt-0.5 text-xs text-white/35">{period.orders} orders</p></div>;
}
