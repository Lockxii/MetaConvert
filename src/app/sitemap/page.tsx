import Link from "next/link";
import { FileText, Layers, Shield, HelpCircle, Briefcase } from "lucide-react";

export default function SitemapPage() {
  const sections = [
    {
      title: "Produit",
      icon: Layers,
      links: [
        { label: "Accueil", href: "/" },
        { label: "Fonctionnalités", href: "/#features" },
        { label: "Tarifs", href: "/pricing" },
        { label: "Convertisseur (Dashboard)", href: "/dashboard" },
        { label: "Nouveautés", href: "/changelog" },
      ]
    },
    {
      title: "Ressources",
      icon: HelpCircle,
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Blog", href: "/blog" },
        { label: "Centre d'aide", href: "/help" },
        { label: "Statut", href: "/status" },
      ]
    },
    {
      title: "Légal",
      icon: Shield,
      links: [
        { label: "Confidentialité", href: "/legal/privacy" },
        { label: "Conditions d'utilisation (CGU)", href: "/legal/terms" },
        { label: "Cookies", href: "/legal/cookies" },
      ]
    },
    {
      title: "Entreprise",
      icon: Briefcase,
      links: [
        { label: "À propos", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Carrières", href: "/careers" },
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Plan du site</h1>
            <p className="text-slate-600">Explorez toutes les pages de MetaConvert.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-600 mb-4">
                        <section.icon size={20} />
                        <h2 className="font-bold text-lg text-slate-900">{section.title}</h2>
                    </div>
                    <ul className="space-y-3">
                        {section.links.map((link, i) => (
                            <li key={i}>
                                <Link href={link.href} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
