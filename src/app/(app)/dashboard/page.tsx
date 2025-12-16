"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, FileCheck, HardDrive, Plus, MoreHorizontal, Loader2, Image as ImageIcon, FileText, Video, Music, Globe } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DashboardStats {
    totalConversions: number;
    spaceSaved: string;
    successRate: string;
    timeSaved: string;
    recentFiles: any[];
    chartData: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
      setLoading(true);
      try {
          const res = await fetch("/api/dashboard/stats");
          if (res.ok) {
              const data = await res.json();
              setStats(data);
          } else {
              toast.error("Échec du chargement des statistiques du tableau de bord.");
          }
      } catch (e) {
          console.error(e);
          toast.error("Erreur de connexion au serveur pour les statistiques.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleNewProjectRedirect = (toolPath: string) => {
    router.push(`/dashboard/${toolPath}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Vue d'ensemble</h1>
            <p className="text-muted-foreground mt-1">Vos performances en temps réel.</p>
         </div>
         <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Plus size={18} />
                    Nouveau Projet
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle>Démarrer un nouveau projet</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {[
                        { name: "Image", icon: ImageIcon, path: "image" },
                        { name: "PDF", icon: FileText, path: "pdf" },
                        { name: "Vidéo", icon: Video, path: "video" },
                        { name: "Audio", icon: Music, path: "audio" },
                        { name: "Web", icon: Globe, path: "web" },
                    ].map((tool) => (
                        <Button
                            key={tool.name}
                            variant="outline"
                            className="flex flex-col h-28 items-center justify-center gap-2 border-border hover:border-primary/50 hover:bg-muted"
                            onClick={() => handleNewProjectRedirect(tool.path)}
                        >
                            <tool.icon size={24} className="text-primary" />
                            <span>{tool.name}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
         </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm animate-pulse h-32" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Conversions" 
                value={stats?.totalConversions || 0}
                trend="Actif" 
                icon={FileCheck} 
                color="text-blue-500 dark:text-blue-400" 
                bg="bg-blue-500/10" 
            />
            <StatCard 
                title="Espace Économisé" 
                value={stats?.spaceSaved || "0 B"}
                trend="Optimisé" 
                icon={HardDrive} 
                color="text-purple-500 dark:text-purple-400" 
                bg="bg-purple-500/10" 
            />
            <StatCard 
                title="Temps Épargné" 
                value={stats?.timeSaved || "0m"}
                trend="Estimé" 
                icon={Clock} 
                color="text-orange-500 dark:text-orange-400" 
                bg="bg-orange-500/10" 
            />
            <StatCard 
                title="Taux de Succès" 
                value={stats?.successRate || "100%"}
                trend="Stable" 
                icon={ArrowUpRight} 
                color="text-green-500 dark:text-green-400" 
                bg="bg-green-500/10" 
            />
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Activité</h3>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.chartData || []}>
                     <defs>
                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                     <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                     />
                     <Area type="monotone" dataKey="conversions" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Recent Files */}
         <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Fichiers Récents</h3>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar min-h-[200px]">
               {stats?.recentFiles && stats.recentFiles.length > 0 ? (
                   stats.recentFiles.map((file: any, i: number) => (
                      <Link href={`/dashboard/${file.fileType.toLowerCase() === 'pdf' ? 'pdf' : 'image'}`} key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group cursor-pointer border border-transparent hover:border-border">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                               {file.targetType || (file.fileType === 'unknown' ? 'BIN' : file.fileType)}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{file.fileName}</p>
                               <p className="text-xs text-muted-foreground">{(file.convertedSize / 1024).toFixed(1)} KB</p>
                            </div>
                         </div>
                         <div className="text-xs text-muted-foreground">
                            {new Date(file.createdAt).toLocaleDateString()}
                         </div>
                      </Link>
                   ))
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                       <p>Aucune conversion récente.</p>
                       <Button variant="link" asChild className="mt-2 text-primary">
                           <Link href="/dashboard/image">Convertir un fichier</Link>
                       </Button>
                   </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bg }: any) {
   return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
               <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
               {trend}
            </span>
         </div>
         <div>
            <h4 className="text-muted-foreground text-sm font-medium">{title}</h4>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
         </div>
      </div>
   )
}