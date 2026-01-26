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
  Share2,
  Archive,
  Download,
  Search,
  Lock,
  Scissors
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function HomePage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 z-10">
        <div className="container px-6 mx-auto">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-blue-600/10 border border-blue-600/20 text-xs font-bold uppercase tracking-[0.2em] text-blue-700 mb-4"
            >
              <ZapIcon className="w-3.5 h-3.5 fill-current" />
              L'écosystème de fichiers n°1
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-[1000] tracking-tighter leading-[0.85] text-slate-950"
            >
              Tout transformer. <br/>
              <span className="text-blue-600">Sans effort.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-600 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed"
            >
              MetaConvert réunit tous les outils dont vous avez besoin pour vos médias, 
              vos documents et vos transferts. Rapide, sécurisé et incroyablement simple.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
            >
              <Button size="lg" className="rounded-2xl px-12 h-20 text-xl font-black shadow-2xl shadow-blue-600/30 gap-3 group transition-all hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href={session ? "/dashboard" : "/sign-up"}>
                  {session ? "Accéder au Dashboard" : "Commencer gratuitement"} 
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              {!session && (
                <Link href="/sign-in" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                  Déjà membre ? Se connecter
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Tools Grid - THE META SUITE */}
      <section className="relative py-32 z-10 bg-white border-y border-slate-200">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-blue-600 font-black uppercase tracking-[0.3em] text-sm">La Meta-Suite</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950">Un outil pour chaque besoin.</h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Plus de 50 fonctionnalités réparties dans 8 modules spécialisés.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ToolCard 
              icon={ImageIcon} 
              title="Image Pro" 
              desc="Convertissez en WebP, AVIF, ou réalisez des upscales IA jusqu'à 4x sans perte."
              color="bg-blue-500"
              href="/dashboard/image"
            />
            <ToolCard 
              icon={FileText} 
              title="PDF Weaver" 
              desc="Fusionnez, divisez, compressez et convertissez vos PDF en Word ou images."
              color="bg-emerald-500"
              href="/dashboard/pdf"
            />
            <ToolCard 
              icon={Video} 
              title="Vidéo HD" 
              desc="Compressez vos vidéos pour Discord, convertissez en MP4 ou créez des GIFs."
              color="bg-indigo-500"
              href="/dashboard/video"
            />
            <ToolCard 
              icon={Music} 
              title="Audio Master" 
              desc="Extrayez l'audio des vidéos ou changez le format de vos musiques instantanément."
              color="bg-purple-500"
              href="/dashboard/audio"
            />
            <ToolCard 
              icon={Send} 
              title="MetaTransfer" 
              desc="Envoyez vos fichiers volumineux avec des liens sécurisés et éphémères."
              color="bg-pink-500"
              href="/dashboard/transfer"
            />
            <ToolCard 
              icon={Globe} 
              title="Web Capture" 
              desc="Transformez n'importe quelle page web en capture d'écran HD ou en PDF."
              color="bg-amber-500"
              href="/dashboard/web"
            />
            <ToolCard 
              icon={Archive} 
              title="Archives" 
              desc="Gérez vos fichiers ZIP et RAR directement dans votre navigateur."
              color="bg-slate-700"
              href="/dashboard/archive"
            />
            <ToolCard 
              icon={Cloud} 
              title="Cloud" 
              desc="Toutes vos conversions sont stockées et prêtes à être partagées."
              color="bg-sky-500"
              href="/dashboard/cloud"
            />
          </div>
        </div>
      </section>

      {/* Feature Focus: MetaTransfer */}
      <section className="relative py-32 z-10 overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white flex flex-col lg:flex-row items-center gap-20 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)]">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]" />
            
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-400">
                NOUVEAU
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                Envoyez gros. <br/>
                <span className="text-blue-500">Sans limites.</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed italic">
                MetaTransfer permet de partager vos fichiers en un éclair. 
                Glissez, déposez, envoyez. C'est aussi simple que ça.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FeatureItem text="Jusqu'à 2 Go par envoi" />
                <FeatureItem text="Protection par mot de passe" />
                <FeatureItem text="Validité jusqu'à 30 jours" />
                <FeatureItem text="Zipping automatique" />
              </div>
              <Button size="lg" className="rounded-2xl h-16 px-10 bg-white text-slate-900 hover:bg-slate-100 font-black text-lg gap-2 mt-4" asChild>
                <Link href="/dashboard/transfer">Essayer MetaTransfer</Link>
              </Button>
            </div>

            <div className="flex-1 w-full relative z-10">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 shadow-2xl scale-105">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                            <div className="w-3 h-3 rounded-full bg-green-500/40" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Envoi sécurisé</div>
                    </div>
                    <div className="space-y-6">
                        <div className="p-5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                                    <Archive size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-base">Projet_Architecture.zip</p>
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">842 MB • Transfert en cours</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                <span>Progression</span>
                                <span className="text-blue-400">74%</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "74%" }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics / Social Proof */}
      <section className="py-32 z-10 bg-slate-50 border-y border-slate-200">
        <div className="container px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <StatBox label="Fichiers Convertis" value="1.2M+" />
                <StatBox label="Utilisateurs Pro" value="15k+" />
                <StatBox label="Temps de Traitement" value="< 1s" />
                <StatBox label="Uptime Service" value="99.9%" />
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 z-10">
        <div className="container px-6 mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-8xl font-[1000] tracking-tighter leading-none text-slate-950">
                Libérez votre <br/>productivité.
            </h2>
            <p className="text-slate-500 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
                Rejoignez la nouvelle ère du traitement de fichiers. Gratuit, illimité et sans publicité.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button size="lg" className="rounded-2xl px-12 h-20 text-xl font-black shadow-2xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/sign-up">Créer mon compte maintenant</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 z-10 border-t border-slate-200 text-center">
        <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center border border-slate-100">
                <Image src="/logo.svg" alt="MetaConvert" width={30} height={30} />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.4em]">
                © 2026 MetaConvert • Performance First
            </p>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ icon: Icon, title, desc, color, href }: any) {
    return (
        <Link href={href}>
            <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-600/30 transition-all duration-500 h-full flex flex-col"
            >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg transition-transform duration-500 group-hover:rotate-6", color)}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-950">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-2 transition-transform">
                    Ouvrir <ArrowRight size={14} />
                </div>
            </motion.div>
        </Link>
    )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 font-bold text-slate-300">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Check size={14} strokeWidth={4} />
            </div>
            <span className="text-sm md:text-base">{text}</span>
        </div>
    )
}

function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <p className="text-4xl md:text-6xl font-[1000] text-slate-950 tracking-tighter">{value}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{label}</p>
        </div>
    )
}