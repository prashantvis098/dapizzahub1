"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { brand } from "@/data/branches";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const total = useCartStore((s) => s.total());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const couponError = useCartStore((s) => s.couponError);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [couponInput, setCouponInput] = useState("");

  const belowMinimum = subtotal > 0 && subtotal < brand.minOrder;

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
  }

  return (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80]"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Drawer */}
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-[#0E0E0E] border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,.6)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-6 border-b border-white/10">

            <div>

              <p className="uppercase tracking-[0.35em] text-[10px] text-gold mb-2">
                DA PIZZA HUB
              </p>

              <h2 className="font-heading text-4xl text-white">
                Your Cart
              </h2>

            </div>

            <button
              onClick={closeCart}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 hover:bg-[#D91F26] transition-all"
            >
              <X size={20} className="text-white" />
            </button>

          </div>

          {lines.length === 0 ? (

            <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">

              <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#D91F26]/20 to-[#FF6B00]/20 border border-white/10">

                <ShoppingBag
                  size={42}
                  className="text-gold"
                />

              </div>

              <h3 className="font-heading text-3xl text-white mb-4">
                Your cart is empty
              </h3>

              <p className="text-white/60 leading-7 max-w-sm mb-8">
                Fresh pizzas, burgers, pasta and more are waiting for you.
                Start exploring our delicious menu.
              </p>

              <Link
                href="/menu"
                onClick={closeCart}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-8 font-semibold text-white transition-all hover:scale-105"
              >
                Explore Menu
              </Link>

            </div>

          ) : (

            <>
            <div className="border-t border-white/10 bg-[#101010] p-6 space-y-5">

  {belowMinimum && (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
      <p className="text-sm leading-6 text-yellow-300">
        Add <span className="font-bold">
          {formatINR(brand.minOrder - subtotal)}
        </span>{" "}
        more to reach the minimum order of{" "}
        <span className="font-bold">
          {formatINR(brand.minOrder)}
        </span>.
      </p>
    </div>
  )}

  {/* Coupon */}

  {appliedCoupon ? (

    <div className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-green-500/10 p-4">

      <div className="flex items-center gap-3">

        <CheckCircle2
          size={18}
          className="text-green-400"
        />

        <div>

          <p className="text-sm font-semibold text-white">

            {appliedCoupon.code}

          </p>

          <p className="text-xs text-green-300">

            Coupon Applied Successfully

          </p>

        </div>

      </div>

      <button
        onClick={removeCoupon}
        className="text-sm text-red-400 hover:text-red-300"
      >
        Remove
      </button>

    </div>

  ) : (

    <div className="rounded-2xl border border-white/10 bg-[#171717] p-2">

      <div className="flex items-center gap-2">

        <Tag
          size={18}
          className="ml-3 text-[#FFC107]"
        />

        <input
          value={couponInput}
          onChange={(e) =>
            setCouponInput(
              e.target.value.toUpperCase()
            )
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            handleApplyCoupon()
          }
          placeholder="Enter Coupon Code"
          className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
        />

        <button
          onClick={handleApplyCoupon}
          className="rounded-xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
        >
          Apply
        </button>

      </div>

      {couponError && (

        <p className="mt-2 ml-3 text-xs text-red-400">

          {couponError}

        </p>

      )}

    </div>

  )}

  {/* Summary */}

  <div className="rounded-3xl bg-[#171717] p-5">

    <div className="flex justify-between py-2">

      <span className="text-white/60">

        Subtotal

      </span>

      <span className="font-semibold text-white">

        {formatINR(subtotal)}

      </span>

    </div>

    {discount > 0 && (

      <div className="flex justify-between py-2">

        <span className="text-green-400">

          Discount

        </span>

        <span className="font-semibold text-green-400">

          -{formatINR(discount)}

        </span>

      </div>

    )}

    <div className="my-4 h-px bg-white/10" />

    <div className="flex justify-between">

      <span className="text-xl font-bold text-white">

        Grand Total

      </span>

      <span className="text-2xl font-bold text-[#FFC107]">

        {formatINR(total)}

      </span>

    </div>

  </div>

  <Link
    href="/checkout"
    onClick={closeCart}
    className={`flex h-16 w-full items-center justify-center rounded-2xl text-lg font-bold transition-all duration-300 ${
      belowMinimum
        ? "pointer-events-none bg-white/10 text-white/40"
        : "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(217,31,38,.35)]"
    }`}
  >
    Proceed to Checkout
  </Link>

</div>

            </>
          )}
        </motion.aside>
      </motion.div>
    )}
  </AnimatePresence>
);
}