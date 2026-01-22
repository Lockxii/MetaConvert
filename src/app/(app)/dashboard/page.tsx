import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { 
    Clock, 
    HardDrive, 
    Zap,
    Trophy,
    ChevronRight,
    Search,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatCard } from "@/components/dashboard/StatCard";

async function getStats() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const userId = session.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Fetch Global Stats
    const [conversionStats] = await db
      .select({
        count: sql<number>`count(*)`,
        totalOriginalSize: sql<number>`sum(${conversions.originalSize})`,
        totalConvertedSize: sql<number>`sum(${conversions.convertedSize})`,
      })
      .from(conversions)
      .where(eq(conversions.userId, userId));

    const [upscaleStats] = await db
        .select({ count: sql<number>`count(*)` })
        .from(upscales)
        .where(eq(upscales.userId, userId));

    const totalConversions = Number(conversionStats?.count || 0);
    const totalUpscales = Number(upscaleStats?.count || 0);
    const totalProcessed = totalConversions + totalUpscales;

    // 2. Space Saved
    const originalSize = Number(conversionStats?.totalOriginalSize || 0);
    const convertedSize = Number(conversionStats?.totalConvertedSize || 0);
    const spaceSavedBytes = Math.max(0, originalSize - convertedSize);
    
    let spaceSaved = "0 B";
    if (spaceSavedBytes > 1024 * 1024 * 1024) spaceSaved = (spaceSavedBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    else if (spaceSavedBytes > 1024 * 1024) spaceSaved = (spaceSavedBytes / (1024 * 1024)).toFixed(2) + " MB";
    else if (spaceSavedBytes > 1024) spaceSaved = (spaceSavedBytes / 1024).toFixed(2) + " KB";

    // 3. Chart Data
    const dailyConversions = await db
        .select({
            day: sql<string>`to_char(${conversions.createdAt}, 'DD/MM')`,
            count: sql<number>`count(*)`
        })
        .from(conversions)
        .where(and(eq(conversions.userId, userId), gte(conversions.createdAt, sevenDaysAgo)))
        .groupBy(sql`to_char(${conversions.createdAt}, 'DD/MM')`);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const convCount = dailyConversions.find((c: any) => c.day === label)?.count || 0;
        return { name: label, conversions: Number(convCount) };
    });

    // 4. Recent Files
    const recentFiles = await db
      .select()
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .orderBy(desc(conversions.createdAt))
      .limit(6);

    return {
        totalConversions: totalProcessed,
        spaceSaved,
        successRate: totalProcessed > 0 ? "100%" : "0%",
        timeSaved: `${(totalProcessed * 0.5).toFixed(1)}h`,
        recentFiles,
        chartData: last7Days
    };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <DashboardHeader />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Fichiers traités" 
              value={stats.totalConversions}
              trend="+12% cette semaine" 
              icon={Zap} 
              color="text-yellow-500" 
              bg="bg-yellow-500/10" 
          />
          <StatCard 
              title="Espace économisé" 
              value={stats.spaceSaved}
              trend="Stockage optimisé" 
              icon={HardDrive} 
              color="text-blue-500" 
              bg="bg-blue-500/10" 
          />
          <StatCard 
              title="Productivité" 
              value={stats.timeSaved}
              trend="Temps manuel gagné" 
              icon={Clock} 
              color="text-emerald-500" 
              bg="bg-emerald-500/10" 
          />
          <StatCard 
              title="Taux de succès" 
              value={stats.successRate}
              trend="Opérations fluides" 
              icon={Trophy} 
              color="text-purple-500" 
              bg="bg-purple-500/10" 
          />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Activity Chart */}
         <DashboardCharts data={stats.chartData} />

         {/* Recent History */}
         <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-foreground">Historique</h3>
                <Link href="/dashboard/cloud" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                    Tout voir <ChevronRight size={14} />
                </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
               {stats.recentFiles.length > 0 ? (
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
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{((file.convertedSize || 0) / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}</p>
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