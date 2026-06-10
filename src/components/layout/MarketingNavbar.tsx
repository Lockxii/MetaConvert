"use client";

import Link from "next/link";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { name: "Outils", href: "/#outils" },
  { name: "Transfert", href: "/#transfert" },
  { name: "Confidentialité", href: "/#confidentialite" },
];

/* Inline brand mark — an ink token with a cobalt conversion arrow */
function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9h13M17 9l-4-4M17 9l-4 4"
          stroke="#7C8CE8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 15H7M7 15l4-4M7 15l4 4"
          stroke="#F4EFE4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </span>
  );
}

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-paper/90 py-3 backdrop-blur-md"
          : "border-b border-transparent bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-[60] flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            MetaConvert
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {!isPending && (
            <>
              {session ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-cobalt px-5 py-2 text-sm font-medium text-paper transition hover:bg-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-cobalt px-5 py-2 text-sm font-medium text-paper transition hover:bg-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                  >
                    Commencer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button
          className="relative z-[60] -mr-2 p-2 text-ink md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-paper p-8 pt-28 md:hidden"
          >
            <div className="flex flex-col">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between border-b border-line py-5 font-display text-3xl font-semibold tracking-tight text-ink"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                    <ArrowUpRight className="text-ink-soft transition-colors group-hover:text-cobalt" size={28} />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              {!isPending && (
                <>
                  {session ? (
                    <Link
                      href="/dashboard"
                      className="flex h-14 items-center justify-center rounded-full bg-cobalt text-base font-medium text-paper"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Aller au dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className="flex h-14 items-center justify-center rounded-full border border-ink/20 text-base font-medium text-ink"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex h-14 items-center justify-center rounded-full bg-cobalt text-base font-medium text-paper"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Commencer — gratuit
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
