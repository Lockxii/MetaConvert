"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
    toast.success("Message envoyé avec succès !");
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
           <h1 className="text-4xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
           <p className="text-xl text-slate-600 max-w-2xl mx-auto">
             Une question ? Un problème ? Notre équipe est là pour vous aider.
           </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
           {/* Contact Info */}
           <div className="lg:col-span-1 space-y-8">
              <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                      <Mail size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                      <p className="text-slate-600 mb-2">Pour le support et les questions générales.</p>
                      <a href="mailto:support@metaconvert.com" className="text-blue-600 font-medium hover:underline">support@metaconvert.com</a>
                  </div>
              </div>
              
              <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                      <MessageSquare size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 mb-1">Chat en direct</h3>
                      <p className="text-slate-600 mb-2">Disponible pour les abonnés Pro & Business.</p>
                      <p className="text-sm text-slate-500">Lun-Ven, 9h-18h</p>
                  </div>
              </div>

              <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
                      <MapPin size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 mb-1">Siège Social</h3>
                      <p className="text-slate-600">
                        123 Avenue de la Tech<br/>
                        75013 Paris, France
                      </p>
                  </div>
              </div>
           </div>

           {/* Contact Form */}
           <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                 {submitted ? (
                     <div className="text-center py-12">
                         <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                             <CheckCircle size={32} />
                         </div>
                         <h3 className="text-2xl font-bold text-slate-900 mb-4">Message envoyé !</h3>
                         <p className="text-slate-600 mb-8">
                             Merci de nous avoir contactés. Nous reviendrons vers vous dans les plus brefs délais (généralement sous 24h).
                         </p>
                         <Button variant="outline" onClick={() => setSubmitted(false)}>
                             Envoyer un autre message
                         </Button>
                     </div>
                 ) : (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Nom</label>
                                <Input required placeholder="Votre nom" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Email</label>
                                <Input required type="email" placeholder="votre@email.com" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Sujet</label>
                            <Input required placeholder="Comment pouvons-nous vous aider ?" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Message</label>
                            <Textarea required placeholder="Détaillez votre demande..." className="min-h-[150px]" />
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Envoi...</> : "Envoyer le message"}
                        </Button>
                     </form>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
