"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function FloatingWhatsApp() {

  const [hovered, setHovered] = useState(false);

  return (

    <motion.div

      initial={{
        opacity:0,
        y:40,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        delay:1.2,
        duration:.6,
      }}

      // On mobile, the MobileOrderBar (fixed, full-width) sits at
      // bottom-4 whenever the cart has items — without lifting this button
      // above it, they overlap. bottom-24 clears the order bar's height;
      // lg:bottom-6 restores the original position on desktop where the
      // order bar never renders.
      //
      // z-index note: this must stay BELOW the cart drawer (z-150) and
      // customize modal (z-160) so those overlays are always clickable
      // and never get blocked by this floating button.
      className="fixed bottom-24 left-4 sm:left-6 lg:bottom-6 z-[40]"
    >

      <motion.div

        animate={{
          scale:[1,1.08,1],
        }}

        transition={{
          duration:2,
          repeat:Infinity,
        }}

        className="absolute inset-0 rounded-full bg-[#25D366]/30 blur-xl"
      />

      <Link

        href="https://wa.me/918081871440"

        target="_blank"

        onMouseEnter={() => setHovered(true)}

        onMouseLeave={() => setHovered(false)}

        className="relative flex h-14 sm:h-16 items-center overflow-hidden rounded-full bg-[#25D366] shadow-[0_15px_40px_rgba(37,211,102,.45)]"
      >
                {/* Online Indicator */}

        <span className="absolute right-2 top-2 flex h-3.5 w-3.5">

          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />

          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#25D366] bg-white" />

        </span>

        {/* WhatsApp Icon */}

        <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center">

          <MessageCircle
            size={26}
            className="text-white sm:hidden"
          />
          <MessageCircle
            size={30}
            className="hidden text-white sm:block"
          />

        </div>

        {/* Expand Text — desktop hover-expand only; skip on touch devices
            where there's no hover state to trigger it anyway */}

        <motion.div

          animate={{
            width: hovered ? 190 : 0,
            opacity: hovered ? 1 : 0,
          }}

          transition={{
            duration: .35,
            ease: [0.16,1,0.3,1],
          }}

          className="hidden overflow-hidden whitespace-nowrap sm:block"

        >

          <div className="pr-7">

            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">

              ORDER NOW

            </p>

            <h4 className="text-lg font-bold text-white">

              Chat on WhatsApp

            </h4>

          </div>

        </motion.div>

      </Link>

    </motion.div>

  );

}