"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const galleryImages = [
  "/images/gallery/insta-11.webp",
  "/images/gallery/insta-12.webp",
  "/images/gallery/insta-13.webp",
  "/images/gallery/insta-14.webp",
  "/images/gallery/insta-15.webp",
  "/images/gallery/insta-16.webp",
  "/images/gallery/insta-17.webp",
  "/images/gallery/insta-18.webp",
  "/images/gallery/insta-19.webp",
  "/images/gallery/insta-20.webp",
];

export function InstagramGallery() {
  return (
    <section className="py-24 lg:py-32 bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex items-center justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Real Food. Real Customers.
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">
                @dapizzahub
              </h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-sm font-semibold hover:bg-white/5 transition-all duration-300"
            >
              <Instagram size={16} /> Follow
            </a>
          </div>
        </Reveal>

        <div className="columns-2 sm:columns-3 lg:columns-5 gap-3 space-y-3">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 5) * 0.06 }}
              className="group relative rounded-xl overflow-hidden break-inside-avoid"
            >
              <Image
                src={img}
                alt="Da Pizza Hub on Instagram"
                width={400}
                height={i % 3 === 0 ? 500 : 400}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}