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

/* Inline brand mark — an ink token with a volt conversion arrow, on-palette */
function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9h13M17 9l-4-4M17 9l-4 4"
          stroke="#C6F135"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 15H7M7 15l4-4M7 15l4 4"
          stroke="#F2EFE6"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
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
        {/* Logo */}
        <Link href="/" className="relative z-[60] flex items-center gap-2.5 group">
          <BrandMark />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            MetaConvert
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 md:flex">
          {!isPending && (
            <>
              {session ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-volt px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-ink ring-1 ring-inset ring-ink/15 transition hover:bg-volt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="font-mono text-[11px] uppercase tracking-wider text-ink-soft transition-colors hover:text-ink"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-volt px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-ink ring-1 ring-inset ring-ink/15 transition hover:bg-volt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    Commencer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="relative z-[60] -mr-2 p-2 text-ink md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile overlay */}
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
                    className="group flex items-center justify-between border-b border-line py-5 font-display text-3xl font-bold tracking-tight text-ink"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                    <ArrowUpRight className="text-ink-soft transition-colors group-hover:text-volt-deep" size={28} />
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
                      className="flex h-14 items-center justify-center rounded-full bg-volt font-mono text-sm uppercase tracking-wider text-ink ring-1 ring-inset ring-ink/15"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Aller au dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className="flex h-14 items-center justify-center rounded-full border border-ink/20 font-mono text-sm uppercase tracking-wider text-ink"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex h-14 items-center justify-center rounded-full bg-volt font-mono text-sm uppercase tracking-wider text-ink ring-1 ring-inset ring-ink/15"
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
