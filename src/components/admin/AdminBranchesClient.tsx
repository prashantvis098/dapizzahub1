"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, X, MapPin, Phone } from "lucide-react";

interface AdminBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  maps_url: string;
  swiggy_url: string | null;
  zomato_url: string | null;
  lat: number;
  lng: number;
  is_active: boolean;
  opening_time: string;
  closing_time: string;
}

const emptyForm = {
  id: "",
  name: "",
  address: "",
  phone: "",
  whatsapp: "",
  mapsUrl: "",
  swiggyUrl: "",
  zomatoUrl: "",
  lat: "",
  lng: "",
};

export function AdminBranchesClient() {
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/branches", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      setBranches(data.branches);
      setError(null);
    } catch {
      setError("Failed to load branches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  function openCreate() {
    setForm(emptyForm);
    setIsEditing(false);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(branch: AdminBranch) {
    setForm({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapsUrl: branch.maps_url,
      swiggyUrl: branch.swiggy_url ?? "",
      zomatoUrl: branch.zomato_url ?? "",
      lat: String(branch.lat),
      lng: String(branch.lng),
    });
    setIsEditing(true);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim() || !form.lat || !form.lng) {
      setFormError("Name, address, phone, and coordinates are required.");
      return;
    }
    if (!isEditing && !form.id.trim()) {
      setFormError("Branch ID is required (e.g. 'Kalyanpur') — used internally, not shown to customers.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      mapsUrl: form.mapsUrl,
      swiggyUrl: form.swiggyUrl || undefined,
      zomatoUrl: form.zomatoUrl || undefined,
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    try {
      const res = await fetch("/api/admin/branches", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id, ...payload }),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "Failed to save branch.");
        return;
      }
      setModalOpen(false);
      fetchBranches();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-bg/95 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Branches</h1>
            <p className="text-xs text-ink-secondary">{branches.length} branches</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-bright"
          >
            <Plus size={16} /> Add Branch
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
          <div className="py-24 text-center text-ink-secondary">Loading branches...</div>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-2xl border border-white/10 bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{branch.name}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-secondary">
                      <MapPin size={13} className="mt-0.5 shrink-0" /> {branch.address}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-secondary">
                      <Phone size={13} /> {branch.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(branch)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-card p-6 sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? "Edit Branch" : "Add Branch"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {!isEditing && (
                <input
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                  placeholder="Branch ID (e.g. Kalyanpur — no spaces)"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              )}

              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Branch name (e.g. Da Pizza Hub – Kalyanpur)"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone (10 digits)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="WhatsApp (91XXXXXXXXXX)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  placeholder="Latitude"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  placeholder="Longitude"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              </div>
              <p className="-mt-2 text-xs text-ink-muted">
                Tip: open the location in Google Maps, right-click the pin, and copy the coordinates.
              </p>

              <input
                value={form.mapsUrl}
                onChange={(e) => setForm((f) => ({ ...f, mapsUrl: e.target.value }))}
                placeholder="Google Maps link"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.swiggyUrl}
                  onChange={(e) => setForm((f) => ({ ...f, swiggyUrl: e.target.value }))}
                  placeholder="Swiggy link (optional)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
                <input
                  value={form.zomatoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, zomatoUrl: e.target.value }))}
                  placeholder="Zomato link (optional)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-accent"
                />
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-bright disabled:opacity-50"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
