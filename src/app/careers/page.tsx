import { ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
           <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">Rejoignez-nous</span>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Construisons le futur de la gestion de fichiers</h1>
           <p className="text-xl text-slate-600">
             Nous sommes toujours à la recherche de talents passionnés pour rejoindre notre équipe.
           </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Postes ouverts</h2>
            
            {/* Job Offer 1 */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Senior Full Stack Engineer</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> Engineering</span>
                        <span>•</span>
                        <span>Remote (Europe)</span>
                        <span>•</span>
                        <span>CDI</span>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href="mailto:jobs@metaconvert.com?subject=Senior Full Stack Engineer">
                        Postuler <ArrowRight size={16} className="ml-2"/>
                    </Link>
                </Button>
            </div>

            {/* Job Offer 2 */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Product Designer</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> Design</span>
                        <span>•</span>
                        <span>Remote</span>
                        <span>•</span>
                        <span>Freelance / CDI</span>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href="mailto:jobs@metaconvert.com?subject=Product Designer">
                        Postuler <ArrowRight size={16} className="ml-2"/>
                    </Link>
                </Button>
            </div>

            {/* No open positions fallback (commented out for now as we show examples) */}
            {/* 
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-600">Aucun autre poste ouvert pour le moment.</p>
                <p className="text-sm text-slate-500 mt-2">Candidature spontanée ? <a href="mailto:jobs@metaconvert.com" className="text-blue-600 hover:underline">Envoyez-nous votre CV</a></p>
            </div> 
            */}
        </div>
      </div>
    </div>
  );
}
