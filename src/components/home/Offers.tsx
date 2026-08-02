"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const offers = [
  {
    title: "30% OFF",
    subtitle: "On Your First Order",
    description:
      "Get flat 30% OFF on your first online order with premium handcrafted pizzas.",
    image: "/images/offers/offer-1.webp",
    badge: "LIMITED TIME",
    button: "Claim Offer",
    gradient: "from-red-700/90 via-red-900/70 to-black/90",
  },
  {
    title: "FREE DELIVERY",
    subtitle: "Orders Above ₹299",
    description:
      "Hot, fresh and fast delivery right to your doorstep with every qualifying order.",
    image: "/images/offers/offer-2.webp",
    badge: "HOT DEAL",
    button: "Order Now",
    gradient: "from-green-700/90 via-green-900/70 to-black/90",
  },
  {
    title: "FAMILY COMBO",
    subtitle: "Starting @ ₹499",
    description:
      "Pizza + Garlic Bread + Cold Drink. Perfect for family movie nights.",
    image: "/images/offers/offer-3.webp",
    badge: "BEST VALUE",
    button: "View Combo",
    gradient: "from-orange-700/90 via-red-800/70 to-black/90",
  },
];

export function Offers() {
  return (
    <section
      id="offers"
      className="py-24 lg:py-32 bg-gradient-to-b from-bg via-[#0d0d0d] to-bg"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex items-end justify-between mb-14 flex-wrap gap-6">

          <div>

            <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">
              SPECIAL OFFERS
            </p>

            <h2 className="font-heading text-5xl lg:text-6xl">
              Today's Best Deals
            </h2>

          </div>

          <Link
            href="/menu"
            className="text-gold font-semibold hover:text-white transition-colors"
          >
            View Full Menu →
          </Link>

        </div>

        <div className="grid lg:grid-cols-3 gap-7">

          {offers.map((offer, index) => (

            <motion.div
              key={offer.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: .6,
                delay: index * .1,
              }}
              whileHover={{
                y: -10,
              }}
              className="group relative h-[430px] overflow-hidden rounded-[32px] border border-white/10"
            >

              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t ${offer.gradient}`}
              />

              <div className="absolute inset-0 bg-black/25" />

              <div className="relative z-10 flex h-full flex-col justify-between p-8">

                <div>

                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-[11px] uppercase tracking-[0.25em]">

                    {offer.badge}

                  </span>

                  <h3 className="font-heading text-5xl leading-none mt-6">

                    {offer.title}

                  </h3>

                  <p className="text-gold text-xl mt-4">

                    {offer.subtitle}

                  </p>

                  <p className="text-white/75 mt-6 leading-relaxed max-w-xs">

                    {offer.description}

                  </p>

                </div>

                <Link
                  href="/menu"
                  className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-black transition-all duration-300 hover:scale-105"
                >
                  {offer.button}
                  <ArrowRight size={18} />
                </Link>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}