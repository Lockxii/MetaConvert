"use client";

import { useEffect, useState } from "react";
import { 
    FolderUp, 
    Plus, 
    Link as LinkIcon, 
    Trash2, 
    ExternalLink, 
    Lock, 
    Clock, 
    Check, 
    Copy,
    MoreVertical,
    FileUp,
    Shield,
    Loader2,
    CheckCircle2,
    Eye
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DropManagementPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Create form state
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [exp, setExp] = useState("24");
    const [pass, setPass] = useState("");
    const [creating, setCreating] = useState(false);

    // Delete state
    const [deletingLink, setDeletingLink] = useState<any>(null);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);

    const fetchLinks = async () => {
        try {
            const res = await fetch("/api/drop");
            if (res.ok) {
                const data = await res.json();
                setLinks(data.links);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleCreate = async () => {
        if (!title) return;
        setCreating(true);
        try {
            const res = await fetch("/api/drop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description: desc, expiration: exp, password: pass }),
            });
            if (res.ok) {
                toast.success("Lien de dépôt créé !");
                setIsCreateOpen(false);
                setTitle("");
                setDesc("");
                setPass("");
                fetchLinks();
            }
        } catch (e) {
            toast.error("Erreur lors de la création.");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingLink) return;
        setIsProcessingDelete(true);
        try {
            const res = await fetch(`/api/drop/${deletingLink.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Demande supprimée.");
                setLinks(prev => prev.filter(l => l.id !== deletingLink.id));
                setDeletingLink(null);
            } else {
                toast.error("Erreur lors de la suppression.");
            }
        } catch (e) {
            toast.error("Erreur de connexion.");
        } finally {
            setIsProcessingDelete(false);
        }
    };

    const copyToClipboard = (id: string) => {
        const url = `${window.location.origin}/drop/${id}`;
        navigator.clipboard.writeText(url);
        toast.info("Lien de dépôt copié !");
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary font-black">
                            <FolderUp size={28} strokeWidth={2.5} />
                        </div>
                        Demandes de Fichiers
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">Créez des liens pour recevoir des fichiers directement dans votre Cloud.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 font-black text-lg transition-all active:scale-95">
                            <Plus size={20} strokeWidth={3} />
                            Nouvelle Demande
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl p-8 rounded-[2.5rem] border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black mb-2">Créer une demande</DialogTitle>
                            <p className="text-muted-foreground">Configurez votre lien de dépôt sécurisé.</p>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Titre de la demande</label>
                                <Input 
                                    placeholder="Ex: Photos du shooting Mariage" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12 rounded-2xl bg-muted/30 border-border"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description (Optionnel)</label>
                                <Input 
                                    placeholder="Expliquez ce que vous attendez..." 
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="h-12 rounded-2xl bg-muted/30 border-border"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Expiration</label>
                                    <Select value={exp} onValueChange={setExp}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-muted/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 Heure</SelectItem>
                                            <SelectItem value="24">24 Heures</SelectItem>
                                            <SelectItem value="168">7 Jours</SelectItem>
                                            <SelectItem value="720">30 Jours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <Input 
                                            type="password"
                                            placeholder="Secret"
                                            value={pass}
                                            onChange={(e) => setPass(e.target.value)}
                                            className="h-12 pl-11 rounded-2xl bg-muted/30 border-border"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-12 font-bold">Annuler</Button>
                            <Button 
                                onClick={handleCreate} 
                                disabled={!title || creating}
                                className="h-12 px-8 rounded-2xl font-black gap-2"
                            >
                                {creating ? <Loader2 className="animate-spin" /> : <LinkIcon size={18} />}
                                Créer le lien
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-muted rounded-[2rem] animate-pulse border border-border" />
                    ))}
                </div>
            ) : links.length === 0 ? (
                <Card className="border-dashed border-2 py-24 rounded-[3rem] bg-muted/10 text-center flex flex-col items-center">
                    <div className="p-6 bg-primary/10 rounded-full text-primary mb-6">
                        <FileUp size={48} />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Aucune demande active</h3>
                    <p className="text-muted-foreground max-w-xs mb-8">
                        Créez votre premier lien de dépôt pour commencer à recevoir des fichiers.
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl h-12 px-8 font-black">
                        Lancer une demande
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link: any) => (
                        <Card key={link.id} className="group hover:border-primary/50 transition-all hover:shadow-xl rounded-[2rem] border-border bg-card overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-xl truncate max-w-[180px]">{link.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {!link.isActive && (
                                                    <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                                        <CheckCircle2 size={10} strokeWidth={3} /> Fichier reçu
                                                    </span>
                                                )}
                                                {link.password && <Lock size={12} className="text-amber-500" />}
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    Expire le {new Date(link.expiresAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!link.isActive ? (
                                                <Button variant="secondary" size="sm" className="h-10 rounded-xl font-bold gap-2 text-xs" asChild>
                                                    <Link href={`/dashboard/cloud?dropId=${link.id}`}>
                                                        <Eye size={14} /> Voir
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" asChild title="Ouvrir">
                                                    <Link href={`/drop/${link.id}`} target="_blank"><ExternalLink size={18} /></Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-background rounded-lg flex items-center justify-center text-primary shadow-sm">
                                                <LinkIcon size={14} />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-muted-foreground">.../drop/{link.id.substring(0, 8)}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.id)} className="h-8 rounded-lg font-black text-[10px] uppercase">
                                            Copier
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Shield size={12} className="text-emerald-500" />
                                            Sécurisé
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                                            onClick={() => setDeletingLink(link)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
                <DialogContent className="max-w-md p-8 rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black mb-2 text-destructive">Supprimer la demande</DialogTitle>
                        <DialogDescription className="text-lg">
                            Êtes-vous sûr de vouloir supprimer "{deletingLink?.title}" ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-3">
                        <Button variant="ghost" onClick={() => setDeletingLink(null)} disabled={isProcessingDelete} className="rounded-xl font-bold h-12">
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isProcessingDelete} className="rounded-xl font-black h-12 px-6">
                            {isProcessingDelete ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={18} className="mr-2" />}
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
