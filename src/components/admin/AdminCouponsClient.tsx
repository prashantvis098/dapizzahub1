"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, X, Tag } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface AdminCoupon {
  code: string;
  type: "flat" | "percent";
  value: string;
  min_order: string;
  max_discount: string | null;
  description: string;
  is_active: boolean;
  usage_limit: number | null;
  times_used: number;
  expires_at: string | null;
}

const emptyForm = {
  code: "",
  type: "flat" as "flat" | "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  description: "",
  usageLimit: "",
};

export function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setCoupons(data.coupons);
      setError(null);
    } catch {
      setError("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.value) {
      setFormError("Code and value are required.");
      return;
    }
    if (form.type === "percent" && (Number(form.value) <= 0 || Number(form.value) > 100)) {
      setFormError("Percent discount must be between 1 and 100.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: Number(form.minOrder) || 0,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
          description: form.description,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "Failed to create coupon.");
        return;
      }
      setModalOpen(false);
      fetchCoupons();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: AdminCoupon) {
    setCoupons((prev) =>
      prev.map((c) => (c.code === coupon.code ? { ...c, is_active: !c.is_active } : c))
    );
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.code, isActive: !coupon.is_active }),
    });
  }

  async function handleDelete(coupon: AdminCoupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    setCoupons((prev) => prev.filter((c) => c.code !== coupon.code));
    await fetch(`/api/admin/coupons?code=${encodeURIComponent(coupon.code)}`, { method: "DELETE" });
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Coupons</h1>
            <p className="text-xs text-ink-secondary">{coupons.length} coupons</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-ink-secondary">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="py-24 text-center text-ink-secondary">No coupons yet.</div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className={`rounded-2xl border p-5 transition ${
                  coupon.is_active ? "border-white/10 bg-card" : "border-white/5 bg-card/50 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Tag size={17} />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-white">{coupon.code}</p>
                      <p className="text-xs text-ink-secondary">{coupon.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={coupon.is_active}
                        onChange={() => toggleActive(coupon)}
                        className="h-4 w-4 accent-accent"
                      />
                      Active
                    </label>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-red-400/70 transition hover:bg-red-500/10"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/50">
                  <span>
                    {coupon.type === "flat"
                      ? `${formatINR(Number(coupon.value))} off`
                      : `${coupon.value}% off${coupon.max_discount ? ` (up to ${formatINR(Number(coupon.max_discount))})` : ""}`}
                  </span>
                  <span>Min order: {formatINR(Number(coupon.min_order))}</span>
                  <span>
                    Used {coupon.times_used}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""} times
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-card p-6 sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">New Coupon</h2>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="COUPON CODE"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-white outline-none focus:border-accent"
              />

              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (shown to customers)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "flat" | "percent" }))}
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                >
                  <option value="flat">Flat ₹ off</option>
                  <option value="percent">% off</option>
                </select>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "flat" ? "Amount ₹" : "Percent %"}
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                  placeholder="Min order ₹"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                />
                {form.type === "percent" && (
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    placeholder="Max discount ₹ (optional)"
                    className="h-12 rounded-xl border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-accent"
                  />
                )}
              </div>

              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Usage limit (optional, blank = unlimited)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-bright disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
