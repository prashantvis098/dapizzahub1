"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const cards = [
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 80818 71440",
    href: "tel:+918081871440",
    color: "from-[#D91F26] to-[#FF6B00]",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat With Us",
    href: "https://wa.me/918081871440",
    color: "from-[#25D366] to-[#1EBE57]",
  },
  {
    icon: Mail,
    title: "Email",
    value: "contact@dapizzahub.com",
    href: "mailto:contact@dapizzahub.com",
    color: "from-[#F6C453] to-[#FF9F1A]",
  },
  {
    icon: MapPin,
    title: "Visit Store",
    value: "Panki, Kanpur",
    href: "https://maps.google.com",
    color: "from-[#8B5CF6] to-[#EC4899]",
  },
];

export function ContactCards() {
  return (
    <section className="relative py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">

          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#F6C453]">

            GET IN TOUCH

          </span>

          <h2 className="mt-5 font-heading text-5xl text-white lg:text-6xl">

            Multiple Ways To Reach Us

          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">

            Choose the most convenient way to connect with our team.
            We're always happy to help.

          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {cards.map((card, index) => {

            const Icon = card.icon;

            return (

              <motion.div
                key={card.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * .1,
                  duration: .6,
                }}
              >

                <Link
                  href={card.href}
                  target="_blank"
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F6C453]/40"
                >

                  <div
                    className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color}`}
                  >

                    <Icon
                      size={30}
                      className="text-white"
                    />

                  </div>

                  <h3 className="text-2xl font-bold text-white">

                    {card.title}

                  </h3>

                  <p className="mt-4 text-white/60">

                    {card.value}

                  </p>

                  <div className="mt-8 flex items-center gap-2 font-semibold text-[#F6C453]">

                    Connect

                    <ArrowUpRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />

                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                </Link>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}