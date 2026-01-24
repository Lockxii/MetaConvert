"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Download, 
    Lock, 
    FileText, 
    AlertCircle, 
    Clock, 
    Loader2, 
    ShieldCheck, 
    ExternalLink,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import Image from "next/image";

export default function SharePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setLinkInfo(data);
      })
      .catch(() => setError("Erreur lors de la récupération du lien"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/share/${id}`, {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (res.ok) {
        setDownloadStarted(true);
        const a = document.createElement("a");
        a.href = `${data.downloadUrl}?download=true&t=${new Date().getTime()}`;
        a.download = linkInfo.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Téléchargement lancé !");
        
        setTimeout(() => setDownloadStarted(false), 5000);
      } else {
        toast.error(data.error || "Accès refusé");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background blobs for style */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
        <p className="mt-4 text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse relative z-10">Préparation du lien...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        
        <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mb-8 shadow-2xl shadow-red-500/5 border border-red-500/20">
            <AlertCircle size={48} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-white">Lien Indisponible</h1>
        <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed font-medium">
            Ce lien de transfert a expiré ou a été supprimé par l'expéditeur. 
            MetaConvert garantit des transferts éphémères pour votre sécurité.
        </p>
        <Button className="h-14 px-10 rounded-2xl text-lg font-black gap-2 shadow-xl" asChild>
            <a href="/">Retourner sur MetaConvert</a>
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />

        {/* Logo/Brand Header */}
        <div className="mb-12 flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 mb-4 overflow-hidden relative">
                <Image src="/logo.svg" alt="MetaConvert" fill className="p-3" priority />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tighter">MetaConvert <span className="text-primary">Transfer</span></h2>
        </div>

        <Card className="w-full max-w-lg rounded-[3rem] border-white/5 bg-white/5 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <CardContent className="p-10 sm:p-14 space-y-10">
                {/* File Info Section */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-[-2deg]">
                        <FileText size={48} strokeWidth={2.5} />
                    </div>
                    
                    <div className="space-y-2 w-full">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
                            {linkInfo.fileName}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-slate-400">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                <Clock size={14} className="text-primary" />
                                <span>Expire le {new Date(linkInfo.expiresAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Protection */}
                {linkInfo.hasPassword && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                            <Lock size={12} className="text-amber-500" /> Transfert Protégé
                        </label>
                        <Input 
                            type="password" 
                            placeholder="Entrez le mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-16 rounded-2xl bg-white/5 border-white/10 text-white text-lg font-bold placeholder:text-slate-600 focus:ring-primary/50 transition-all"
                        />
                    </div>
                )}

                {/* Action Button */}
                <div className="space-y-4">
                    <Button 
                        className={cn(
                            "w-full h-20 rounded-[2rem] text-xl font-black gap-3 transition-all duration-500 shadow-2xl shadow-primary/20",
                            downloadStarted ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                        onClick={handleDownload}
                        disabled={verifying || (linkInfo.hasPassword && !password)}
                    >
                        {verifying ? (
                            <Loader2 className="animate-spin w-8 h-8" />
                        ) : downloadStarted ? (
                            <>
                                <CheckCircle2 size={28} strokeWidth={3} />
                                Lancé !
                            </>
                        ) : (
                            <>
                                <Download size={28} strokeWidth={2.5} />
                                Télécharger
                            </>
                        )}
                    </Button>
                    
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center justify-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> Sécurisé de bout en bout
                    </p>
                </div>

                {/* Upsell / Footer */}
                <div className="pt-6 border-t border-white/5">
                    <a 
                        href="/" 
                        className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">En savoir plus</span>
                            <span className="text-sm font-bold text-white">Convertissez vos fichiers avec MetaConvert</span>
                        </div>
                        <ArrowRight size={20} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </a>
                </div>
            </CardContent>
        </Card>

        {/* Footer Credit */}
        <p className="mt-12 text-slate-600 font-bold text-sm flex items-center gap-2 relative z-10">
            Propulsé par <span className="text-slate-400">MetaConvert Cloud</span>
            <ExternalLink size={14} />
        </p>
    </div>
  );
}