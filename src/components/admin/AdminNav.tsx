"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  UtensilsCrossed,
  Tag,
  Building2,
  TrendingUp,
  LogOut,
  Menu as MenuIcon,
  X,
  Sunrise,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/followup", label: "Follow Up", icon: Users },
  { href: "/admin/morning-report", label: "Morning Report", icon: Sunrise },
  { href: "/admin/sales", label: "Sales", icon: TrendingUp },
];

function isItemActive(pathname: string | null, item: (typeof NAV_ITEMS)[number]) {
  if (!pathname) return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <>
      {/* Mobile admin header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <Image src="/brand/logo.png" alt="Da Pizza Hub" width={36} height={36} className="rounded-full" />
          <div>
            <p className="text-sm font-bold leading-none text-white">DA PIZZA HUB</p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.2em] text-gold">STAFF PANEL</p>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X size={19} /> : <MenuIcon size={19} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-[#111111] p-3 shadow-2xl lg:hidden">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-white/10 pt-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <LogOut size={18} />
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      )}

      {/* Desktop admin sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#101010] lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="Da Pizza Hub" width={48} height={48} className="rounded-full" priority />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">DA PIZZA HUB</p>
              <p className="mt-1 text-[9px] font-semibold tracking-[0.25em] text-gold">STAFF DASHBOARD</p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Main Menu</p>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-accent/20 to-orange-500/10 text-white shadow-[inset_3px_0_0_#E53935]"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-accent" : "text-white/40 group-hover:text-white/70"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
            <p className="text-xs font-semibold text-white">Restaurant Staff</p>
            <p className="mt-1 text-[11px] text-white/35">Manage orders & operations</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
