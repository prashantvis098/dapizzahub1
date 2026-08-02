"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, MapPin, ExternalLink, Navigation, Loader2, CheckCircle2 } from "lucide-react";
import { Reveal, StaggerContainer, staggerItem } from "@/components/ui/Reveal";
import { branches, brand } from "@/data/branches";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { requestUserLocation, rankBranchesByDistance, BranchWithDistance } from "@/lib/geolocation";
import { Branch } from "@/types";

const branchImages = [
  "/images/pizza-generic/pizza-13.webp",
  "/images/pizza-generic/pizza-14.webp",
  "/images/pizza-generic/pizza-15.webp",
  "/images/pizza-generic/pizza-16.webp",
];

// Small inline glyphs for Swiggy/Zomato — kept as simple monograms rather
// than importing brand logo assets (avoids licensing/trademark-asset use).
function SwiggyBadge() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FC8019] text-white text-[10px] font-bold shrink-0">
      S
    </span>
  );
}
function ZomatoBadge() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#E23744] text-white text-[10px] font-bold shrink-0">
      Z
    </span>
  );
}

export function Branches() {
  const [locState, setLocState] = useState<"idle" | "loading" | "done" | "denied" | "unsupported" | "error">("idle");
  const [ranked, setRanked] = useState<BranchWithDistance[] | null>(null);

  async function handleFindNearest() {
    setLocState("loading");
    const result = await requestUserLocation();
    if (result.status === "success") {
      setRanked(rankBranchesByDistance(result.lat, result.lng));
      setLocState("done");
    } else {
      setLocState(result.status === "denied" ? "denied" : result.status === "unsupported" ? "unsupported" : "error");
    }
  }

  const displayBranches: (Branch | BranchWithDistance)[] = ranked ?? branches;

  return (
    <section id="branches" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Find Us
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Our Branches</h2>
            </div>

            <button
              onClick={handleFindNearest}
              disabled={locState === "loading"}
              className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-bg text-sm font-semibold hover:bg-gold-dim disabled:opacity-70 transition-all duration-300 active:scale-95 shrink-0 w-fit"
            >
              {locState === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Locating you...
                </>
              ) : locState === "done" ? (
                <>
                  <CheckCircle2 size={16} /> Sorted by distance
                </>
              ) : (
                <>
                  <Navigation size={16} /> Find My Nearest Branch
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {locState === "denied" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Location access was denied — showing all branches below. You can enable location permission in your browser settings to see distances.
              </motion.p>
            )}
            {locState === "unsupported" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Your browser doesn&apos;t support location detection — showing all branches below.
              </motion.p>
            )}
            {locState === "error" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-ink-muted bg-card rounded-xl px-4 py-3 mb-8"
              >
                Couldn&apos;t detect your location right now — showing all branches below.
              </motion.p>
            )}
            {locState === "done" && ranked && !ranked.some((b) => b.withinRadius) && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-gold bg-gold/10 rounded-xl px-4 py-3 mb-8"
              >
                None of our branches are within {brand.nearestBranchSearchRadiusKm} KM of your location yet — here&apos;s your nearest one anyway.
              </motion.p>
            )}
          </AnimatePresence>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayBranches.map((branch, i) => {
            const withDistance = "distanceKm" in branch ? branch : null;
            return (
              <motion.div
                key={branch.id}
                layout
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-gold/20 transition-colors duration-500"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={branchImages[i % branchImages.length]}
                    alt={branch.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <h3 className="absolute bottom-4 left-5 font-display text-xl font-semibold text-white">
                    {branch.name}
                  </h3>
                  {withDistance && (
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                        withDistance.withinRadius
                          ? "bg-gold/90 text-bg"
                          : "bg-black/50 text-white/80"
                      }`}
                    >
                      {withDistance.distanceKm < 1
                        ? "< 1 KM away"
                        : `${withDistance.distanceKm.toFixed(1)} KM away`}
                    </span>
                  )}
                  {i === 0 && !withDistance && (
                    <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold/90 text-bg">
                      On Swiggy & Zomato
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm text-ink-secondary mb-5 flex gap-2">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-ink-muted" />
                    {branch.address}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <a
                      href={`tel:${branch.phone}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                    >
                      <Phone size={15} /> Call
                    </a>
                    <a
                      href={buildWhatsAppOrderLink(branch.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-medium transition-colors duration-300"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </div>

                  {(branch.swiggyUrl || branch.zomatoUrl) && (
                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                      {branch.swiggyUrl && (
                        <a
                          href={branch.swiggyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                        >
                          <SwiggyBadge /> Swiggy
                        </a>
                      )}
                      {branch.zomatoUrl && (
                        <a
                          href={branch.zomatoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors duration-300"
                        >
                          <ZomatoBadge /> Zomato
                        </a>
                      )}
                    </div>
                  )}

                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors duration-300"
                  >
                    <ExternalLink size={14} /> Get Directions
                  </a>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}