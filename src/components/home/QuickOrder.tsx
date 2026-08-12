"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  PartyPopper,
  ArrowRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import { branches } from "@/data/branches";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";

// -----------------------------------------------------
// Swiggy / Zomato badges
// -----------------------------------------------------

function SwiggyBadge() {
  return (
    <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#FC8019] text-lg sm:text-xl font-bold mb-5">
      S
    </span>
  );
}

function ZomatoBadge() {
  return (
    <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#E23744] text-lg sm:text-xl font-bold mb-5">
      Z
    </span>
  );
}

// -----------------------------------------------------
// Primary branch
// -----------------------------------------------------

const primaryBranch =
  branches.find((b) => b.id === "Panki") ?? branches[0];

// -----------------------------------------------------
// Quick Order
// -----------------------------------------------------

const quickOrder = [
  {
    title: "Delivery",
    desc: "Hot & Fresh delivery at your doorstep.",
    href: "/menu",
    color: "from-red-700/80 to-red-900/60",
    image: "/images/quick/delivery.webp",
    icon: Bike,
  },
  {
    title: "Takeaway",
    desc: "Skip the wait and pick up your order.",
    href: "/menu",
    color: "from-orange-700/80 to-orange-900/60",
    image: "/images/quick/takeaway.webp",
    icon: ShoppingBag,
  },
  {
    title: "Dine In",
    desc: "Enjoy premium dining with family & friends.",
    href: "/branches",
    color: "from-green-700/80 to-green-900/60",
    image: "/images/quick/dinein.webp",
    icon: UtensilsCrossed,
  },
  {
    title: "Party Booking",
    desc: "Celebrate birthdays & events with us.",
    href: "/contact",
    color: "from-purple-700/80 to-purple-900/60",
    image: "/images/quick/party.webp",
    icon: PartyPopper,
  },
];

// -----------------------------------------------------
// Order Now
// -----------------------------------------------------

const orderNowLinks = [
  {
    title: "Call Us",
    desc: "Speak to us directly to place your order.",
    href: `tel:${primaryBranch.phone}`,
    external: false,
    color: "from-blue-700/80 to-blue-900/60",
    icon: Phone,
    isBadge: false,
  },
  {
    title: "WhatsApp",
    desc: "Chat with us to order in a few taps.",
    href: buildWhatsAppOrderLink(primaryBranch.whatsapp),
    external: true,
    color: "from-[#128C4A]/80 to-[#075E33]/60",
    icon: MessageCircle,
    isBadge: false,
  },
  ...(primaryBranch.swiggyUrl
    ? [
        {
          title: "Swiggy",
          desc: "Order through Swiggy for fast delivery.",
          href: primaryBranch.swiggyUrl,
          external: true,
          color: "from-[#FC8019]/80 to-[#B85A0F]/60",
          icon: SwiggyBadge,
          isBadge: true,
        },
      ]
    : []),
  ...(primaryBranch.zomatoUrl
    ? [
        {
          title: "Zomato",
          desc: "Order through Zomato for fast delivery.",
          href: primaryBranch.zomatoUrl,
          external: true,
          color: "from-[#E23744]/80 to-[#9E1F29]/60",
          icon: ZomatoBadge,
          isBadge: true,
        },
      ]
    : []),
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

export function QuickOrder() {
  return (
    <section className="bg-bg py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* =================================================
            QUICK ORDER HEADER
        ================================================= */}

        <div className="mb-8 sm:mb-10 lg:mb-12">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Quick Order
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading leading-tight">
            Choose How You&apos;d Like To Order
          </h2>
        </div>

        {/* =================================================
            QUICK ORDER CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

          {quickOrder.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
                className="h-full"
              >
                <Link
                  href={item.href}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    h-[300px]
                    sm:h-[310px]
                    block
                    border
                    border-white/10
                  "
                >

                  {/* Image */}

                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-110
                    "
                  />

                  {/* Gradient */}

                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${item.color}`}
                  />

                  {/* Dark overlay */}

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

                  {/* Content */}

                  <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-7">

                    {/* Top Content */}

                    <div>

                      <div className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-white/10
                        backdrop-blur-md
                        flex
                        items-center
                        justify-center
                        mb-5
                      ">
                        <Icon size={24} />
                      </div>

                      <h3 className="text-2xl font-bold mb-3">
                        {item.title}
                      </h3>

                      <p className="text-white/75 leading-relaxed max-w-[240px]">
                        {item.desc}
                      </p>

                    </div>

                    {/* Bottom */}

                    <div className="flex items-center justify-between">

                      <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/70">
                        Explore
                      </span>

                      <div className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-full
                        bg-white
                        text-black
                        flex
                        items-center
                        justify-center
                        transition-transform
                        duration-300
                        group-hover:translate-x-1.5
                      ">
                        <ArrowRight size={18} />
                      </div>

                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })}

        </div>

        {/* =================================================
            ORDER NOW HEADER
        ================================================= */}

        <div className="mt-14 sm:mt-16 lg:mt-20 mb-7 sm:mb-8">

          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Order Now
          </p>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading leading-tight">
            Call, Chat, Or Order On Your Favourite App
          </h3>

        </div>

        {/* =================================================
            ORDER NOW CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

          {orderNowLinks.map((item, index) => {

            const Icon = item.icon;

            const linkProps = item.external
              ? {
                  target: "_blank",
                  rel: "noopener noreferrer" as const,
                }
              : {};

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
                className="h-full"
              >

                <a
                  href={item.href}
                  {...linkProps}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    h-[270px]
                    sm:h-[280px]
                    block
                    border
                    border-white/10
                    bg-gradient-to-br
                    ${item.color}
                    transition-all
                    duration-300
                    hover:-translate-y-1
                  `}
                >

                  {/* Overlay */}

                  <div className="
                    absolute
                    inset-0
                    bg-black/10
                    group-hover:bg-black/5
                    transition-colors
                    duration-300
                  " />

                  {/* Card Content */}

                  <div className="
                    relative
                    z-10
                    flex
                    flex-col
                    justify-between
                    h-full
                    p-6
                    sm:p-7
                  ">

                    {/* TOP */}

                    <div>

                      {item.isBadge ? (
                        <Icon />
                      ) : (
                        <div className="
                          w-12
                          h-12
                          sm:w-14
                          sm:h-14
                          rounded-2xl
                          bg-white/10
                          backdrop-blur-md
                          flex
                          items-center
                          justify-center
                          mb-5
                        ">
                          <Icon size={22} />
                        </div>
                      )}

                      <h3 className="
                        text-xl
                        sm:text-2xl
                        font-bold
                        mb-2
                      ">
                        {item.title}
                      </h3>

                      <p className="
                        text-white/75
                        text-sm
                        leading-relaxed
                        max-w-[240px]
                      ">
                        {item.desc}
                      </p>

                    </div>

                    {/* BOTTOM */}

                    <div className="
                      flex
                      items-center
                      justify-between
                      pt-6
                    ">

                      <span className="
                        text-xs
                        sm:text-sm
                        uppercase
                        tracking-[0.2em]
                        text-white/70
                      ">
                        {item.external ? "Open" : "Call"}
                      </span>

                      <div className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-full
                        bg-white
                        text-black
                        flex
                        items-center
                        justify-center
                        transition-transform
                        duration-300
                        group-hover:translate-x-1.5
                      ">
                        <ArrowRight size={18} />
                      </div>

                    </div>

                  </div>

                </a>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}