"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const faqs = [
  {
    q: "Do you deliver to my area?",
    a: "We offer free delivery within 3 KM of any of our 4 branches. Enter your address at checkout and we'll confirm delivery availability instantly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI and Cash on Delivery (COD) across all branches. Card payments may be available depending on your branch — ask us on WhatsApp.",
  },
  {
    q: "Can I customize my pizza?",
    a: "Absolutely. Choose your size, base, extra cheese, cheese burst, and add any of our fresh vegetable toppings — all with live pricing as you customize.",
  },
  {
    q: "Is everything on the menu 100% vegetarian?",
    a: "Yes. Da Pizza Hub is a 100% pure vegetarian kitchen — every single item across all branches, no exceptions.",
  },
  {
    q: "What are your delivery timings?",
    a: "Most branches are open from late morning to late night. Exact hours vary slightly by branch — check the Branches section or call ahead.",
  },
  {
    q: "How many branches do you have?",
    a: "We currently operate 4 branches. See the Branches section above for addresses, contact numbers, and directions to each.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32 bg-bg">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3 text-center">
            Questions
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-14 text-center">
            Frequently Asked Questions
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-medium text-ink-primary pr-4">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 text-gold"
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-ink-secondary leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
