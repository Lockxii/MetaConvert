"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, Check, Zap, Layers, Globe, Shield, 
  Image as ImageIcon, FileText, Video, Music, 
  Send, Cloud, ArrowUpRight, ShieldCheck, 
  ZapIcon, Share2, Archive, Download, 
  Search, Lock, Scissors, ChevronRight,
  Clock, HardDrive, Cpu, Smartphone, Zap as FastIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function HomePage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Hero Section - Refined */}
      <section className="relative pt-12 pb-16 lg:pt-40 lg:pb-32 border-b border-slate-50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="flex-1 space-y-10 text-center lg:text-left">
              
              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-[1000] tracking-tighter leading-[0.9] text-slate-950"
                >
                  Maîtrisez vos <br/>
                  <span className="text-blue-600">fichiers.</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed italic"
                >
                  L'écosystème complet pour convertir, transférer et stocker vos médias en un éclair.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2"
              >
                <Button size="lg" className="rounded-2xl px-10 h-16 text-sm font-black uppercase tracking-widest gap-2 shadow-xl shadow-blue-600/20 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href={session ? "/dashboard" : "/sign-up"}>
                    {session ? "Tableau de Bord" : "Essai Gratuit"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                            <img 
                                src={`https://i.pravatar.cc/100?u=${i+20}`} 
                                alt="User" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">+15k membres</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilisateurs pro</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Visual on the right */}
            <div className="flex-1 w-full relative hidden lg:block">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-4 overflow-hidden">
                        <div className="bg-slate-50 rounded-[2.2rem] aspect-[4/3] overflow-hidden flex items-center justify-center relative group">
                            <Image 
                                src="/logo.svg" 
                                alt="MetaConvert App" 
                                width={120} 
                                height={120}
                                className="opacity-20 group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Floating UI Elements */}
                            <div className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce [animation-duration:4s]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                        <ImageIcon size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-2 w-16 bg-slate-100 rounded" />
                                        <div className="h-1.5 w-10 bg-slate-50 rounded" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-12 right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce [animation-duration:5s] [animation-delay:1s]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                        <Check size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400">Terminé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] -z-10" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] -z-10" />
                </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Step Section */}
      <section className="py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <StepItem 
                    num="01" 
                    title="Déposez vos fichiers" 
                    desc="Images, PDF, Vidéos... Glissez-les dans l'interface ultra-rapide." 
                />
                <StepItem 
                    num="02" 
                    title="Traitement IA" 
                    desc="Nos moteurs optimisent chaque octet pour un rendu parfait." 
                />
                <StepItem 
                    num="03" 
                    title="Stockez & Partagez" 
                    desc="Téléchargez ou envoyez un lien sécurisé MetaTransfer." 
                />
            </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="py-24 lg:py-32 bg-white">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">La Meta-Suite</h2>
              <h3 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">Des outils chirurgicaux.</h3>
            </div>
            <p className="text-slate-400 max-w-sm text-sm font-medium">Tout ce dont vous avez besoin pour vos assets numériques, en un seul endroit.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ToolBox icon={ImageIcon} title="Image Pro" stats="Conv, Upscale, Crop" color="blue" href="/dashboard/image" />
            <ToolBox icon={FileText} title="PDF Weaver" stats="Merge, Split, Conv" color="emerald" href="/dashboard/pdf" />
            <ToolBox icon={Video} title="Vidéo HD" stats="Compress, Conv, GIF" color="indigo" href="/dashboard/video" />
            <ToolBox icon={Music} title="Audio Master" stats="Extract, Trim, Conv" color="purple" href="/dashboard/audio" />
            <ToolBox icon={Send} title="MetaTransfer" stats="2GB, Pass, Secure" color="pink" href="/dashboard/transfer" />
            <ToolBox icon={Globe} title="Web Capture" stats="URL to PDF/PNG" color="amber" href="/dashboard/web" />
            <ToolBox icon={Archive} title="Archives" stats="ZIP, RAR, 7Z" color="slate" href="/dashboard/archive" />
            <ToolBox icon={Cloud} title="Cloud" stats="Sync, Share, Store" color="sky" href="/dashboard/cloud" />
          </div>
        </div>
      </section>

      {/* MetaTransfer Section - Specialized */}
      <section id="transfer" className="py-24 bg-white text-slate-900 overflow-hidden relative border-y border-slate-50">
        <div className="absolute inset-0 bg-blue-50/30 opacity-50 pointer-events-none" />
        <div className="container px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <Send size={24} strokeWidth={3} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-slate-950">
                  Transférez vos fichiers <br/>
                  <span className="text-blue-600">avec style.</span>
                </h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
                  Plus qu'un simple upload. Offrez à vos clients et collaborateurs une expérience 
                  de réception premium, rapide et sécurisée.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-10">
                <FeatureSmall icon={ShieldCheck} title="Sécurité" desc="Chiffrement AES-256" dark={false} />
                <FeatureSmall icon={Clock} title="Éphémère" desc="Jusqu'à 30 jours" dark={false} />
                <FeatureSmall icon={FastIcon} title="Vitesse" desc="Upload multi-flux" dark={false} />
                <FeatureSmall icon={Lock} title="Confidentialité" desc="Mot de passe inclus" dark={false} />
              </div>

              <Button size="lg" className="rounded-xl h-14 px-8 bg-slate-950 text-white hover:bg-slate-800 font-black uppercase text-xs tracking-widest mt-4" asChild>
                <Link href="/dashboard/transfer">Ouvrir MetaTransfer</Link>
              </Button>
            </div>

            <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl relative z-10">
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol MC-Transfer</span>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate text-slate-950">Projet_Architecture_Final.zip</p>
                                    <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">1.4 GB • En cours</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Envoi...</span>
                                <span className="text-blue-600">89%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div initial={{width: 0}} whileInView={{width: '89%'}} transition={{duration: 2}} className="h-full bg-blue-500 rounded-full" />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-center">
                            <div className="px-6 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                mc-transfer.com/share/x7k29...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Stats */}
      <section id="security" className="py-24 bg-white border-b border-slate-100">
        <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-950">
                        Votre vie privée <br/><span className="text-blue-600">n'est pas une option.</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
                        MetaConvert a été conçu avec une architecture "Zero-Knowledge". 
                        Vos fichiers sont traités puis supprimés. Aucun log, aucune trace.
                    </p>
                    <div className="space-y-4">
                        <CheckItem text="Traitement côté serveur sécurisé & éphémère" />
                        <CheckItem text="Chiffrement des transferts en transit" />
                        <CheckItem text="Aucun stockage permanent sans votre accord" />
                        <CheckItem text="Conforme aux standards RGPD Européens" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatInfo icon={Cpu} value="1.2M+" label="Fichiers traités" />
                    <StatInfo icon={HardDrive} value="500TB" label="Données transitées" />
                    <StatInfo icon={Smartphone} value="100%" label="Responsive UI" />
                    <StatInfo icon={Shield} value="AES-256" label="Encryption" />
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA - Refined */}
      <section className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="container px-6 mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950">Prêt à transformer votre workflow ?</h2>
                <p className="text-slate-500 text-lg font-medium">Rejoignez les professionnels qui ne perdent plus de temps avec leurs fichiers.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="rounded-xl px-10 h-16 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 bg-blue-600 text-white w-full sm:w-auto" asChild>
                        <Link href="/sign-up">Créer un compte gratuit</Link>
                    </Button>
                    <Link href="#tools" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all underline underline-offset-8">Voir tous les outils</Link>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

