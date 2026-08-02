"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { Reveal, StaggerContainer, staggerItem } from "@/components/ui/Reveal";

const reviews = [
  {
    name: "Ankit Sharma",
    rating: 5,
    text: "Best pure veg pizza in Panki, hands down. The cheese burst crust is unreal and delivery is always fast and hot.",
    verified: true,
  },
  {
    name: "Priya Gupta",
    rating: 5,
    text: "Ordered the Family Combo for a get-together — everyone loved it. Fresh ingredients, generous toppings.",
    verified: true,
  },
  {
    name: "Rohit Verma",
    rating: 4,
    text: "Consistent quality every time I order. The Tandoori Paneer Pizza is my go-to. Highly recommend.",
    verified: true,
  },
  {
    name: "Simran Kaur",
    rating: 5,
    text: "Loved the garlic bread and the customer service on WhatsApp. Quick, polite and the food arrived on time.",
    verified: true,
  },
];

export function Reviews() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Loved By Kanpur
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">
                What Our Customers Say
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-white/5">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-gold" />
                ))}
              </div>
              <span className="text-sm font-semibold">4.6 · Google Reviews</span>
            </div>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review) => (
            <motion.div
              key={review.name}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors duration-500"
            >
              <div className="flex text-gold mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={13} className="fill-gold" />
                ))}
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed mb-5">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-primary">{review.name}</span>
                {review.verified && (
                  <BadgeCheck size={14} className="text-gold" />
                )}
              </div>
            </motion.div>
          ))}
        </StaggerContainer>

        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <a
            href="https://g.page/r/review"
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-btn inline-flex items-center px-6 py-3 rounded-full border border-white/15 text-ink-primary text-sm font-semibold hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Leave a Review
          </a>
        </Reveal>
      </div>
    </section>
  );
}
