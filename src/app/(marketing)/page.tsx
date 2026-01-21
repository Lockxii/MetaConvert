"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, Check, Zap, Layers, Globe, Shield, 
  Image as ImageIcon, FileText, Video, Music, 
  ArrowUpRight, Sparkles, Cpu, Clock, 
  BarChart3, MoveRight, Play, Download
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-8"
            >
               <Sparkles className="w-3.5 h-3.5" />
               <span className="tracking-wide uppercase">Propulsé par l'IA de pointe</span>
               <div className="w-1 h-1 rounded-full bg-primary/40 mx-1" />
               <span className="text-primary/80">Version 2.0</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-foreground leading-[1.05]"
            >
              L'écosystème ultime de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">fichiers intelligents.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
            >
              Convertissez, compressez et sublimez vos médias avec une précision chirurgicale. 
              Géré par une infrastructure cloud ultra-rapide et sécurisée.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24 w-full sm:w-auto"
            >
              <Button size="lg" className="rounded-full px-10 h-14 text-base font-semibold shadow-xl shadow-blue-500/20 gap-2 w-full sm:w-auto" asChild>
                <Link href="/sign-up">
                  Commencer l'expérience <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base font-semibold border-border hover:bg-muted w-full sm:w-auto" asChild>
                <Link href="/pricing">
                  Explorer les plans
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-32">
             <ToolBadge icon={ImageIcon} label="Images 4K" color="text-blue-500" />
             <ToolBadge icon={Video} label="Vidéos HD" color="text-indigo-500" />
             <ToolBadge icon={Music} label="Audio Lossless" color="text-purple-500" />
             <ToolBadge icon={FileText} label="PDF Pro" color="text-emerald-500" />
             <ToolBadge icon={Globe} label="Web Capture" color="text-amber-500" className="hidden lg:flex" />
          </div>

          {/* Animated Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto relative group"
          >
             <div className="relative rounded-[2rem] p-3 bg-gradient-to-b from-border to-border/20 border border-border/50 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="rounded-[1.5rem] bg-background border border-border/50 overflow-hidden aspect-[16/10] shadow-inner flex">
                    {/* Sidebar Placeholder */}
                    <div className="w-16 md:w-60 border-r border-border bg-muted/30 p-4 space-y-4 hidden sm:block">
                        <div className="h-8 w-8 md:w-32 bg-primary/10 rounded-lg border border-primary/20" />
                        <div className="space-y-2 mt-8">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={cn("h-10 w-full rounded-md", i === 0 ? "bg-primary/5 border border-primary/10" : "bg-muted/50")} />
                            ))}
                        </div>
                    </div>
                    {/* Main Workspace Placeholder */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <div className="h-8 w-40 bg-muted rounded-lg" />
                            <div className="h-10 w-10 rounded-full bg-muted" />
                        </div>
                        <div className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 bg-muted/10 group-hover:bg-muted/20 transition-colors">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <PlusIcon className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <div className="h-4 w-48 bg-muted rounded mx-auto mb-2" />
                                <div className="h-3 w-32 bg-muted/60 rounded mx-auto" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-muted/40" />
                            ))}
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Floating Achievement Card */}
             <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-6 md:left-12 bg-card p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 z-20"
             >
                <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <Check className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Upscaling IA Terminé</p>
                    <p className="text-xs text-muted-foreground">Qualité augmentée de 400%</p>
                </div>
             </motion.div>

             {/* Speed Badge */}
             <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-10 -right-6 md:right-12 bg-card p-4 rounded-2xl shadow-2xl border border-border flex items-center gap-4 z-20"
             >
                <div className="bg-blue-500/10 p-2.5 rounded-xl">
                    <Zap className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Traitement Instantané</p>
                    <p className="text-xs text-muted-foreground">0.8s en moyenne par fichier</p>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border bg-muted/30 relative overflow-hidden">
        <div className="container px-4 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatItem label="Fichiers traités" value="1.2M+" />
                <StatItem label="Temps gagné" value="50k h" />
                <StatItem label="Pays supportés" value="180+" />
                <StatItem label="Précision IA" value="99.9%" />
            </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <section className="py-24 lg:py-32 relative" id="features">
        <div className="container px-4 mx-auto">
             <div className="max-w-3xl mb-20">
                <h2 className="text-base font-bold text-primary tracking-widest uppercase mb-4">Fonctionnalités Clés</h2>
                <h3 className="text-4xl md:text-5xl font-black text-foreground mb-6">Conçu pour dépasser vos <span className="text-muted-foreground">limites.</span></h3>
                <p className="text-lg text-muted-foreground">Nous avons repensé chaque aspect du traitement de fichiers pour offrir une expérience fluide et sans friction.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-6">
                <ModernFeatureCard 
                    icon={Cpu}
                    title="Intelligence Artificielle"
                    desc="Nos modèles de Deep Learning améliorent automatiquement la qualité de vos médias lors de la conversion."
                />
                <ModernFeatureCard 
                    icon={Layers}
                    title="Bulk Processing"
                    desc="Téléversez des dossiers entiers. Notre moteur parallèle gère la charge sans broncher."
                />
                <ModernFeatureCard 
                    icon={Shield}
                    title="Privacy First"
                    desc="Vos données sont chiffrées en AES-256. Suppression garantie et immédiate après votre session."
                />
                <ModernFeatureCard 
                    icon={BarChart3}
                    title="Analytics Avancés"
                    desc="Suivez l'optimisation de vos fichiers et visualisez l'espace disque économisé en temps réel."
                />
                <ModernFeatureCard 
                    icon={Clock}
                    title="Automatisation"
                    desc="Configurez des workflows récurrents pour vos besoins quotidiens de conversion."
                />
                <ModernFeatureCard 
                    icon={Globe}
                    title="Format Universel"
                    desc="Plus de 300 extensions supportées, des plus classiques aux plus exotiques."
                />
             </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-24 bg-slate-900 dark:bg-muted/50 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="container px-4 mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1">
                      <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6">
                          <Play className="w-3 h-3 fill-current" /> En Action
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                          Convertissez tout, <br/>
                          <span className="text-blue-400">partout, instantanément.</span>
                      </h2>
                      <div className="space-y-6">
                          <CheckItem text="Optimisation automatique pour le Web (WebP, AVIF)" />
                          <CheckItem text="Extraction de sous-titres et pistes audio" />
                          <CheckItem text="Compression sans perte de qualité visuelle" />
                          <CheckItem text="Intégration API pour les développeurs" />
                      </div>
                      <Button className="mt-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" asChild>
                          <Link href="/dashboard">Lancer le tableau de bord</Link>
                      </Button>
                  </div>
                  <div className="flex-1 relative">
                      <div className="aspect-square bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center p-8 border border-white/10 relative">
                          <div className="absolute inset-0 border border-white/5 rounded-full animate-ping [animation-duration:3s]" />
                          <div className="bg-slate-800 rounded-3xl p-6 border border-white/10 shadow-2xl relative z-10 w-full">
                              <div className="flex items-center justify-between mb-8">
                                  <div className="flex gap-2">
                                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                  </div>
                                  <div className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Process Engine v2</div>
                              </div>
                              <div className="space-y-4">
                                  <ProcessBar label="Video_Cinematic.mp4" progress={85} />
                                  <ProcessBar label="Project_Manifesto.pdf" progress={100} />
                                  <ProcessBar label="Asset_34.png" progress={42} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 relative">
          <div className="container px-4 mx-auto text-center">
              <div className="max-w-4xl mx-auto bg-gradient-to-b from-primary to-primary/80 rounded-[3rem] p-12 md:p-20 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
                  
                  <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Prêt à transformer vos fichiers ?</h2>
                  <p className="text-primary-foreground/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
                      Rejoignez plus de 10,000 professionnels qui font confiance à MetaConvert pour leur workflow quotidien.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                      <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 text-base font-bold shadow-xl shadow-black/10 w-full sm:w-auto" asChild>
                          <Link href="/sign-up">Essayer Gratuitement</Link>
                      </Button>
                      <Button size="lg" className="rounded-full px-10 h-14 text-base font-bold bg-white/10 border border-white/20 hover:bg-white/20 w-full sm:w-auto" asChild>
                          <Link href="/contact">Contacter Sales</Link>
                      </Button>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}

function ToolBadge({ icon: Icon, label, color, className }: any) {
    return (
        <div className={cn("flex flex-col items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 transition-all hover:bg-card cursor-default group", className)}>
            <div className={cn("p-2 rounded-xl bg-background border border-border group-hover:scale-110 transition-transform", color)}>
                <Icon size={24} />
            </div>
            <span className="text-xs font-semibold text-foreground/70">{label}</span>
        </div>
    )
}

function ModernFeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="group bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    )
}

function StatItem({ label, value }: any) {
    return (
        <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-foreground mb-2">{value}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{label}</div>
        </div>
    )
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-white/80 font-medium">{text}</p>
        </div>
    )
}

function ProcessBar({ label, progress }: { label: string, progress: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-white/70">{label}</span>
                <span className="text-blue-400">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-blue-500"
                />
            </div>
        </div>
    )
}

function PlusIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}