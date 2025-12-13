"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Zap, Layers, Globe, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-6 uppercase tracking-wide">
               <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
               Nouvelle version 2.0
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
              La plateforme de conversion <br/>
              <span className="text-blue-600">pour les équipes modernes.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Convertissez, optimisez et améliorez vos fichiers en quelques secondes. 
              Une suite d'outils puissante conçue pour la productivité et la collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button size="lg" className="rounded-lg px-8 h-12 text-base bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" asChild>
                <Link href="/sign-up">
                  Essayer Gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg px-8 h-12 text-base border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900" asChild>
                <Link href="/pricing">
                  Voir les Tarifs
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Clean Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto relative"
          >
             <div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-4">
                   <div className="w-3 h-3 rounded-full bg-slate-200" />
                   <div className="w-3 h-3 rounded-full bg-slate-200" />
                   <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="aspect-[16/9] bg-slate-50 relative flex items-center justify-center">
                    {/* Abstract Representation of the App */}
                    <div className="w-[80%] h-[80%] bg-white rounded-lg shadow-sm border border-slate-200 flex overflow-hidden">
                        <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-4 space-y-3 hidden md:block">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-8 w-full bg-blue-50 rounded border border-blue-100" />
                            <div className="h-8 w-full bg-transparent rounded" />
                            <div className="h-8 w-full bg-transparent rounded" />
                        </div>
                        <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Zap className="text-blue-500 w-10 h-10" />
                            </div>
                            <div className="h-4 w-48 bg-slate-100 rounded" />
                            <div className="h-10 w-32 bg-slate-900 rounded-md shadow-lg" />
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -bottom-6 right-12 bg-white p-4 rounded-lg shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce">
                <div className="bg-green-100 p-2 rounded-full">
                    <Check className="text-green-600 w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Conversion Réussie</p>
                    <p className="text-xs text-slate-500">rapport_financier.pdf (2.4MB)</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50" id="features">
        <div className="container px-4 mx-auto">
             <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
                <p className="text-lg text-slate-600">Une suite complète d'outils pour gérer vos assets numériques.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={Layers}
                    title="Traitement par lots"
                    desc="Convertissez des centaines de fichiers simultanément sans ralentir votre workflow."
                />
                <FeatureCard 
                    icon={Zap}
                    title="Vitesse Éclair"
                    desc="Notre infrastructure cloud dédiée garantit des temps de traitement record."
                />
                <FeatureCard 
                    icon={Shield}
                    title="Sécurité Entreprise"
                    desc="Chiffrement de bout en bout et suppression automatique des fichiers après 24h."
                />
             </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 relative bg-white border-t border-slate-100" id="pricing">
         <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Tarification Transparente</h2>
               <p className="text-slate-600">Choisissez le plan adapté à votre croissance.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               <PricingCard 
                  title="Starter" 
                  price="Gratuit" 
                  features={["5 conversions / jour", "Qualité Standard", "Support email"]} 
               />
               <PricingCard 
                  title="Pro" 
                  price="12€" 
                  period="/mois"
                  isPopular
                  features={["Illimité", "Upscaling AI 4K", "Priorité haute", "Sans publicité"]} 
               />
               <PricingCard 
                  title="Business" 
                  price="49€" 
                  period="/mois"
                  features={["API Access", "SSO & SAML", "Support dédié", "SLA Garanti"]} 
               />
            </div>
         </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                <Icon className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    )
}

function PricingCard({ title, price, period, features, isPopular }: any) {
   return (
      <div className={cn(
         "rounded-2xl p-8 border transition-all duration-300 relative flex flex-col",
         isPopular 
            ? "border-blue-200 bg-blue-50/50 shadow-xl ring-1 ring-blue-200" 
            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
      )}>
         {isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
               Populaire
            </div>
         )}
         <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
         <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-slate-900">{price}</span>
            <span className="text-slate-500 text-sm">{period}</span>
         </div>
         <ul className="space-y-4 mb-8 flex-1">
            {features.map((f: string, i: number) => (
               <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPopular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                     <Check size={12} />
                  </div>
                  {f}
               </li>
            ))}
         </ul>
         <Button className={cn("w-full rounded-lg font-medium h-10", isPopular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")}>
            Choisir ce plan
         </Button>
      </div>
   )
}
