"use client";

import { motion } from "framer-motion";

interface PolicyPageProps {
  title: string;
  description: string;
  sections: {
    heading: string;
    content: string[];
  }[];
}

export function PolicyPage({
  title,
  description,
  sections,
}: PolicyPageProps) {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">

      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#111111] to-[#090909]" />

      <div className="relative mx-auto max-w-5xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
        >

          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#F6C453]">
            Da Pizza Hub
          </p>

          <h1 className="font-heading text-6xl text-white">
            {title}
          </h1>

          <p className="mt-8 text-lg leading-8 text-white/60">
            {description}
          </p>

        </motion.div>

        <div className="mt-16 space-y-12">

          {sections.map((section) => (

            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >

              <h2 className="mb-5 text-3xl font-bold text-white">
                {section.heading}
              </h2>

              <div className="space-y-4">

                {section.content.map((item, index) => (

                  <p
                    key={index}
                    className="leading-8 text-white/60"
                  >
                    {item}
                  </p>

                ))}

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}