"use client";

import { useState, useEffect } from "react";
import { 
    Send, 
    Upload, 
    Link as LinkIcon, 
    Trash2, 
    Clock, 
    Lock, 
    Copy, 
    Check, 
    Loader2, 
    FileText,
    Shield,
    X,
    Calendar,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

import JSZip from "jszip";

interface TransferLink {
    id: string;
    fileName: string;
    expiresAt: string;
    createdAt: string;
    downloadCount: number;
}

export default function TransferPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [expiration, setExpiration] = useState("7");
    const [password, setPassword] = useState("");
    const [uploading, setUploading] = useState(false);
    const [links, setLinks] = useState<TransferLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchLinks = async () => {
        try {
            const res = await fetch("/api/transfer/list");
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

    const onDrop = (acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        setShareUrl(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        
        try {
            let finalFile: File | Blob = files[0];
            let finalFileName = files[0].name;

            if (files.length > 1) {
                toast.info("Création de l'archive ZIP...");
                const zip = new JSZip();
                files.forEach(f => zip.file(f.name, f));
                finalFile = await zip.generateAsync({ type: "blob" });
                finalFileName = `transfert_${new Date().getTime()}.zip`;
            }

            const formData = new FormData();
            formData.append("file", finalFile, finalFileName);
            formData.append("expiration", expiration);
            if (password) formData.append("password", password);

            const res = await fetch("/api/transfer", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setShareUrl(data.shareUrl);
                toast.success("Transfert prêt !");
                setFiles([]);
                setPassword("");
                fetchLinks();
            } else {
                toast.error(data.error || "Erreur lors du transfert");
            }
        } catch (e) {
            toast.error("Erreur technique lors de l'envoi");
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const toastId = toast.loading("Suppression...");
        try {
            const res = await fetch(`/api/transfer/${id}`, { method: "DELETE" });
            if (res.ok) {
                setLinks(prev => prev.filter(l => l.id !== id));
                toast.success("Transfert supprimé", { id: toastId });
            } else {
                toast.error("Erreur", { id: toastId });
            }
        } catch (e) {
            toast.error("Erreur", { id: toastId });
        }
    };

    const copyToClipboard = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.info("Lien copié !");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                            <Send size={32} strokeWidth={2.5} />
                        </div>
                        MetaTransfer
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium italic">
                        Envoyez vos fichiers en toute sécurité, partout dans le monde.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Upload Card (WeTransfer Style) */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl border border-white/10">
                        <CardContent className="p-8 space-y-8">
                            {!shareUrl ? (
                                <>
                                    <div 
                                        {...getRootProps()} 
                                        className={cn(
                                            "relative group cursor-pointer transition-all duration-500",
                                            "border-2 border-dashed rounded-[2rem] p-12 text-center",
                                            isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5">
                                                <Plus className="text-primary w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black">
                                                    Ajoutez vos fichiers
                                                </p>
                                                <p className="text-muted-foreground text-sm font-medium mt-1">
                                                    ou glissez-déposez ici
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liste des fichiers sélectionnés */}
                                    {files.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                                            {files.map((f, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border group/item hover:border-primary/30 transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 bg-background rounded-lg text-primary">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold truncate max-w-[200px]">{f.name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold">{formatSize(f.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFile(idx)}
                                                        className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Durée du lien</label>
                                            <Select value={expiration} onValueChange={setExpiration}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-none font-bold text-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                                    <SelectItem value="7">7 Jours</SelectItem>
                                                    <SelectItem value="15">15 Jours</SelectItem>
                                                    <SelectItem value="30">30 Jours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe (Optionnel)</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <Input 
                                                    type="password"
                                                    placeholder="Protéger mon transfert"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="h-14 pl-12 rounded-2xl bg-muted/50 border-none font-bold text-lg"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleUpload}
                                            disabled={files.length === 0 || uploading}
                                            className="w-full h-16 rounded-2xl font-black text-xl gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                                        >
                                            {uploading ? (
                                                <Loader2 className="animate-spin w-6 h-6" />
                                            ) : (
                                                <Send size={24} />
                                            )}
                                            {files.length > 1 ? `Envoyer ${files.length} fichiers` : "Transférer"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-8 py-4 animate-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/5">
                                        <Check size={48} strokeWidth={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black">C'est prêt !</h3>
                                        <p className="text-muted-foreground font-medium text-lg">Votre lien de transfert a été généré.</p>
                                    </div>
                                    
                                    <div className="p-6 bg-muted/50 rounded-[2rem] border-2 border-dashed border-primary/20 space-y-4">
                                        <div className="flex items-center gap-3 bg-background p-4 rounded-xl border border-border">
                                            <LinkIcon size={18} className="text-primary shrink-0" />
                                            <p className="text-sm font-mono font-bold truncate flex-1">{shareUrl}</p>
                                        </div>
                                        <Button 
                                            onClick={() => copyToClipboard(shareUrl, "new")} 
                                            className="w-full h-12 rounded-xl font-black gap-2"
                                        >
                                            {copiedId === "new" ? <Check size={18} /> : <Copy size={18} />}
                                            Copier le lien
                                        </Button>
                                    </div>

                                    <Button variant="ghost" onClick={() => setShareUrl(null)} className="font-bold text-muted-foreground hover:text-primary transition-colors">
                                        Envoyer un autre fichier
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-center gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 text-emerald-600">
                            <Shield size={14} strokeWidth={3} /> Chiffrement AES-256
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/10 text-blue-600">
                            <Clock size={14} strokeWidth={3} /> Liens éphémères
                        </div>
                    </div>
                </div>

                {/* Right: Active Transfers List */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between ml-2">
                        <h2 className="text-2xl font-black">Mes transferts actifs</h2>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                            {links.length} En ligne
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-muted/50 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : links.length === 0 ? (
                        <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                            <p className="text-muted-foreground font-medium text-lg italic">Aucun transfert actif pour le moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {links.map((link) => (
                                <Card key={link.id} className="rounded-3xl border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all group overflow-hidden shadow-sm hover:shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-lg group-hover:text-primary transition-colors">{link.fileName}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} /> {new Date(link.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-amber-500">
                                                            <Clock size={12} /> {new Date(link.expiresAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-primary">
                                                            <Download size={12} /> {link.downloadCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-10 w-10 rounded-xl"
                                                    onClick={() => copyToClipboard(`${window.location.origin}/share/${link.id}`, link.id)}
                                                    title="Copier le lien"
                                                >
                                                    {copiedId === link.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                                                    onClick={() => handleDelete(link.id)}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
