"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ClipboardCheck, ChefHat, Bike, PartyPopper } from "lucide-react";

export interface OrderStage {
  key: "placed" | "confirmed" | "preparing" | "out-for-delivery" | "delivered";
  label: string;
  subtext: string;
  icon: React.ReactNode;
  /** Minutes after order placement when this stage becomes active. */
  atMinute: number;
}

const STAGES: OrderStage[] = [
  {
    key: "placed",
    label: "Order Placed",
    subtext: "We've received your order",
    icon: <ClipboardCheck size={18} />,
    atMinute: 0,
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    subtext: "Branch has accepted your order",
    icon: <Check size={18} />,
    atMinute: 1,
  },
  {
    key: "preparing",
    label: "Preparing Your Pizza",
    subtext: "Fresh dough, hot oven, on it",
    icon: <ChefHat size={18} />,
    atMinute: 5,
  },
  {
    key: "out-for-delivery",
    label: "Out for Delivery",
    subtext: "Your rider is on the way",
    icon: <Bike size={18} />,
    atMinute: 20,
  },
  {
    key: "delivered",
    label: "Delivered",
    subtext: "Enjoy your meal!",
    icon: <PartyPopper size={18} />,
    atMinute: 35,
  },
];

function getActiveStageIndex(elapsedMinutes: number): number {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (elapsedMinutes >= STAGES[i].atMinute) idx = i;
  }
  return idx;
}

/**
 * Live-feeling order tracker. Since there's no backend/database yet, this
 * simulates progress purely from the elapsed time since `placedAt` — the
 * stage timings (1 / 5 / 20 / 35 min) mirror a realistic pizza delivery
 * flow. When a real order-management backend exists, swap the elapsed-time
 * calculation for actual status pushed from the server/Petpooja and this
 * UI keeps working unchanged.
 */
export function OrderTracker({ placedAt }: { placedAt: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsedMinutes = (now - placedAt) / 60000;
  const activeIndex = getActiveStageIndex(elapsedMinutes);
  const isDelivered = activeIndex === STAGES.length - 1;

  // Progress percentage along the track, smoothly interpolated between
  // the active stage and the next one so the bar doesn't jump in chunks.
  const currentStage = STAGES[activeIndex];
  const nextStage = STAGES[activeIndex + 1];
  let progressPct = (activeIndex / (STAGES.length - 1)) * 100;
  if (nextStage) {
    const span = nextStage.atMinute - currentStage.atMinute;
    const into = Math.min(1, Math.max(0, (elapsedMinutes - currentStage.atMinute) / span));
    progressPct =
      ((activeIndex + into) / (STAGES.length - 1)) * 100;
  }

  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg">Order Status</h2>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStage.key}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3 }}
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isDelivered
                ? "bg-gold/15 text-gold"
                : "bg-accent/15 text-accent-bright"
            }`}
          >
            {isDelivered ? "Delivered" : "Live"}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress track */}
      <div className="relative mb-8 px-1">
        <div className="absolute top-4 left-1 right-1 h-0.5 bg-white/10 rounded-full" />
        <motion.div
          className="absolute top-4 left-1 h-0.5 bg-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `calc(${progressPct}% - ${progressPct > 0 ? 8 : 0}px)` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="relative flex justify-between">
          {STAGES.map((stage, i) => {
            const done = i <= activeIndex;
            const isCurrent = i === activeIndex;
            return (
              <div key={stage.key} className="flex flex-col items-center" style={{ width: `${100 / STAGES.length}%` }}>
                <motion.div
                  animate={{
                    scale: isCurrent && !isDelivered ? [1, 1.12, 1] : 1,
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: isCurrent && !isDelivered ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                    done
                      ? "bg-gold border-gold text-bg"
                      : "bg-card border-white/15 text-ink-muted"
                  }`}
                >
                  {stage.icon}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active stage detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="font-semibold text-base mb-1">{currentStage.label}</p>
          <p className="text-sm text-ink-muted">{currentStage.subtext}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}