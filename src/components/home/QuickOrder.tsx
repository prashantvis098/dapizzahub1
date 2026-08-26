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
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import type { Branch } from "@/types";

interface QuickOrderProps {
  /** Branches fetched server-side (DB-backed when configured) — see
   * getBranches() in src/lib/data.ts — so Call/WhatsApp/Swiggy/Zomato
   * links reflect admin edits instead of the original static data. */
  branches: Branch[];
}

// Small inline glyphs for Swiggy/Zomato — kept as simple monograms rather
// than importing brand logo assets (avoids licensing/trademark-asset use),
// same approach as the Branches section.
function SwiggyBadge() {
  return (
    <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#FC8019] text-base sm:text-xl font-bold mb-3 sm:mb-5">
      S
    </span>
  );
}
function ZomatoBadge() {
  return (
    <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-[#E23744] text-base sm:text-xl font-bold mb-3 sm:mb-5">
      Z
    </span>
  );
}

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

export function QuickOrder({ branches }: QuickOrderProps) {
  // Direct-order links use the primary (Panki) branch's contact details —
  // same source of truth as the Branches section. Looked up by id (not
  // array position) so this stays correct even if branches is reordered.
  const primaryBranch = branches.find((b) => b.id === "Panki") ?? branches[0];

  // "Order Now" — direct links to call, WhatsApp, Swiggy & Zomato.
  // Swiggy/Zomato are only listed for the Panki branch, so these two
  // only render if that branch has the respective URL set.
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

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-12">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Quick Order
          </p>

          <h2 className="text-4xl font-heading">
            Choose How You&apos;d Like To Order
          </h2>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          {quickOrder.map((item, index) => {

            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: .6,
                  delay: index * .1,
                }}
              >

                <Link
                  href={item.href}
                  className="group relative overflow-hidden rounded-3xl h-[290px] block border border-white/10"
                >

                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 duration-700"
                  />

                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${item.color}`}
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="relative z-10 flex flex-col justify-between h-full p-7">

                    <div>

                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5">

                        <Icon size={24} />

                      </div>

                      <h3 className="text-2xl font-bold mb-3">
                        {item.title}
                      </h3>

                      <p className="text-white/75 leading-relaxed">
                        {item.desc}
                      </p>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-sm uppercase tracking-widest text-white/70">
                        Explore
                      </span>

                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-2 duration-300">

                        <ArrowRight size={18} />

                      </div>

                    </div>

                  </div>

                </Link>

              </motion.div>
            );
          })}

        </div>

        <div className="mt-14">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Order Now
          </p>
          <h3 className="text-2xl font-heading mb-8">
            Call, Chat, Or Order On Your Favourite App
          </h3>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          {orderNowLinks.map((item, index) => {

            const Icon = item.icon;
            const linkProps = item.external
              ? { target: "_blank", rel: "noopener noreferrer" as const }
              : {};

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: .6,
                  delay: index * .1,
                }}
              >

                <a
                  href={item.href}
                  {...linkProps}
                  className={`group relative overflow-hidden rounded-3xl h-[240px] sm:h-[260px] block border border-white/10 bg-gradient-to-br ${item.color}`}
                >

                  <div className="absolute inset-0 bg-black/10" />

                  <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-7">

                    <div>

                      {item.isBadge ? (
                        <Icon />
                      ) : (
                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 sm:mb-5">
                          <Icon size={20} className="sm:hidden" />
                          <Icon size={24} className="hidden sm:block" />
                        </div>
                      )}

                      <h3 className="text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">
                        {item.title}
                      </h3>

                      <p className="text-white/75 leading-snug sm:leading-relaxed text-xs sm:text-sm line-clamp-2">
                        {item.desc}
                      </p>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-xs sm:text-sm uppercase tracking-widest text-white/70">
                        {item.external ? "Open" : "Call"}
                      </span>

                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-2 duration-300">

                        <ArrowRight size={16} className="sm:hidden" />
                        <ArrowRight size={18} className="hidden sm:block" />

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