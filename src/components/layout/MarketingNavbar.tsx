"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const navLinks = [
    { name: "Outils", href: "/#tools" },
    { name: "Transfert", href: "/#transfer" },
    { name: "Sécurité", href: "/#security" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-[60]">
          <div className="h-9 w-9 group-hover:rotate-6 transition-transform duration-500 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100 p-1.5">
            <Image src="/logo.svg" alt="MetaConvert" width={24} height={24} priority />
          </div>
          <span className="font-[1000] text-xl tracking-tighter text-slate-950 uppercase">MetaConvert</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          {!isPending && (
            <>
              {session ? (
                <Button size="sm" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20 bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Link href="/sign-in" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors">
                    Connexion
                  </Link>
                  <Button size="sm" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20 bg-slate-950 text-white hover:bg-slate-800 transition-all hover:scale-105" asChild>
                    <Link href="/sign-up">Essai Gratuit</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden relative z-[60] p-2 -mr-2 text-slate-950" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 bg-white md:hidden flex flex-col p-8 pt-32"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-4xl font-black tracking-tighter text-slate-950 flex items-center justify-between group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                    <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" size={32} />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              {!isPending && (
                <>
                  {session ? (
                    <Button className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest bg-blue-600 text-white" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/dashboard">Aller au Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest border-slate-200" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/sign-in">Connexion</Link>
                      </Button>
                      <Button className="w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest bg-slate-950 text-white shadow-2xl shadow-slate-950/20" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/sign-up">Commencer gratuitement</Link>
                      </Button>
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
