"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Leaf,
  ShoppingCart,
} from "lucide-react";

import { pizzaCombos } from "@/data/pizzas";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const comboImages: Record<string, string> = {
  "veg-single-combo": "/images/combos/combo-1.webp",
  "veg-double-combo": "/images/combos/combo-2.webp",
  "veg-treat-combo-4": "/images/combos/combo-3.webp",
  "veg-delight-combo-4": "/images/combos/combo-4.webp",
  "veg-feast-combo-4": "/images/combos/combo-5.webp",
  "veg-special-combo-4": "/images/combos/combo-6.webp",
};

const comboBadge: Record<string, string> = {
  "veg-single-combo": "Student Deal",
  "veg-double-combo": "Couple Special",
  "veg-treat-combo-4": "Family Favourite",
  "veg-delight-combo-4": "Best Value",
  "veg-feast-combo-4": "Party Combo",
  "veg-special-combo-4": "Mega Feast",
};

export function Combos() {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <section className="py-28 bg-gradient-to-b from-[#111] via-bg to-[#0a0a0a]">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-end justify-between mb-16">

          <div>

            <p className="uppercase tracking-[0.35em] text-gold text-xs mb-3">

              COMBO DEALS

            </p>

            <h2 className="font-heading text-5xl lg:text-6xl">

              Meals Made Better

            </h2>

          </div>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {pizzaCombos.map((combo,index)=>(

            <motion.div

              key={combo.id}

              initial={{
                opacity:0,
                y:40
              }}

              whileInView={{
                opacity:1,
                y:0
              }}

              viewport={{
                once:true
              }}

              transition={{
                duration:.6,
                delay:index*.08
              }}

              whileHover={{
                y:-10
              }}

              className="group overflow-hidden rounded-[32px] border border-white/10 bg-[#161616]"

            >

              <div className="relative aspect-[16/11] overflow-hidden">

                <Image

                  src={comboImages[combo.id]}

                  alt={combo.name}

                  fill

                  className="object-cover transition duration-700 group-hover:scale-110"

                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/>

                <div className="absolute left-5 top-5 flex gap-2">

                  <span className="rounded-full bg-[#F6C453] px-3 py-1 text-xs font-bold text-black">

                    <Flame size={12} className="inline mr-1"/>

                    {comboBadge[combo.id]}

                  </span>

                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold">

                    <Leaf size={12} className="inline mr-1"/>

                    Pure Veg

                  </span>

                </div>

                <div className="absolute bottom-5 left-5">
                                  <h3 className="text-3xl font-heading">

                  {combo.name}

                </h3>

                <p className="mt-2 max-w-xs text-white/70">

                  Perfect combination of freshly baked pizzas,
                  garlic bread and refreshing drinks.

                </p>

              </div>

            </div>

            <div className="p-7">

              <div className="flex items-center gap-3 mb-6">

                <span className="text-4xl font-bold text-white">

                  {formatINR(combo.price)}

                </span>

                <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400">

                  SAVE 20%

                </span>

              </div>

              <div className="space-y-3 mb-8">

                <div className="flex items-center justify-between border-b border-white/10 pb-2">

                  <span className="text-white/70">

                    Premium Pizza

                  </span>

                  <span>

                    ✓

                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">

                  <span className="text-white/70">

                    Garlic Bread

                  </span>

                  <span>

                    ✓

                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-white/70">

                    Cold Drink

                  </span>

                  <span>

                    ✓

                  </span>

                </div>

              </div>

              <button

                onClick={()=>{
                  addLine({
                    itemId:combo.id,
                    name:combo.name,
                    basePrice:combo.price,
                    quantity:1,
                    unitPrice:combo.price,
                  });

                  openCart();
                }}

                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] py-4 font-semibold transition duration-300 hover:scale-[1.03]"

              >

                <ShoppingCart size={18}/>

                Order Combo

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />

              </button>

            </div>

          </motion.div>

          ))}

        </div>

      </div>

    </section>

  );

}