
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { brand } from "@/data/branches";
import { formatINR } from "@/lib/utils";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Our average delivery time is around 30–45 minutes depending on your location and order volume.",
  },
  {
    question: "What is the minimum order value?",
    answer: `The minimum order value for delivery is ${formatINR(brand.minOrder)}. There's no minimum for pickup orders.`,
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept UPI and Cash on Delivery (COD) at checkout, and cash or UPI in person for pickup orders.",
  },
  {
    question: "Do you provide party or bulk orders?",
    answer:
      "Yes. We provide party orders, birthday catering and corporate food orders. Contact us in advance for the best service.",
  },
  {
    question: "Are all your pizzas 100% Pure Veg?",
    answer:
      "Yes. Every item served at Da Pizza Hub is 100% Pure Vegetarian.",
  },
];

export function ContactFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24">

      <div className="mx-auto max-w-5xl px-6">

        <div className="mb-16 text-center">

          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#F6C453]">
            FAQ
          </span>

          <h2 className="mt-5 font-heading text-5xl text-white lg:text-6xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Everything you need to know before placing your order.
          </p>

        </div>

        <div className="space-y-5">

          {faqs.map((faq, index) => {

            const isOpen = open === index;

            return (

              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
              >

                <button
                  onClick={() =>
                    setOpen(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-8 py-6 text-left"
                >

                  <h3 className="text-xl font-semibold text-white">

                    {faq.question}

                  </h3>

                  <motion.div
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                  >

                    <ChevronDown
                      size={24}
                      className="text-[#F6C453]"
                    />

                  </motion.div>

                </button>

                <AnimatePresence>

                  {isOpen && (

                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                    >

                      <div className="px-8 pb-8">

                        <p className="leading-8 text-white/60">

                          {faq.answer}

                        </p>

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}