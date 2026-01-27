"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Bell, 
    ArrowLeft, 
    Clock, 
    Trash2, 
    Send, 
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    XCircle,
    Loader2,
    ImageIcon,
    ExternalLink,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [notif, setNotif] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [voted, setVoted] = useState<string | null>(null);

    const fetchNotif = async () => {
        try {
            const res = await fetch(`/api/notifications/${id}`);
            if (res.ok) {
                const data = await res.json();
                setNotif(data.notification);
                if (data.notification.userResponse) setResponse(data.notification.userResponse);
            } else {
                toast.error("Notification introuvable");
                router.push("/dashboard");
            }
        } catch (e) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotif();
    }, [id]);

    const handleAction = async (action: 'respond' | 'vote' | 'delete', payload?: any) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: action === 'delete' ? 'DELETE' : 'POST',
                body: JSON.stringify({ action, ...payload }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                if (action === 'delete') {
                    toast.success("Notification supprimée");
                    router.push("/dashboard");
                } else {
                    toast.success("Action enregistrée");
                    fetchNotif();
                }
            }
        } catch (e) {
            toast.error("Erreur lors de l'opération");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    const pollOptions = notif.pollOptions ? JSON.parse(notif.pollOptions) : [];

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold text-muted-foreground hover:text-foreground">
                <ArrowLeft size={18} /> Retour
            </Button>

            <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {notif.image && (
                    <div className="w-full aspect-video relative overflow-hidden bg-muted">
                        <img src={notif.image} alt={notif.title} className="w-full h-full object-cover" />
                    </div>
                )}
                
                <CardContent className="p-8 sm:p-12 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                notif.type === 'error' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                notif.type === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                notif.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                "bg-primary/10 text-primary border-primary/20"
                            )}>
                                {notif.type}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                                <Clock size={12} />
                                {new Date(notif.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-[1000] tracking-tighter text-foreground leading-tight">
                            {notif.title}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {notif.message}
                        </p>
                    </div>

                    {/* Poll Section */}
                    {pollOptions.length > 0 && (
                        <div className="space-y-4 p-6 bg-muted/30 rounded-3xl border border-border">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                <Bell size={14} className="text-primary" /> Sondage rapide
                            </h3>
                            <div className="grid gap-3">
                                {pollOptions.map((opt: string, i: number) => (
                                    <Button 
                                        key={i} 
                                        variant={voted === opt ? "default" : "outline"}
                                        className="h-12 rounded-xl justify-between px-6 font-bold"
                                        onClick={() => { setVoted(opt); handleAction('vote', { option: opt }); }}
                                        disabled={submitting}
                                    >
                                        {opt}
                                        {voted === opt && <CheckCircle2 size={18} />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response Section */}
                    {notif.requiresResponse && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                <Mail size={14} className="text-primary" /> Votre réponse
                            </h3>
                            <Textarea 
                                placeholder="Tapez votre réponse ici..."
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                className="min-h-[120px] rounded-2xl bg-muted/20 border-border"
                                disabled={notif.userResponse || submitting}
                            />
                            {!notif.userResponse && (
                                <Button 
                                    className="w-full h-14 rounded-2xl font-black gap-2 shadow-xl"
                                    onClick={() => handleAction('respond', { response })}
                                    disabled={!response || submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                    Envoyer la réponse
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                        {notif.link && (
                            <Button className="flex-1 h-12 rounded-xl gap-2 font-bold" asChild>
                                <a href={notif.link} target="_blank">
                                    Voir plus d'infos <ExternalLink size={16} />
                                </a>
                            </Button>
                        )}
                        <Button 
                            variant="destructive" 
                            className="h-12 rounded-xl gap-2 font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none"
                            onClick={() => handleAction('delete')}
                            disabled={submitting}
                        >
                            <Trash2 size={16} /> Supprimer ce message
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
