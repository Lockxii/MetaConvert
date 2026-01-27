import { db } from "@/db";
import { user, conversions, upscales, sharedLinks, dropLinks, fileStorage } from "@/db/schema";
import { count, desc, gte, sql, eq } from "drizzle-orm";
import Link from "next/link";
import { 
    Users, 
    FileText, 
    HardDrive, 
    ArrowLeft,
    TrendingUp,
    Shield,
    Send,
    FolderUp,
    Clock,
    Activity,
    Download,
    Eye,
    Trash2,
    Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminClient from "./AdminClient";

async function getStats() {
    const [totalUsers] = await db.select({ count: count() }).from(user);
    const [totalConversions] = await db.select({ count: count() }).from(conversions);
    const [totalUpscales] = await db.select({ count: count() }).from(upscales);
    const [totalTransfers] = await db.select({ count: count() }).from(sharedLinks);
    const [totalDrops] = await db.select({ count: count() }).from(dropLinks);
    const [totalStoredFiles] = await db.select({ count: count() }).from(fileStorage);

    return {
        users: totalUsers.count,
        conversions: totalConversions.count,
        upscales: totalUpscales.count,
        transfers: totalTransfers.count,
        drops: totalDrops.count,
        storage: totalStoredFiles.count
    };
}

async function getRecentData() {
    const recentConversions = await db.select({
        id: conversions.id,
        fileName: conversions.fileName,
        targetType: conversions.targetType,
        status: conversions.status,
        createdAt: conversions.createdAt,
        userId: conversions.userId,
        userName: user.name,
        filePath: conversions.filePath
    })
    .from(conversions)
    .leftJoin(user, eq(conversions.userId, user.id))
    .orderBy(desc(conversions.createdAt))
    .limit(10);

    const activeTransfers = await db.select({
        id: sharedLinks.id,
        fileName: sharedLinks.fileName,
        expiresAt: sharedLinks.expiresAt,
        downloadCount: sharedLinks.downloadCount,
        userName: user.name,
        filePath: sharedLinks.filePath
    })
    .from(sharedLinks)
    .leftJoin(user, eq(sharedLinks.userId, user.id))
    .orderBy(desc(sharedLinks.createdAt))
    .limit(10);

    const activeDrops = await db.select({
        id: dropLinks.id,
        title: dropLinks.title,
        expiresAt: dropLinks.expiresAt,
        userName: user.name
    })
    .from(dropLinks)
    .leftJoin(user, eq(dropLinks.userId, user.id))
    .orderBy(desc(dropLinks.createdAt))
    .limit(10);

    return {
        conversions: recentConversions,
        transfers: activeTransfers,
        drops: activeDrops
    };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const data = await getRecentData();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Header Admin */}
        <div className="bg-white border-b border-slate-200 mb-8">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-950 rounded-lg text-white">
                                <Shield size={24} />
                            </div>
                            <h1 className="text-3xl font-[1000] tracking-tighter uppercase">Administration</h1>
                        </div>
                        <p className="text-slate-500 font-medium italic">Centre de contrôle global de MetaConvert.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="rounded-xl font-bold gap-2" asChild>
                            <Link href="/dashboard"><ArrowLeft size={18} /> Retour site</Link>
                        </Button>
                        <Button className="rounded-xl font-black gap-2 bg-slate-950" asChild>
                            <Link href="/admin/users"><Users size={18} /> Utilisateurs</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AdminStatCard title="Membres" value={stats.users} icon={Users} color="text-blue-600" />
                <AdminStatCard title="Conversions" value={stats.conversions} icon={Activity} color="text-emerald-600" />
                <AdminStatCard title="Upscales" value={stats.upscales} icon={TrendingUp} color="text-indigo-600" />
                <AdminStatCard title="Transferts" value={stats.transfers} icon={Send} color="text-purple-600" />
                <AdminStatCard title="Demandes" value={stats.drops} icon={FolderUp} color="text-pink-600" />
                <AdminStatCard title="Cloud Files" value={stats.storage} icon={Database} color="text-sky-600" />
            </div>

            {/* Interactive Admin Panel */}
            <AdminClient initialData={data} />
        </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon: Icon, color }: any) {
    return (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden group hover:border-blue-600/30 transition-all">
            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    <div className={cn("p-2.5 rounded-xl bg-slate-50 w-fit group-hover:scale-110 transition-transform", color)}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                        <p className="text-2xl font-[1000] text-slate-950 tracking-tighter">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}