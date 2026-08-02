"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";

export function ContactForm() {
  return (
    <section className="relative py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-14 lg:grid-cols-2">

          {/* Left */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
            }}
          >

            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#F6C453]">

              SEND MESSAGE

            </span>

            <h2 className="mt-5 font-heading text-5xl text-white lg:text-6xl">

              We'd Love To

              <br />

              Hear From You

            </h2>

            <p className="mt-8 max-w-lg text-lg leading-8 text-white/60">

              Whether it's feedback, catering enquiries,
              birthday celebrations or franchise opportunities,
              simply fill the form and our team will contact you shortly.

            </p>

            <div className="mt-12 space-y-6">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <h3 className="font-semibold text-white">

                  Fast Response

                </h3>

                <p className="mt-2 text-white/60">

                  Usually within 15–30 minutes.

                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <h3 className="font-semibold text-white">

                  100% Customer Support

                </h3>

                <p className="mt-2 text-white/60">

                  Friendly support for every enquiry.

                </p>

              </div>

            </div>

          </motion.div>

          {/* Right */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
            }}
            className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
          >

            <form className="space-y-6">

              <div className="grid gap-6 md:grid-cols-2">

                <input
                  type="text"
                  placeholder="Your Name"
                  className="h-14 rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="h-14 rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
                />

              </div>

              <input
                type="email"
                placeholder="Email Address"
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
              />

              <input
                type="text"
                placeholder="Subject"
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none transition focus:border-[#F6C453]"
              />

              <textarea
                rows={6}
                placeholder="Tell us how we can help..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 text-white outline-none transition focus:border-[#F6C453]"
              />

              <button
                type="submit"
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(217,31,38,.35)]"
              >

                <Send size={20} />

                Send Message

              </button>

            </form>

          </motion.div>

        </div>

      </div>

    </section>
  );
}