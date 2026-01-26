"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Zap, 
  Layers, 
  Globe, 
  Shield, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Sparkles, 
  Clock, 
  Send,
  Cloud,
  ArrowUpRight,
  ShieldCheck,
  ZapIcon,
  MousePointer2,
  Share2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function HomePage() {
  const { data: session } = authClient.useSession();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="overflow-hidden bg-[#0A0A0B] text-white">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
        <div className="container px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 shadow-2xl"
          >
            <ZapIcon className="w-3 h-3 fill-current" />
            Vitesse de traitement record
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-white"
          >
            Maîtrisez vos <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-blue-700">fichiers.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto mb-12 font-medium italic leading-relaxed"
          >
            L'écosystème ultime pour convertir, transférer et stocker vos médias. 
            Pensé pour la performance, conçu pour la simplicité.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="rounded-2xl px-10 h-16 text-lg font-black shadow-2xl shadow-primary/20 gap-3 group transition-all hover:scale-105 active:scale-95" asChild>
              <Link href={session ? "/dashboard" : "/sign-up"}>
                {session ? "Accéder au Dashboard" : "Commencer maintenant"} 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            {!session && (
              <Link href="/sign-in" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                Se connecter
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Tools */}
      <section className="relative py-24 z-10">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-primary font-black uppercase tracking-[0.3em] text-xs">La Meta-Suite</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">Des outils pro, <br/><span className="text-slate-500">en un clic.</span></h3>
            </div>
            <p className="text-slate-400 max-w-sm font-medium">Chaque outil a été optimisé pour garantir une qualité sans compromis et une rapidité d'exécution instantanée.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Tool */}
            <BentoCard 
              className="md:col-span-8"
              icon={ImageIcon}
              title="Image Pro"
              desc="Conversion, Upscaling IA, Compression et Redimensionnement. Le tout géré en parallèle pour vos dossiers entiers."
              color="bg-blue-500"
              visual={<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />}
            />
            
            {/* PDF Tool */}
            <BentoCard 
              className="md:col-span-4"
              icon={FileText}
              title="PDF Weaver"
              desc="Fusionnez, divisez et transformez vos PDF. L'outil ultime pour vos documents."
              color="bg-emerald-500"
            />

            {/* Transfer Tool */}
            <BentoCard 
              className="md:col-span-4"
              icon={Send}
              title="MetaTransfer"
              desc="Envoyez vos fichiers volumineux jusqu'à 2Go avec des liens éphémères sécurisés."
              color="bg-purple-500"
            />

            {/* Video & Audio Tool */}
            <BentoCard 
              className="md:col-span-8"
              icon={Video}
              title="Médias HD"
              desc="Traitement vidéo et audio ultra-rapide. Conversion, extraction audio et optimisation pour le web."
              color="bg-indigo-500"
              visual={
                <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">4K</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">MP4</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">WAV</span>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* MetaTransfer Section Highlight */}
      <section className="relative py-32 z-10 bg-white/5 backdrop-blur-sm border-y border-white/5">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 rotate-3">
                <Send size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                Le transfert de fichiers, <br/>
                <span className="text-primary">réinventé.</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed italic">
                Oubliez les limitations. Glissez, déposez, envoyez. 
                Vos destinataires reçoivent un lien premium, sans publicité, prêt pour le téléchargement.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-bold text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  Liens valides jusqu'à 30 jours
                </li>
                <li className="flex items-center gap-3 font-bold text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  Protection par mot de passe incluse
                </li>
                <li className="flex items-center gap-3 font-bold text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  Statistiques de téléchargement en temps réel
                </li>
              </ul>
              <Button size="lg" className="rounded-2xl h-14 px-8 font-black gap-2" asChild>
                <Link href="/dashboard/transfer">Essayer MetaTransfer</Link>
              </Button>
            </div>
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <div className="relative rounded-[2.5rem] bg-[#0A0A0B] border border-white/10 p-8 shadow-2xl overflow-hidden group hover:border-primary/50 transition-colors duration-500">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">MetaTransfer Protocol</div>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Projet_Final.zip</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">1.2 GB • Prêt</p>
                                </div>
                            </div>
                            <Share2 size={18} className="text-slate-600" />
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className="h-full bg-primary"
                            />
                        </div>
                        <div className="flex justify-center">
                            <div className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                Copier le lien
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Integration */}
      <section className="relative py-24 z-10">
        <div className="container px-6 mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-8 border border-blue-500/20">
                    <Cloud size={40} />
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">Votre Cloud, <br/><span className="text-slate-500">votre liberté.</span></h2>
                <p className="text-slate-400 text-lg font-medium italic">
                    Chaque conversion effectuée sur MetaConvert est instantanément sauvegardée dans votre Cloud personnel. 
                    Retrouvez vos fichiers partout, tout le temps.
                </p>
                <div className="pt-8">
                    <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white hover:text-black font-black uppercase tracking-widest transition-all" asChild>
                        <Link href="/dashboard/cloud">Explorer le Cloud</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 z-10">
        <div className="container px-6 mx-auto">
            <div className="relative rounded-[4rem] bg-gradient-to-br from-primary via-blue-700 to-indigo-900 p-12 md:p-24 overflow-hidden text-center shadow-[0_40px_100px_-20px_rgba(37,99,235,0.5)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full -ml-48 -mb-48 blur-3xl" />
                
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 relative z-10 leading-none">
                    Prêt pour le <br/>futur ?
                </h2>
                <p className="text-white/80 text-xl font-medium mb-12 max-w-2xl mx-auto relative z-10 italic leading-relaxed">
                    Rejoignez les milliers de professionnels qui optimisent leur temps avec l'écosystème MetaConvert.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                    <Button size="lg" variant="secondary" className="rounded-2xl px-12 h-16 text-lg font-black shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto" asChild>
                        <Link href="/sign-up">Créer mon compte gratuit</Link>
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* Mini Footer Credits */}
      <footer className="relative py-12 z-10 border-t border-white/5 text-center text-slate-600 font-bold text-xs uppercase tracking-[0.3em]">
        © 2026 MetaConvert Ecosystem • Built for Performance
      </footer>
    </div>
  );
}

function BentoCard({ icon: Icon, title, desc, color, className, visual }: any) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={cn(
                "group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.07]",
                className
            )}
        >
            <div className="relative z-10 h-full flex flex-col">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 transition-transform duration-500 group-hover:scale-110 shadow-2xl", color)}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-6">{desc}</p>
                <div className="mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                        Lancer l'outil <ArrowUpRight size={14} />
                    </div>
                </div>
            </div>
            {visual}
        </motion.div>
    )
}
