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
} from "lucide-react";

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

export function QuickOrder() {
  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-12">
          <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
            Quick Order
          </p>

          <h2 className="text-4xl font-heading">
            Choose How You'd Like To Order
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

      </div>
    </section>
  );
}