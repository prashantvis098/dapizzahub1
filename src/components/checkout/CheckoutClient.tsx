"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Banknote, ChevronLeft, ShoppingBag, Tag, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { ScheduleSelector } from "@/components/checkout/ScheduleSelector";
import { branches, brand } from "@/data/branches";
import { Branch } from "@/types";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";
import CurrentLocation from "@/components/checkout/CurrentLocation";
import { findNearestBranch } from "@/lib/delivery";

const STEPS = ["Details", "Payment", "Review"] as const;

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const MIN_ADDRESS_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

type PaymentMethod = "cod" | "upi";
type ScheduleMode = "now" | "scheduled";

interface OrderPlacementError {
  message: string;
}

export function CheckoutClient() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const cartTotal = useCartStore((s) => s.total());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const couponError = useCartStore((s) => s.couponError);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<OrderPlacementError | null>(null);
  const [couponInput, setCouponInput] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [branchId, setBranchId] = useState(branches[0].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null);

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(branches[0]);
  const [deliverable, setDeliverable] = useState(true);

  // Guards against double-submission from rapid double-clicks / double-taps,
  // which can race ahead of the `isPlacing` state update on slow devices.
  const isSubmittingRef = useRef(false);

  // One idempotency key per checkout session, generated once and reused on
  // every retry of "Place Order" for this cart. If a request times out or
  // drops mid-flight and the customer taps again, the server recognizes the
  // same key and returns the original order instead of creating a
  // duplicate. crypto.randomUUID() is available in all modern browsers;
  // Date.now()+Math.random() is just a defensive fallback for older ones.
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const total = cartTotal + deliveryFee;
  // Minimum order threshold applies to the pre-discount subtotal — this is
  // a standard business rule (coupons shouldn't let someone dodge the
  // minimum-order gate entirely).
  const belowMinimum = subtotal < brand.minOrder;
  const amountToUnlock = brand.minOrder - subtotal;

  const isPhoneValid = INDIAN_MOBILE_REGEX.test(phone);
  const isNameValid = name.trim().length >= MIN_NAME_LENGTH;
  const isAddressValid = address.trim().length >= MIN_ADDRESS_LENGTH;
  const isScheduleValid = scheduleMode === "now" || !!scheduledSlot;

  const detailsValid = isNameValid && isPhoneValid && isAddressValid && isScheduleValid && deliverable;

  const applyBranchResult = useCallback(
    (result: ReturnType<typeof findNearestBranch>) => {
      setBranchId(result.branch.id);
      setSelectedBranch(result.branch);
      setDistance(result.distance);
      setDeliveryFee(result.fee);
      setDeliverable(result.deliverable);
    },
    []
  );

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
  }

  async function handlePlaceOrder() {
    // Defense-in-depth: cart drawer already nudges below-minimum users, but
    // someone could still land on /checkout directly (deep link, back
    // button, stale tab) with a sub-minimum or non-deliverable cart.
    if (belowMinimum || !deliverable) return;

    // Belt-and-braces double-submit guard: the button is disabled while
    // isPlacing is true, but a ref check here closes the tiny window where
    // two rapid clicks/taps could both fire before the state update commits.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setIsPlacing(true);
    setPlaceOrderError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Authoritative inputs — the server must independently look up
          // the nearest branch, distance, fee, and deliverability from
          // these coordinates. Never trust distance/fee/deliverable
          // computed on the client for pricing or acceptance decisions.
          customerLat: coords?.lat ?? null,
          customerLng: coords?.lng ?? null,
          branchId,
          orderType: "delivery",
          customerName: name,
          customerPhone: phone,
          deliveryAddress: address,
          items: lines,
          subtotal,
          discount,
          couponCode: appliedCoupon?.code ?? null,
          paymentMethod,
          scheduleMode,
          scheduledFor: scheduleMode === "scheduled" ? scheduledSlot : null,
          idempotencyKey: idempotencyKeyRef.current,
          // Debug-only echoes of what the client displayed. The server
          // should recompute these itself and may log a mismatch, but
          // must not use these values to price or accept the order.
          debugClientBranchName: selectedBranch.name,
          debugClientDistance: distance,
          debugClientDeliveryFee: deliveryFee,
          debugClientDeliverable: deliverable,
          debugClientTotal: total,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPlaceOrderError({
          message: data.message || "We couldn't place your order. Please try again.",
        });
        return;
      }

      const orderData = {
        orderId: data.orderId,
        name,
        phone,
        address,
        branchId,
        total: data.total ?? total,
        paymentMethod,
        lines,
        placedAt: Date.now(),
        scheduleMode,
        scheduledFor: scheduleMode === "scheduled" ? scheduledSlot : null,
      };
      sessionStorage.setItem("dph_last_order", JSON.stringify(orderData));
      clearCart();
      // Rotate the key now that this order succeeded, so if this component
      // instance is ever reused for another order it won't collide with
      // this (now-completed) one.
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      router.push("/order-confirmed");
    } catch (e) {
      console.error(e);
      setPlaceOrderError({
        message: "Something went wrong while placing your order. Please check your connection and try again.",
      });
    } finally {
      setIsPlacing(false);
      isSubmittingRef.current = false;
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-bg pt-28 pb-24 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
          <ShoppingBag size={26} className="text-ink-muted" />
        </div>
        <p className="text-ink-secondary mb-6">Your cart is empty.</p>
        <a
          href="/menu"
          className="px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-bright transition-colors"
        >
          Explore Menu
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-10 text-center">
          Checkout
        </h1>

        <CheckoutStepper currentStep={step} steps={[...STEPS]} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepTransition key="step1">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                <h2 className="font-semibold text-lg mb-6">Delivery Details</h2>

                <div className="space-y-4 mb-6">
                  <Field label="Full Name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="input-field"
                    />
                  </Field>
                  <Field label="Phone Number" error={phone.length > 0 && !isPhoneValid ? "Enter a valid 10-digit mobile number" : undefined}>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="input-field"
                    />
                  </Field>
                  <Field label="Delivery Address">
                    <div className="space-y-3">

                      <AddressAutocomplete
                        value={address}
                        onChange={setAddress}
                        onSelect={({ address, lat, lng }) => {
                          setAddress(address);
                          setCoords({ lat, lng });

                          const result = findNearestBranch(lat, lng);
                          applyBranchResult(result);
                        }}
                      />

                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-ink-muted">OR</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <CurrentLocation
                      onLocationFound={async ({ lat, lng }) => {
                        setCoords({ lat, lng });

                        const result = findNearestBranch(lat, lng);
                        applyBranchResult(result);

                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`
                        );

                        if (!res.ok) {
                          throw new Error(`Reverse geocoding failed with status ${res.status}`);
                        }

                        const data = await res.json();
                        if (!data.display_name) {
                          throw new Error("Reverse geocoding returned no address");
                        }

                        setAddress(data.display_name);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />

                </div>
              </Field>
                  
                </div>

                <ScheduleSelector
                  mode={scheduleMode}
                  onModeChange={setScheduleMode}
                  selectedSlot={scheduledSlot}
                  onSlotChange={setScheduledSlot}
                />
                {!deliverable && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    Sorry, we don&apos;t deliver to this address yet.
                  </div>
                )}
              </div>

              <NavButtons
                onNext={() => setStep(2)}
                nextDisabled={!detailsValid}
                nextLabel="Continue to Payment"
              />
            </StepTransition>
          )}

          {step === 2 && (
            <StepTransition key="step2">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                <h2 className="font-semibold text-lg mb-6">Payment Method</h2>
                <div className="grid gap-3">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      paymentMethod === "upi"
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <Wallet size={20} className="text-gold" />
                    <div className="text-left">
                      <span className="text-sm font-medium block">UPI</span>
                      <span className="text-xs text-ink-muted">Pay via Google Pay, PhonePe, Paytm, etc.</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      paymentMethod === "cod"
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <Banknote size={20} className="text-gold" />
                    <div className="text-left">
                      <span className="text-sm font-medium block">Cash on Delivery</span>
                      <span className="text-xs text-ink-muted">Pay when your order arrives.</span>
                    </div>
                  </button>
                </div>
              </div>

              <NavButtons
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                nextLabel="Review Order"
              />
            </StepTransition>
          )}

          {step === 3 && (
            <StepTransition key="step3">
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-white/5">
                <h2 className="font-semibold text-lg mb-6">Review Your Order</h2>

                <div className="space-y-3 mb-6">
                  {lines.map((line) => (
                    <div key={line.lineId} className="flex gap-3 items-center">
                      {line.image && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface">
                          <Image src={line.image} alt={line.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {line.quantity}x {line.name}
                        </span>
                        {line.customizationSummary && (
                          <span className="text-xs text-ink-muted">{line.customizationSummary}</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {formatINR(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold/10 border border-gold/30 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={15} className="text-gold shrink-0" />
                        <span className="text-xs font-semibold text-gold truncate">
                          {appliedCoupon.code} applied — {appliedCoupon.description}
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-ink-muted hover:text-accent transition-colors shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 bg-bg rounded-xl px-1.5 py-1.5 border border-white/5">
                        <Tag size={14} className="text-ink-muted ml-2 shrink-0" />
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Have a coupon code?"
                          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink-muted min-w-0"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="text-xs font-semibold text-gold px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-accent mt-1.5 ml-1">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Discount</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Nearest Branch</span>
                    <span>{selectedBranch.name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Distance</span>
                    <span>{distance.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between text-sm text-ink-secondary">
                    <span>Delivery Fee</span>
                    <span className="text-gold">
                      {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>

                {belowMinimum && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30 text-sm text-accent-bright">
                    Add {formatINR(amountToUnlock)} more to reach the {formatINR(brand.minOrder)} minimum order value.
                  </div>
                )}

                {!deliverable && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    Sorry, we don&apos;t deliver to this address yet. Please go back and update your address.
                  </div>
                )}

                {placeOrderError && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {placeOrderError.message}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/5 text-sm text-ink-secondary space-y-1">
                  <p><span className="text-ink-muted">Name:</span> {name}</p>
                  <p><span className="text-ink-muted">Phone:</span> {phone}</p>
                  <p className="break-words">
                    <span className="text-ink-muted">Address:</span> {address}
                  </p>
                  <p><span className="text-ink-muted">Payment:</span> {paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}</p>
                  <p>
                    <span className="text-ink-muted">Delivery:</span>{" "}
                    {scheduleMode === "now" || !scheduledSlot
                      ? "As soon as possible"
                      : new Date(scheduledSlot).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                  </p>
                </div>
              </div>

              <NavButtons
                onBack={() => setStep(2)}
                onNext={handlePlaceOrder}
                nextLabel={isPlacing ? "Placing Order..." : `Place Order — ${formatINR(total)}`}
                nextDisabled={isPlacing || belowMinimum || !deliverable}
              />
            </StepTransition>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          transition: border-color 0.3s;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(246, 196, 83, 0.5);
        }
        .input-field::placeholder {
          color: #7a7a7a;
        }
      `}</style>
    </div>
  );
}

function StepTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-secondary mb-1.5 block">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mt-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-full border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors duration-300"
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="magnetic-btn flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:pointer-events-none text-white font-semibold transition-all duration-300 active:scale-95 shadow-accentGlow"
      >
        {nextLabel}
      </button>
    </div>
  );
}