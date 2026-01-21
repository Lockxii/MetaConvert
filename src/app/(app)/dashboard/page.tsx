"use client";

import { useEffect, useState } from "react";
import { 
    ArrowUpRight, 
    Clock, 
    FileCheck, 
    HardDrive, 
    Plus, 
    Loader2, 
    Image as ImageIcon, 
    FileText, 
    Video, 
    Music, 
    Globe,
    Zap,
    Trophy,
    TrendingUp,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
      try {
          const res = await fetch("/api/dashboard/stats");
          if (res.ok) {
              const data = await res.json();
              setStats(data);
          }
      } catch (e) {
          console.error(e);
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
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Bonjour, Arthur 👋</h1>
            <p className="text-muted-foreground font-medium italic">Voici l'activité de vos outils MetaConvert.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-border bg-card shadow-sm h-11 hidden sm:flex" asChild>
                <Link href="/dashboard/cloud">Accéder au Cloud</Link>
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 font-bold">
                        <Plus size={20} strokeWidth={3} />
                        Nouveau Projet
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-card-foreground border-border max-w-xl p-8 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black mb-6">Que voulez-vous créer ?</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { name: "Image", icon: ImageIcon, path: "image", color: "text-blue-500", bg: "bg-blue-500/10" },
                            { name: "PDF", icon: FileText, path: "pdf", color: "text-red-500", bg: "bg-red-500/10" },
                            { name: "Vidéo", icon: Video, path: "video", color: "text-purple-500", bg: "bg-purple-500/10" },
                            { name: "Audio", icon: Music, path: "audio", color: "text-pink-500", bg: "bg-pink-500/10" },
                            { name: "Web", icon: Globe, path: "web", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        ].map((tool) => (
                            <button
                                key={tool.name}
                                className="group flex flex-col h-32 items-center justify-center gap-3 border border-border rounded-2xl bg-card hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={() => handleNewProjectRedirect(tool.path)}
                            >
                                <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", tool.bg)}>
                                    <tool.icon size={24} className={tool.color} />
                                </div>
                                <span className="font-bold text-sm">{tool.name}</span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Fichiers traités" 
              value={stats?.totalConversions || 0}
              trend="+12% cette semaine" 
              icon={Zap} 
              color="text-yellow-500" 
              bg="bg-yellow-500/10" 
              loading={loading}
          />
          <StatCard 
              title="Espace économisé" 
              value={stats?.spaceSaved || "0 B"}
              trend="Stockage optimisé" 
              icon={HardDrive} 
              color="text-blue-500" 
              bg="bg-blue-500/10" 
              loading={loading}
          />
          <StatCard 
              title="Productivité" 
              value={stats?.timeSaved || "0h"}
              trend="Temps manuel gagné" 
              icon={Clock} 
              color="text-emerald-500" 
              bg="bg-emerald-500/10" 
              loading={loading}
          />
          <StatCard 
              title="Taux de succès" 
              value={stats?.successRate || "100%"}
              trend="Opérations fluides" 
              icon={Trophy} 
              color="text-purple-500" 
              bg="bg-purple-500/10" 
              loading={loading}
          />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Activity Chart */}
         <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Flux d'Activité</h3>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">7 derniers jours</div>
            </div>
            <div className="h-[350px] w-full pr-4">
               {loading ? (
                   <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
               ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chartData || []}>
                        <defs>
                            <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={15} 
                            fontWeight="bold"
                        />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                            fontWeight="bold"
                        />
                        <Tooltip 
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: '16px', 
                                padding: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                            }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="conversions" 
                            name="Conversions"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorConv)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Recent History */}
         <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-foreground">Historique</h3>
                <Link href="/dashboard/cloud" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                    Tout voir <ChevronRight size={14} />
                </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
               {loading ? (
                   [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)
               ) : stats?.recentFiles && stats.recentFiles.length > 0 ? (
                   stats.recentFiles.map((file: any, i: number) => {
                      const type = (file.targetType || file.fileType || "").toLowerCase();
                      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(type);
                      
                      return (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                    {isImage && file.filePath ? (
                                        <img src={file.filePath} alt="icon" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-primary">{type}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{file.fileName}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{(file.convertedSize / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                <Link href="/dashboard/cloud"><ArrowUpRight size={16} /></Link>
                            </Button>
                        </div>
                      )
                   })
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                       <div className="p-4 bg-muted rounded-full">
                           <Search className="text-muted-foreground" size={32} />
                       </div>
                       <p className="text-sm text-muted-foreground font-medium">Aucune activité récente à afficher.</p>
                   </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bg, loading }: any) {
   return (
      <div className="bg-card rounded-[2rem] p-7 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
         {loading ? (
             <div className="space-y-4 animate-pulse">
                 <div className="h-10 w-10 bg-muted rounded-xl" />
                 <div className="space-y-2">
                     <div className="h-4 w-20 bg-muted rounded" />
                     <div className="h-8 w-32 bg-muted rounded" />
                 </div>
             </div>
         ) : (
            <>
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-3 rounded-2xl shadow-sm", bg, color)}>
                    <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {trend}
                    </div>
                </div>
                <div>
                    <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
                    <p className="text-3xl font-black text-foreground">{value}</p>
                </div>
            </>
         )}
      </div>
   )
}
