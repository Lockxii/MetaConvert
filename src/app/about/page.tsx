import Image from "next/image";
import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">À propos de MetaConvert</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Nous simplifions la gestion des fichiers numériques pour les créateurs et les entreprises du monde entier.
        </p>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 mb-24">
         <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Notre Mission</h3>
                <p className="text-slate-600">Rendre la conversion et l'optimisation de fichiers accessibles, rapides et sécurisées pour tous.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pour Qui ?</h3>
                <p className="text-slate-600">Des freelances aux grandes entreprises, nous servons tous ceux qui ont besoin de gérer des assets numériques.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nos Valeurs</h3>
                <p className="text-slate-600">Simplicité, Confidentialité et Performance sont au cœur de tout ce que nous construisons.</p>
            </div>
         </div>
      </div>

      {/* Team/Story Section (Placeholder) */}
      <div className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Notre Histoire</h2>
            <div className="prose prose-lg prose-slate mx-auto text-slate-600">
                <p>
                    MetaConvert est né d'une frustration simple : pourquoi est-il si difficile de convertir un fichier sans être bombardé de publicités ou craindre pour ses données ?
                </p>
                <p>
                    Lancé en 2024, nous avons commencé comme un simple outil de conversion PDF. Aujourd'hui, nous traitons des milliers de fichiers chaque jour, incluant images, vidéos et audio, avec une infrastructure de pointe.
                </p>
                <p>
                    Nous sommes une petite équipe passionnée par le web et l'ingénierie, basée en France et travaillant à distance.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