function ToolBox({ icon: Icon, title, stats, color, href }: any) {
    const colors: any = {
        blue: "bg-blue-500",
        emerald: "bg-emerald-500",
        indigo: "bg-indigo-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        amber: "bg-amber-500",
        slate: "bg-slate-700",
        sky: "bg-sky-500"
    };
    return (
        <Link href={href}>
            <div className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-600/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 h-full flex flex-col">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-6 transition-transform duration-500 group-hover:scale-110", colors[color])}>
                    <Icon size={20} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-black mb-1 tracking-tight text-slate-950">{title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{stats}</p>
                <div className="mt-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                    Ouvrir l'outil <ChevronRight size={12} />
                </div>
            </div>
        </Link>
    )
}

function StepItem({ num, title, desc }: any) {
    return (
        <div className="space-y-4">
            <span className="text-4xl font-black text-blue-600/20">{num}</span>
            <h4 className="text-xl font-black text-slate-950 tracking-tight">{title}</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    )
}

function FeatureSmall({ icon: Icon, title, desc, dark = true }: any) {
    return (
        <div className="flex gap-4">
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 shrink-0 border",
                dark ? "bg-white/5 border-white/5" : "bg-blue-50 border-blue-100"
            )}>
                <Icon size={16} />
            </div>
            <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-white" : "text-slate-900")}>{title}</p>
                <p className={cn("text-[10px] font-bold", dark ? "text-slate-500" : "text-slate-400")}>{desc}</p>
            </div>
        </div>
    )
}

function StatInfo({ icon: Icon, value, label }: any) {
    return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2">
            <Icon size={20} className="text-blue-600 mb-2" />
            <p className="text-2xl font-[1000] text-slate-950 tracking-tighter">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        </div>
    )
}

function FooterCol({ title, links }: any) {
    return (
        <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">{title}</h4>
            <ul className="space-y-4">
                {links.map((link: any, idx: number) => (
                    <li key={idx}>
                        <Link href={link.h} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">{link.l}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 font-bold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <Check size={12} strokeWidth={4} />
            </div>
            <span className="text-sm">{text}</span>
        </div>
    )
}
