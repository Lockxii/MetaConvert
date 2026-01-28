import Link from "next/link";
import { Github, Twitter, Linkedin, Facebook, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MarketingFooter() {
  return (
    <footer className="bg-white text-slate-600 pt-20 pb-10 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Newsletter - Spans 4 columns on large screens */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="font-bold text-white text-lg">M</span>
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">MetaConvert</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-sm max-w-sm">
              La plateforme tout-en-un pour convertir, compresser et améliorer vos fichiers. 
              Simple, rapide et sécurisé pour les équipes modernes.
            </p>
            
            <div className="pt-2">
                <h5 className="text-sm font-semibold text-slate-900 mb-3">Restez informé</h5>
                <div className="flex gap-2 max-w-sm">
                    <Input 
                        placeholder="votre@email.com" 
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-500 text-white shrink-0">
                        <Send size={16} />
                    </Button>
                </div>
            </div>
          </div>
          
          {/* Links Sections - Spans 8 columns on large screens */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
                <h4 className="font-bold text-slate-900 mb-6">Produit</h4>
                <ul className="space-y-4 text-sm">
                <li><Link href="/#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Convertisseur</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-slate-900 mb-6">Légal</h4>
                <ul className="space-y-4 text-sm">
                <li><Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">Confidentialité</Link></li>
                <li><Link href="/legal/terms" className="hover:text-blue-600 transition-colors">CGU</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
                <ul className="space-y-4 text-sm">
                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Nous contacter</Link></li>
                <li><Link href="mailto:support@metaconvert.com" className="hover:text-blue-600 transition-colors">Support Email</Link></li>
                </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
               <p className="text-sm text-slate-400">© 2025 MetaConvert Inc. Tous droits réservés.</p>
               <div className="flex gap-6 text-sm text-slate-400">
                    <Link href="/legal/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
                    <Link href="/legal/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
                    <Link href="/sitemap" className="hover:text-slate-600 transition-colors">Sitemap</Link>
               </div>
           </div>
           
           <div className="flex gap-4">
             <SocialLink href="https://twitter.com" icon={Twitter} />
             <SocialLink href="https://github.com" icon={Github} />
           </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string, icon: any }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"
        >
            <Icon size={18} />
        </a>
    )
}