"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Lock, Mail, Github } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignIn = async () => {
    if (!email || !password) return toast.error("Veuillez remplir tous les champs");
    setLoading(true);
    try {
      await authClient.signIn.email({
        email,
        password,
      }, {
        onSuccess: () => {
            toast.success("Heureux de vous revoir !");
            router.push("/dashboard");
        },
        onError: (ctx) => {
            toast.error(ctx.error.message || "Email ou mot de passe incorrect");
            setLoading(false);
        },
      });
    } catch (e) {
      toast.error("Une erreur est survenue");
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin === "http://localhost:3000" 
          ? "/dashboard" 
          : "https://meta-convert-steel.vercel.app/dashboard"
      });
    } catch (e) {
      toast.error(`Erreur de connexion avec ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-[440px] relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 rotate-3 overflow-hidden relative">
            <Image src="/logo.svg" alt="MetaConvert" fill className="p-3" priority />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter">Bon retour !</h1>
            <p className="text-slate-400 font-medium italic">Accédez à votre écosystème intelligent.</p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-white/5 bg-white/5 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <CardContent className="p-8 sm:p-10 space-y-8">
            
            {/* Social Login */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-100 border-none font-black text-base gap-3 transition-all active:scale-95 shadow-xl"
                onClick={() => handleSocialSignIn("google")}
                disabled={!!socialLoading || loading}
              >
                {socialLoading === "google" ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continuer avec Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-500">
                <span className="bg-transparent px-4">Ou par email</span>
              </div>
            </div>

            {/* Email Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    type="email" 
                    placeholder="Adresse email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-slate-600 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-slate-600 focus:ring-primary/50"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-2xl shadow-primary/20 transition-all active:scale-95"
                onClick={handleSignIn}
                disabled={loading || !!socialLoading}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight size={20} />}
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 font-bold">
          Nouveau sur MetaConvert ?{" "}
          <Link href="/sign-up" className="text-primary hover:underline underline-offset-4">
            Créer un compte gratuit
          </Link>
        </p>
      </div>
    </div>
  );
}