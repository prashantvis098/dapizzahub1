"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Phone,
  ShoppingBag,
  Sparkles,
  Clock3,
  Star,
} from "lucide-react";

const container = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32 lg:py-40">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-[#080808]" />

        <div className="absolute inset-0 bg-gradient-to-br from-[#090909] via-[#111111] to-[#050505]" />

        {/* Animated Red Glow */}

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.18, 0.35, 0.18],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-48 top-10 h-[520px] w-[520px] rounded-full bg-[#D91F26] blur-[180px]"
        />

        {/* Animated Gold Glow */}

        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-44 bottom-0 h-[520px] w-[520px] rounded-full bg-[#F6C453] blur-[200px]"
        />

        {/* Spotlight */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.05),transparent_72%)]" />

        {/* Grid */}

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:70px_70px]" />

      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{
          once: true,
          amount: 0.25,
        }}
        className="relative mx-auto max-w-7xl px-6"
      >

        <div className="mx-auto max-w-5xl text-center">
                    {/* Premium Badge */}

          <motion.div variants={item}>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-6 py-3 backdrop-blur-xl">

              <Sparkles
                size={16}
                className="text-[#F6C453]"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F6C453]">

                Fresh • Hot • Pure Veg

              </span>

            </div>

          </motion.div>

          {/* Heading */}

          <motion.h2
            variants={item}
            className="mt-10 font-heading text-6xl leading-[0.9] text-white md:text-7xl xl:text-8xl"
          >

            Every Slice

            <br />

            Made To

            <span className="block bg-gradient-to-r from-[#F6C453] via-white to-[#F6C453] bg-clip-text text-transparent">

              Impress.

            </span>

          </motion.h2>

          {/* Subtitle */}

          <motion.p
            variants={item}
            className="mx-auto mt-10 max-w-3xl text-lg leading-9 text-white/65 lg:text-xl"
          >

            Experience handcrafted pizzas baked with premium mozzarella,
            garden-fresh vegetables, signature sauces and authentic flavours
            — prepared fresh for every single order.

          </motion.p>

          {/* Feature Pills */}

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">

              <Star
                size={16}
                className="text-[#F6C453]"
              />

              <span className="text-sm text-white">

                4.8 Google Rating

              </span>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">

              <Clock3
                size={16}
                className="text-[#F6C453]"
              />

              <span className="text-sm text-white">

                30 Min Delivery

              </span>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">

              <Sparkles
                size={16}
                className="text-[#F6C453]"
              />

              <span className="text-sm text-white">

                100% Pure Veg

              </span>

            </div>

          </motion.div>

          {/* CTA Buttons */}

          <motion.div
            variants={item}
            className="mt-14 flex flex-wrap justify-center gap-5"
          >

            <Link
              href="/menu"
              className="group inline-flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-10 text-lg font-bold text-white shadow-[0_20px_50px_rgba(217,31,38,.35)] transition-all duration-300 hover:scale-105"
            >

              <ShoppingBag size={22} />

              Order Online

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />

            </Link>

            <a
              href="tel:+918081871440"
              className="group inline-flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 text-lg font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-[#F6C453]/40 hover:bg-white/10 hover:scale-105"
            >

              <Phone size={20} />

              Call Now

            </a>

          </motion.div>
                    {/* Premium Stats */}

          <motion.div
            variants={item}
            className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3"
          >

            {[
              {
                value: "20K+",
                label: "Happy Customers",
              },
              {
                value: "4.8★",
                label: "Google Rating",
              },
              {
                value: "100%",
                label: "Pure Veg",
              },
            ].map((stat) => (

              <motion.div
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                transition={{
                  duration: .3,
                }}
                key={stat.label}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
              >

                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">

                  <h3 className="font-heading text-5xl text-[#F6C453]">

                    {stat.value}

                  </h3>

                  <p className="mt-3 text-white/60">

                    {stat.label}

                  </p>

                </div>

              </motion.div>

            ))}

          </motion.div>

          {/* Floating Review Card */}

          <motion.div
            variants={item}
            className="mt-16 flex justify-center"
          >

            <div className="rounded-full border border-[#F6C453]/20 bg-[#F6C453]/10 px-8 py-4 backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex text-[#F6C453]">

                  ★★★★★

                </div>

                <span className="text-sm text-white/70">

                  Loved by thousands of pizza lovers across Kanpur

                </span>

              </div>

            </div>

          </motion.div>

        </div>

      </motion.div>

      {/* Bottom Glow */}

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#D91F26]/10 to-transparent pointer-events-none" />

    </section>
  );
}