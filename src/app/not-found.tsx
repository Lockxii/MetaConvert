"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-muted/30 rounded-3xl border border-border flex items-center justify-center mx-auto mb-8 shadow-sm backdrop-blur-sm"
        >
           <FileQuestion className="w-12 h-12 text-muted-foreground/80" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-foreground mb-4 tracking-tighter"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-6"
        >
          Page introuvable
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
        >
          Désolé, la page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20" asChild>
            <Link href="/">
              <Home className="w-4 h-4" /> Retour à l'accueil
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 bg-background/50 backdrop-blur-sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </motion.div>
      </div>
      
      <div className="absolute bottom-8 text-xs text-muted-foreground/40 font-mono">
        ERR_404_PAGE_NOT_FOUND
      </div>
    </div>
  );
}
