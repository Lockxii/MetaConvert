"use client";

import { useState } from "react";
import { 
    FileText, 
    Download, 
    Eye, 
    Trash2, 
    Clock, 
    User as UserIcon,
    ArrowUpRight,
    Search,
    Shield,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Send,
    FolderUp,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminClientProps {
    initialData: {
        conversions: any[];
        transfers: any[];
        drops: any[];
    };
}

export default function AdminClient({ initialData }: AdminClientProps) {
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleDownload = (filePath: string, fileName: string) => {
        if (!filePath) return toast.error("Chemin introuvable");
        
        let url = filePath;
        if (filePath.startsWith('db://')) {
            const id = filePath.replace('db://', '');
            url = `/api/download/${id}?download=true`;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePreview = (file: any) => {
        let url = file.filePath;
        if (url?.startsWith('db://')) {
            const id = url.replace('db://', '');
            url = `/api/download/${id}`;
        }
        setPreviewFile({ ...file, url });
    };

    return (
        <Tabs defaultValue="conversions" className="space-y-6">
            <div className="flex items-center justify-between">
                <TabsList className="bg-muted p-1 rounded-xl border border-border">
                    <TabsTrigger value="conversions" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                        <Activity size={14} /> Activité
                    </TabsTrigger>
                    <TabsTrigger value="transfers" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                        <Send size={14} /> Transferts
                    </TabsTrigger>
                    <TabsTrigger value="drops" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                        <FolderUp size={14} /> Demandes
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* --- CONVERSIONS TAB --- */}
            <TabsContent value="conversions">
                <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Fichier</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Utilisateur</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Statut</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {initialData.conversions.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate max-w-[200px]">{conv.fileName}</p>
                                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">{conv.targetType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                                                    <UserIcon size={12} className="text-muted-foreground" />
                                                </div>
                                                <span className="font-medium text-foreground/80">{conv.userName || "Anonyme"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {conv.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle2 size={10} strokeWidth={3} /> Succès
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                    <XCircle size={10} strokeWidth={3} /> Échec
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {conv.filePath && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(conv)}>
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handleDownload(conv.filePath, conv.fileName)}>
                                                            <Download size={16} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </TabsContent>

            {/* --- TRANSFERS TAB --- */}
            <TabsContent value="transfers">
                <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Transfert</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Expéditeur</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Téléchargements</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {initialData.transfers.map((link) => (
                                    <tr key={link.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                                    <Send size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate max-w-[200px]">{link.fileName}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Expire le {new Date(link.expiresAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-foreground/80">{link.userName || "Anonyme"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-lg bg-muted font-black text-[10px] text-muted-foreground">
                                                {link.downloadCount} DL
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(link)}>
                                                    <Eye size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handleDownload(link.filePath, link.fileName)}>
                                                    <Download size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </TabsContent>

            {/* --- DROPS TAB --- */}
            <TabsContent value="drops">
                <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Demande</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Créé par</th>
                                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Expiration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {initialData.drops.map((drop) => (
                                    <tr key={drop.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500">
                                                    <FolderUp size={20} />
                                                </div>
                                                <p className="font-bold text-foreground">{drop.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground/80">{drop.userName}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(drop.expiresAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </TabsContent>

            {/* --- PREVIEW DIALOG --- */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-card shadow-2xl">
                    <DialogHeader className="p-8 border-b border-border bg-card">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-[1000] tracking-tight truncate max-w-md text-foreground">{previewFile?.fileName}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aperçu Admin</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-10 bg-muted/30 flex items-center justify-center min-h-[400px]">
                        {previewFile?.url && (
                            <div className="w-full flex justify-center">
                                {previewFile.fileName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                                    <img src={previewFile.url} className="max-w-full max-h-[60vh] rounded-2xl shadow-xl border border-border" alt="Preview" />
                                ) : previewFile.fileName.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video src={previewFile.url} controls className="max-w-full max-h-[60vh] rounded-2xl shadow-xl" />
                                ) : (
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-border">
                                            <FileText size={40} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Aperçu non disponible pour ce type de fichier.</p>
                                        <Button onClick={() => handleDownload(previewFile.filePath, previewFile.fileName)} className="rounded-xl font-black gap-2">
                                            <Download size={18} /> Télécharger pour voir
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Tabs>
    );
}
