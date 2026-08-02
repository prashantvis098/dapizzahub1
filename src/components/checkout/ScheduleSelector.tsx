"use client";

import { Clock, Zap } from "lucide-react";

export interface TimeSlot {
  label: string;
  value: string; // e.g. "2026-08-02T18:30"
}

/**
 * Generates delivery time slots for today (in 30-min increments, starting
 * ~45 min from now to allow prep time) and tomorrow (11 AM – 10 PM).
 * Pure client-side — no backend needed since branches don't yet have a
 * live capacity/booking system. Once one exists, swap this generator for
 * a real availability call and the UI stays the same.
 */
export function generateTimeSlots(): { today: TimeSlot[]; tomorrow: TimeSlot[] } {
  const now = new Date();
  const today: TimeSlot[] = [];
  const tomorrow: TimeSlot[] = [];

  // Round up to the next 30-min mark, then add 45 min buffer for prep.
  const start = new Date(now);
  start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30 + 45, 0, 0);

  const closeTime = new Date(now);
  closeTime.setHours(23, 0, 0, 0);

  const cursor = new Date(start);
  while (cursor <= closeTime) {
    today.push({
      label: cursor.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      value: cursor.toISOString(),
    });
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(11, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(22, 0, 0, 0);

  const cursor2 = new Date(tomorrowStart);
  while (cursor2 <= tomorrowEnd) {
    tomorrow.push({
      label: cursor2.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      value: cursor2.toISOString(),
    });
    cursor2.setMinutes(cursor2.getMinutes() + 30);
  }

  return { today, tomorrow };
}

export function ScheduleSelector({
  mode,
  onModeChange,
  selectedSlot,
  onSlotChange,
}: {
  mode: "now" | "scheduled";
  onModeChange: (mode: "now" | "scheduled") => void;
  selectedSlot: string | null;
  onSlotChange: (value: string) => void;
}) {
  const { today, tomorrow } = generateTimeSlots();

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-secondary mb-3">When do you want it?</h3>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          onClick={() => onModeChange("now")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            mode === "now"
              ? "border-accent bg-accent/10 text-ink-primary"
              : "border-white/10 text-ink-secondary hover:border-white/25"
          }`}
        >
          <Zap size={15} className="text-gold" /> As Soon As Possible
        </button>
        <button
          onClick={() => onModeChange("scheduled")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            mode === "scheduled"
              ? "border-accent bg-accent/10 text-ink-primary"
              : "border-white/10 text-ink-secondary hover:border-white/25"
          }`}
        >
          <Clock size={15} className="text-gold" /> Schedule for Later
        </button>
      </div>

      {mode === "scheduled" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-muted mb-2">Today</p>
            <div className="flex flex-wrap gap-2">
              {today.length === 0 && (
                <p className="text-xs text-ink-muted">No more slots available today.</p>
              )}
              {today.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => onSlotChange(slot.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedSlot === slot.value
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-white/10 text-ink-secondary hover:border-white/25"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted mb-2">Tomorrow</p>
            <div className="flex flex-wrap gap-2">
              {tomorrow.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => onSlotChange(slot.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedSlot === slot.value
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-white/10 text-ink-secondary hover:border-white/25"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}