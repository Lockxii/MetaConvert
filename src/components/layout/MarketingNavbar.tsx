"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 group-hover:scale-110 transition-transform duration-300 relative">
            <Image src="/logo.svg" alt="MetaConvert Logo" fill className="w-full h-full" priority />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">MetaConvert</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            Fonctionnalités
          </Link>
          <Link href="/#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            À Propos
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-5">
          {!isPending && (
            <>
              {session ? (
                <Button className="rounded-full px-6 font-bold shadow-xl shadow-primary/10 transition-all hover:scale-105" asChild>
                  <Link href="/dashboard">
                    Tableau de Bord
                  </Link>
                </Button>
              ) : (
                <>
                  <Link href="/sign-in" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    Connexion
                  </Link>
                  <Button className="rounded-full px-6 font-bold shadow-xl shadow-primary/10 transition-all hover:scale-105" asChild>
                    <Link href="/sign-up">
                      Essai Gratuit
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
           <Link href="/#features" className="text-base font-semibold text-foreground" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</Link>
           <Link href="/sign-in" className="text-base font-semibold text-foreground" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
           <Button className="w-full rounded-full h-12 font-bold" asChild>
             <Link href="/sign-up">Commencer</Link>
           </Button>
        </div>
      )}
    </header>
  );
}