"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, MessageCircle, Clock, Store, Wallet } from "lucide-react";
import { formatINR, estimatedDeliveryWindow } from "@/lib/utils";
import { CartLine } from "@/types";
import { branches } from "@/data/branches";
import { buildWhatsAppCartLink } from "@/lib/whatsapp";
import { OrderTracker } from "@/components/checkout/OrderTracker";

interface OrderData {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  branchId: string;
  total: number;
  paymentMethod: "cod" | "upi";
  lines: CartLine[];
  placedAt?: number;
  scheduleMode?: "now" | "scheduled";
  scheduledFor?: string | null;
}

export function OrderConfirmedClient() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [deliveryWindow] = useState(estimatedDeliveryWindow());

  useEffect(() => {
    const raw = sessionStorage.getItem("dph_last_order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-bg pt-28 pb-24 flex flex-col items-center justify-center text-center px-6">
        <p className="text-ink-secondary mb-6">No recent order found.</p>
        <Link
          href="/menu"
          className="px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-bright transition-colors"
        >
          Order Something
        </Link>
      </div>
    );
  }

  const branch = branches.find((b) => b.id === order.branchId) ?? branches[0];
  const whatsappLink = buildWhatsAppCartLink(order.lines, order.total, order.orderId, order.branchId);

  return (
    <div className="min-h-screen bg-bg pt-28 pb-24">
      <div className="max-w-lg mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-14 h-14 rounded-full bg-gold flex items-center justify-center"
          >
            <Check size={28} className="text-bg" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="font-display text-3xl font-semibold mb-2">Order Confirmed!</h1>
          <p className="text-ink-secondary mb-8">
            {order.scheduleMode === "scheduled" && order.scheduledFor
              ? `Thank you, ${order.name.split(" ")[0]}. We'll start preparing it closer to your scheduled time.`
              : `Thank you, ${order.name.split(" ")[0]}. Your order is being prepared.`}
          </p>
        </motion.div>

        {order.scheduleMode === "scheduled" && order.scheduledFor ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gold/10 border border-gold/30 rounded-3xl p-6 mb-6 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-gold" />
            </div>
            <div className="text-left">
              <p className="text-xs text-ink-muted mb-0.5">Scheduled for</p>
              <p className="font-semibold text-base">
                {new Date(order.scheduledFor).toLocaleString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </motion.div>
        ) : (
          order.placedAt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <OrderTracker placedAt={order.placedAt} />
            </motion.div>
          )
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="bg-card rounded-3xl p-6 border border-white/5 text-left space-y-4 mb-6"
        >
          <Row label="Order Number" value={order.orderId} highlight />
          <Row
            label={order.scheduleMode === "scheduled" ? "Scheduled Delivery" : "Estimated Delivery"}
            value={
              order.scheduleMode === "scheduled" && order.scheduledFor
                ? new Date(order.scheduledFor).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : deliveryWindow
            }
            icon={<Clock size={15} className="text-gold" />}
          />
          <Row label="Branch" value={branch.name} icon={<Store size={15} className="text-gold" />} />
          <Row
            label="Payment"
            value={order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}
            icon={<Wallet size={15} className="text-gold" />}
          />
          <div className="border-t border-white/5 pt-4 flex justify-between items-center">
            <span className="text-sm text-ink-secondary">Total Paid</span>
            <span className="text-xl font-bold">{formatINR(order.total)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-btn flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BD5C] text-white font-semibold transition-all duration-300 active:scale-95"
          >
            <MessageCircle size={18} /> Confirm via WhatsApp
          </a>
          <Link
            href="/menu"
            className="magnetic-btn flex items-center justify-center py-3.5 rounded-full border border-white/15 text-ink-primary font-semibold hover:bg-white/5 transition-all duration-300"
          >
            Continue Ordering
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span
        className={`text-sm flex items-center gap-1.5 ${
          highlight ? "font-bold text-gold" : "font-medium text-ink-primary"
        }`}
      >
        {icon} {value}
      </span>
    </div>
  );
}