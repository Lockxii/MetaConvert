import { db } from "@/db";
import { user, conversions, upscales } from "@/db/schema";
import { count, desc, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { 
    Users, 
    FileText, 
    HardDrive, 
    ArrowLeft,
    TrendingUp,
    Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStats() {
    // Total Users
    const [totalUsersRes] = await db.select({ count: count() }).from(user);
    const totalUsers = totalUsersRes.count;

    // Users this month (approx)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [newUsersRes] = await db.select({ count: count() }).from(user).where(gte(user.createdAt, thirtyDaysAgo));
    const newUsers = newUsersRes.count;

    // Total Conversions
    const [totalConversionsRes] = await db.select({ count: count() }).from(conversions);
    const totalConversions = totalConversionsRes.count;

    // Total Upscales
    const [totalUpscalesRes] = await db.select({ count: count() }).from(upscales);
    const totalUpscales = totalUpscalesRes.count;

    return {
        totalUsers,
        newUsers,
        totalConversions,
        totalUpscales
    };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            <div className="flex gap-4">
                 <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    <Users size={18} /> Gérer Utilisateurs
                 </Link>
                 <Link href="/admin/cloud" className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">
                    <HardDrive size={18} /> Cloud Global
                 </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard 
                title="Utilisateurs Total" 
                value={stats.totalUsers} 
                icon={Users} 
                desc={`+${stats.newUsers} ce mois-ci`}
            />
            <StatsCard 
                title="Conversions" 
                value={stats.totalConversions} 
                icon={FileText} 
                desc="Total fichiers traités"
            />
            <StatsCard 
                title="Upscales IA" 
                value={stats.totalUpscales} 
                icon={TrendingUp} 
                desc="Images améliorées"
            />
             <StatsCard 
                title="Sécurité" 
                value="Actif" 
                icon={Shield} 
                desc="Système opérationnel"
            />
        </div>

        {/* Recent Activity or Charts could go here */}
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Les graphiques d'activité seront disponibles prochainement.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, desc }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {desc}
                </p>
            </CardContent>
        </Card>
    )
}
