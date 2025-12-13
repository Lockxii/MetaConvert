"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
         <div className="container px-4 mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
               <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Tarifs simples et transparents</h1>
               <p className="text-xl text-slate-600">Choisissez le plan adapté à vos besoins. Commencez gratuitement, évoluez selon votre rythme.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               <PricingCard 
                  title="Starter" 
                  price="Gratuit" 
                  features={["5 conversions / jour", "Qualité Standard", "Support email", "Stockage 24h"]} 
                  cta="Commencer Gratuitement"
                  href="/sign-up"
               />
               <PricingCard 
                  title="Pro" 
                  price="12€" 
                  period="/mois"
                  isPopular
                  features={["Illimité", "Upscaling AI 4K", "Priorité haute", "Sans publicité", "Stockage 7 jours"]} 
                  cta="Passer Pro"
                  href="/sign-up?plan=pro"
               />
               <PricingCard 
                  title="Business" 
                  price="49€" 
                  period="/mois"
                  features={["API Access", "SSO & SAML", "Support dédié", "SLA Garanti", "Stockage 30 jours", "Equipe illimitée"]} 
                  cta="Contacter les ventes"
                  href="mailto:sales@metaconvert.com"
               />
            </div>

            <div className="mt-20 text-center">
                <p className="text-slate-500">Vous avez des questions ? <Link href="/contact" className="text-blue-600 hover:underline">Contactez-nous</Link></p>
            </div>
         </div>
    </div>
  );
}

function PricingCard({ title, price, period, features, isPopular, cta, href }: any) {
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
         <Button className={cn("w-full rounded-lg font-medium h-10", isPopular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")} asChild>
            <Link href={href || "/sign-up"}>
                {cta || "Choisir ce plan"}
            </Link>
         </Button>
      </div>
   )
}
