"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Image as ImageIcon, FileText, Video, Music, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { NotificationBell } from "./NotificationBell";

export function DashboardHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleNewProjectRedirect = (toolPath: string) => {
    router.push(`/dashboard/${toolPath}`);
  }

  return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
                Bonjour, {session?.user?.name?.split(' ')[0] || "utilisateur"} 👋
            </h1>
            <p className="text-muted-foreground font-medium italic">Voici l'activité de vos outils MetaConvert.</p>
         </div>
         <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-[1px] h-8 bg-border mx-1" />
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
  );
}
