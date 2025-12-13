"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
        scrolled ? "bg-white/80 backdrop-blur-md border-slate-200 py-3" : "bg-white border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-bold text-white text-lg">M</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MetaConvert</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Fonctionnalités
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Tarifs
          </Link>
          <Link href="/api-docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            API
          </Link>
          <Link href="/support" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Support
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            Connexion
          </Link>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-5 shadow-sm transition-all" asChild>
            <Link href="/sign-up">
              Commencer
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
           <Link href="/#features" className="text-sm font-medium p-2 text-slate-700">Fonctionnalités</Link>
           <Link href="/#pricing" className="text-sm font-medium p-2 text-slate-700">Tarifs</Link>
           <Link href="/sign-in" className="text-sm font-medium p-2 text-slate-700">Connexion</Link>
           <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
             <Link href="/sign-up">Commencer</Link>
           </Button>
        </div>
      )}
    </header>
  );
}