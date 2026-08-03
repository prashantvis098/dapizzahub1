"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Offers", href: "/#offers" },
  { label: "Branches", href: "/#branches" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();

  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) =>
    s.lines.reduce((sum, line) => sum + line.quantity, 0)
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-[60] px-4 lg:px-6">

      <motion.div
        initial={{
          opacity: 0,
          y: -70,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: .7,
        }}
        className="mx-auto max-w-7xl"
      >

        <div
          className={`relative flex h-20 items-center justify-between rounded-[28px] border transition-all duration-500 ${
            scrolled
              ? "border-white/15 bg-black/75 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,.55)]"
              : "border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,.35)]"
          } px-7`}
        >

          {/* Logo */}

          <Link
            href="/"
            className="group flex items-center gap-4"
          >

            <motion.div
              whileHover={{
                rotate: 10,
                scale: 1.08,
              }}
              transition={{
                duration: .3,
              }}
            >

              <Image
                src="/brand/logo.png"
                alt="Da Pizza Hub"
                width={56}
                height={56}
                priority
              />

            </motion.div>

            <div>

              <h2 className="font-heading text-[28px] leading-none text-white">

                Da Pizza Hub

              </h2>

              <p className="mt-1 text-[10px] tracking-[0.35em] text-[#F6C453]">

                PURE VEG PIZZERIA

              </p>

            </div>

          </Link>
                    {/* Desktop Navigation */}

          <nav className="hidden lg:flex items-center gap-2">

            {navLinks.map((link) => {

              const active =
                pathname === link.href ||
                (link.href !== "/" &&
                  pathname.startsWith(link.href));

              return (

                <Link
                  key={link.label}
                  href={link.href}
                  className="relative px-5 py-3 text-sm font-semibold transition-all group"
                >

                  <span
                    className={`relative z-10 transition-colors ${
                      active
                        ? "text-white"
                        : "text-white/65 group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>

                  {active && (

                    <motion.span
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00]"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />

                  )}

                </Link>

              );

            })}

          </nav>

          {/* Right Side */}

          <div className="flex items-center gap-3">

            <Link
              href="/menu"
              className="hidden lg:flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] px-6 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_35px_rgba(217,31,38,.45)]"
            >

              <ShoppingBag size={18} />

              Order Online

            </Link>

            {/* Cart */}

            <button
              onClick={openCart}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#D91F26] hover:bg-[#D91F26]"
            >

              <ShoppingBag
                size={20}
                className="text-white"
              />

              {totalItems > 0 && (

                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC107] text-xs font-bold text-black"
                >

                  {totalItems}

                </motion.span>

              )}

            </button>

            {/* Mobile */}

            <button
              onClick={() =>
                setMobileOpen(!mobileOpen)
              }
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#D91F26] hover:bg-[#D91F26] lg:hidden"
            >

              {mobileOpen ? (

                <X
                  size={22}
                  className="text-white"
                />

              ) : (

                <Menu
                  size={22}
                  className="text-white"
                />

              )}

            </button>

          </div>

        </div>

      </motion.div>
            {/* Mobile Menu */}

      <AnimatePresence>

        {mobileOpen && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 top-24 z-40 lg:hidden"
          >

            <motion.div
              initial={{
                y: -40,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -40,
                opacity: 0,
              }}
              transition={{
                duration: .35,
              }}
              className="mx-4 rounded-[28px] border border-white/10 bg-black/90 backdrop-blur-3xl p-6 shadow-[0_30px_80px_rgba(0,0,0,.6)]"
            >

              <div className="space-y-2">

                {navLinks.map((link) => (

                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 ${
                      pathname === link.href
                        ? "bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >

                    <span className="font-semibold">

                      {link.label}

                    </span>

                  </Link>

                ))}

              </div>

              <Link
                href="/menu"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-base font-bold text-white transition-all hover:scale-[1.02]"
              >

                Order Online

              </Link>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>

  );

}