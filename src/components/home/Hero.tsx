"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Leaf, ChefHat, Heart, MapPin, ArrowRight } from "lucide-react";
import { useMagneticHover } from "@/lib/useMagneticHover";

const features = [
  { icon: Leaf, line1: "100%", line2: "Pure Veg" },
  { icon: ChefHat, line1: "Hygienic", line2: "Kitchen" },
  { icon: Heart, line1: "Loved by", line2: "Thousands" },
  { icon: MapPin, line1: "Serving Across", line2: "4 Locations" },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Controlled mouse-follow glow — a soft light that tracks the cursor
  // over the image. This does NOT move on its own; it only reacts to
  // real pointer input and eases back to center on leave. No scroll
  // parallax, no infinite loops, no floating.
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 90, damping: 22, mass: 0.6 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);
  const glowXPct = useTransform(glowX, (v) => `${v * 100}%`);
  const glowYPct = useTransform(glowY, (v) => `${v * 100}%`);

  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  // Subtle magnetic pull on the two primary CTAs — element nudges toward
  // the cursor within its own bounds, springs back on mouse leave.
  const primaryCta = useMagneticHover(0.25);
  const secondaryCta = useMagneticHover(0.25);

  function handlePointerLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-screen w-full overflow-hidden bg-bg"
    >
      {/* ---- Background image — dramatic entrance, static after ---- */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: easeOut }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/images/hero/hero-main.webp"
            alt="Freshly baked premium pure veg pizza with melted cheese pull, wood-fired oven in background"
            fill
            priority
            className="object-cover object-[75%_center] sm:object-center"
            sizes="100vw"
          />
        </motion.div>

        {/* Cinematic color grade — static */}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-60"
          style={{
            background:
              "linear-gradient(160deg, rgba(20,8,6,0.5) 0%, rgba(9,9,9,0) 45%, rgba(9,9,9,0.35) 100%)",
          }}
        />
        {/* Fine grain texture — static */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Controlled mouse-follow glow — reacts to cursor only, no autonomous motion */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
          style={{
            background: useTransform(
              [glowXPct, glowYPct],
              ([gx, gy]) => `radial-gradient(650px circle at ${gx} ${gy}, rgba(255,255,255,0.3), transparent 60%)`
            ) as unknown as string,
          }}
        />
      </div>

      {/* ---- Dark overlay: darker left, lighter right ---- */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,5,5,0.94)] via-[rgba(5,5,5,0.68)] to-[rgba(5,5,5,0.2)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-bg/25" />
      <div className="absolute inset-0 shadow-[inset_0_0_220px_80px_rgba(5,5,5,0.55)] pointer-events-none" />

      {/* ---- Content ---- */}
      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-6 lg:px-8 flex items-center py-32 lg:py-24">
        <div className="w-full max-w-[600px]">
          {/* Top label with decorative lines + live pulse dot */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/70" />
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-light uppercase tracking-[0.3em] text-gold whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              Kanpur&apos;s Favourite
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
          </motion.div>

          {/* Main heading — dramatic staggered entrance, per-word reveal */}
          <h1 className="font-heading leading-[0.9] tracking-[-0.02em] mb-7 overflow-hidden">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
              className="block text-white text-[2.6rem] sm:text-6xl xl:text-[5.2rem]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
            >
              100% Pure Veg
            </motion.span>
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
              className="block text-[2.6rem] sm:text-6xl xl:text-[5.2rem] bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #FF6B00 0%, #D91F26 55%, #A8161C 100%)",
                filter: "drop-shadow(0 4px 28px rgba(217,31,38,0.35))",
              }}
            >
              Pizza Experience
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
            className="font-sans text-white/95 text-[18px] font-medium mb-3"
          >
            Fresh Dough <span className="text-gold mx-1">•</span> Premium Cheese{" "}
            <span className="text-gold mx-1">•</span> Farm Fresh Ingredients
          </motion.p>

          {/* Signature script line */}
          <motion.p
            initial={{ opacity: 0, y: 15, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: easeOut }}
            className="font-script text-leaf text-3xl sm:text-4xl mb-10"
            style={{ textShadow: "0 2px 16px rgba(116,192,67,0.25)" }}
          >
            Made Fresh on Every Order
          </motion.p>

          {/* Buttons — premium: breathing gradient, sheen sweep, refined glass */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: easeOut }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Link
              href="/menu"
              ref={primaryCta.ref as React.Ref<HTMLAnchorElement>}
              onMouseMove={primaryCta.onMouseMove}
              onMouseLeave={primaryCta.onMouseLeave}
              style={{
                ...primaryCta.style,
                boxShadow: "0 10px 32px rgba(217,31,38,0.4), 0 2px 8px rgba(0,0,0,0.3)",
              }}
              className="magnetic-btn group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold overflow-hidden hover:scale-[1.06] active:scale-95 transition-transform duration-300"
            >
              {/* Gradient base — static at rest, shifts smoothly on hover only (no idle loop) */}
              <span
                className="absolute inset-0 transition-[background-position] duration-700 ease-out bg-[length:200%_100%] bg-[position:0%_50%] group-hover:bg-[position:100%_50%]"
                style={{
                  backgroundImage: "linear-gradient(90deg, #D91F26 0%, #FF6B00 50%, #D91F26 100%)",
                }}
              />
              {/* Sheen sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {/* Inner ring for extra polish */}
              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
              <span className="relative">Order Online</span>
              <motion.span
                className="relative flex items-center justify-center"
                whileHover={{ x: 3 }}
              >
                <ArrowRight size={17} />
              </motion.span>
            </Link>
            <Link
              href="/menu"
              ref={secondaryCta.ref as React.Ref<HTMLAnchorElement>}
              onMouseMove={secondaryCta.onMouseMove}
              onMouseLeave={secondaryCta.onMouseLeave}
              style={secondaryCta.style}
              className="magnetic-btn group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full border border-white/25 text-white font-semibold backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.12] hover:border-gold/40 hover:scale-[1.06] active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative">Explore Menu</span>
              <motion.span className="relative flex items-center justify-center" whileHover={{ x: 3 }}>
                <ArrowRight size={17} />
              </motion.span>
            </Link>
          </motion.div>

          {/* Feature highlight cards — USP strip: gradient icon rings,
              accent top-border, refined glass depth on hover */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 1.15 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {features.map((f) => (
              <motion.div
                key={f.line1 + f.line2}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.92 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: easeOut } },
                }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative flex flex-col items-start gap-3 rounded-2xl px-4 py-4 bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-400 shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_rgba(246,196,83,0.18)]"
              >
                {/* Accent top edge that brightens on hover */}
                <span className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold/0 group-hover:via-gold/60 to-transparent transition-all duration-500" />

                <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/20 group-hover:ring-gold/50 group-hover:from-gold/30 transition-all duration-400">
                  <f.icon size={18} className="text-gold" strokeWidth={1.75} />
                </span>
                <span className="font-sans text-[12.5px] leading-tight text-white/90 font-medium">
                  {f.line1}
                  <br />
                  {f.line2}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade for a clean handoff into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}