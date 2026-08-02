"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Pizza",
    image: "/images/pizza-generic/pizza-18.webp",
    href: "/menu?cat=pizza",
    items: "35+ Items",
    glow: "from-[#FF6B00] to-[#D91F26]",
  },
  {
    name: "Burger",
    image: "/images/burger/cheese-burger.webp",
    href: "/menu?cat=burger",
    items: "12+ Items",
    glow: "from-[#D91F26] to-[#7A0F16]",
  },
  {
    name: "Pasta",
    image: "/images/pasta/white-sauce-pasta.webp",
    href: "/menu?cat=pasta",
    items: "8+ Items",
    glow: "from-[#F6C453] to-[#D99C1A]",
  },
  {
    name: "Garlic Bread",
    image: "/images/bread/garlic-bread.webp",
    href: "/menu?cat=bread",
    items: "10+ Items",
    glow: "from-[#C58B45] to-[#8C5A2B]",
  },
  {
    name: "Wraps",
    image: "/images/wrap/indian-veg-wrap.webp",
    href: "/menu?cat=wrap",
    items: "7+ Items",
    glow: "from-[#E56B2E] to-[#A63C06]",
  },
  {
    name: "Mocktails",
    image: "/images/mocktail/mocktail-1.webp",
    href: "/menu?cat=mocktail",
    items: "15+ Items",
    glow: "from-[#27AE60] to-[#0B6B34]",
  },
  {
    name: "Shakes",
    image: "/images/shake/chocolate-shake.webp",
    href: "/menu?cat=shake",
    items: "14+ Items",
    glow: "from-[#7E57C2] to-[#4527A0]",
  },
  {
    name: "Desserts",
    image: "/images/dessert/choco-lava-cake.webp",
    href: "/menu?cat=dessert",
    items: "9+ Items",
    glow: "from-[#F6C453] to-[#B8860B]",
  },
];

export function FeaturedCategories() {
  return (
    <section className="relative overflow-hidden bg-bg py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 flex items-end justify-between">

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">
              OUR MENU
            </p>

            <h2 className="font-heading text-5xl lg:text-6xl">
              Explore Categories
            </h2>
          </div>

          <Link
            href="/menu"
            className="hidden items-center gap-2 font-semibold text-gold transition hover:text-white lg:flex"
          >
            View Full Menu
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-16 lg:grid-cols-4">

          {categories.map((cat, index) => (

            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: .6,
                delay: index * .06,
              }}
            >

              <Link
                href={cat.href}
                className="group flex flex-col items-center"
              >

                <div className="relative h-56 w-56 lg:h-64 lg:w-64">

                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${cat.glow} opacity-0 blur-3xl transition duration-500 group-hover:opacity-50`}
                  />

                  <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-white/5 shadow-[0_20px_60px_rgba(0,0,0,.45)] transition duration-500 group-hover:border-[#F6C453]">

                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />

                  </div>

                </div>
                                <div className="mt-7 w-full rounded-[28px] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl transition-all duration-500 group-hover:border-[#F6C453]/40 group-hover:bg-white/10">

                  <h3 className="font-heading text-3xl tracking-wide">

                    {cat.name}

                  </h3>

                  <p className="mt-2 text-sm text-white/60">

                    {cat.items}

                  </p>

                  <div className="mt-6 flex items-center justify-center">

                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 group-hover:scale-105">

                      Explore Menu

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />

                    </span>

                  </div>

                </div>

              </Link>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}