"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, Info, CheckCircle2, AlertTriangle, XCircle, Clock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling léger toutes les 2 minutes pour les nouvelles notifications
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotifClick = (id: string) => {
        setOpen(false);
        router.push(`/dashboard/notifications/${id}`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success("Message supprimé");
            }
        } catch (e) {
            toast.error("Erreur");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'error': return <XCircle className="text-red-500" size={16} />;
            default: return <Info className="text-blue-500" size={16} />;
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/5 transition-all outline-none">
                    {unreadCount > 0 ? (
                        <>
                            <BellRing className="h-5 w-5 text-primary animate-pulse" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
                        </>
                    ) : (
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-2xl border-border shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Notifications</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Flux d'actualité en temps réel</p>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">
                            {unreadCount} NOUVEAU
                        </span>
                    )}
                </div>
                <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/30">
                                <Bell size={24} />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground italic">Aucun message pour le moment.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem key={n.id} onClick={() => handleNotifClick(n.id)} className={cn(
                                "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/50 transition-colors relative",
                                !n.isRead && "bg-primary/[0.02]"
                            )}>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1.5 rounded-lg bg-background border border-border shadow-sm">
                                        {getTypeIcon(n.type)}
                                    </div>
                                    <span className="font-black text-sm text-foreground flex-1 truncate">{n.title}</span>
                                    <button 
                                        onClick={(e) => handleDelete(e, n.id)}
                                        className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors group/trash"
                                    >
                                        <Trash2 size={12} className="opacity-40 group-hover/trash:opacity-100" />
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pl-9 pr-4 line-clamp-2">{n.message}</p>
                                
                                {!n.isRead && <div className="absolute top-1/2 left-1 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/10 text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Géré par MetaConvert Cloud</p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
