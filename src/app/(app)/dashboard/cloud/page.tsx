"use client";

import { useEffect, useState } from "react";
import { 
    Download, 
    Trash2, 
    FileText, 
    Image as ImageIcon, 
    Video, 
    Music, 
    MoreVertical, 
    Search,
    Loader2,
    HardDrive,
    Clock,
    Eye,
    Pencil,
    Share2,
    Lock,
    Copy,
    Check,
    Link as LinkIcon,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2 as ShareIcon, QrCode } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface CloudFile {
    id: number;
    type: 'conversion' | 'upscale';
    fileName: string;
    fileType: string;
    targetType: string;
    status: string;
    size: number;
    filePath: string | null;
    createdAt: string;
}

export default function CloudPage() {
    const searchParams = useSearchParams();
    const dropId = searchParams.get("dropId");

    const [files, setFiles] = useState<CloudFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Rename states
    const [renamingFile, setRenamingFile] = useState<CloudFile | null>(null);
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [isBatchDeletingOpen, setIsBatchDeletingOpen] = useState(false);
    const [deletingFile, setDeletingFile] = useState<CloudFile | null>(null);

    // Share states
    const [sharingFile, setSharingFile] = useState<CloudFile | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareExp, setShareExp] = useState("24");
    const [sharePass, setSharePass] = useState("");
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [copied, setCopied] = useState(false);
    const [afficherQr, setAfficherQr] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const url = dropId ? `/api/dashboard/cloud?dropId=${dropId}` : "/api/dashboard/cloud";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files);
            } else {
                toast.error("Échec du chargement des fichiers cloud.");
            }
        } catch (e) {
            toast.error("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [dropId]);

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             f.targetType.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterType === "all") return matchesSearch;
        
        const type = f.targetType.toLowerCase();
        if (filterType === "images") return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(type) && matchesSearch;
        if (filterType === "videos") return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(type) && matchesSearch;
        if (filterType === "audio") return ['mp3', 'wav', 'ogg', 'm4a', 'mpeg'].includes(type) && matchesSearch;
        if (filterType === "docs") return ['pdf', 'txt', 'doc', 'docx'].includes(type) && matchesSearch;
        
        return matchesSearch;
    });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredFiles.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredFiles.map(f => `${f.type}-${f.id}`));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = async () => {
        setIsProcessingDelete(true);
        const toastId = toast.loading(`Suppression de ${selectedIds.length} fichiers...`);
        let successCount = 0;

        for (const fullId of selectedIds) {
            const [type, id] = fullId.split('-');
            try {
                const res = await fetch("/api/dashboard/cloud/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: parseInt(id), type }),
                });
                if (res.ok) successCount++;
            } catch (e) {
                console.error("Delete error:", e);
            }
        }

        setFiles(prev => prev.filter(f => !selectedIds.includes(`${f.type}-${f.id}`)));
        setSelectedIds([]);
        setIsBatchDeletingOpen(false);
        setIsProcessingDelete(false);
        toast.success(`${successCount} fichiers supprimés.`, { id: toastId });
    };

    const handleBatchDownload = async () => {
        const selectedFiles = files.filter(f => selectedIds.includes(`${f.type}-${f.id}`));
        const filesToDownload = selectedFiles.filter(f => f.filePath);

        if (filesToDownload.length === 0) {
            toast.error("Aucun fichier disponible au téléchargement.");
            return;
        }

        toast.info(`Lancement du téléchargement de ${filesToDownload.length} fichiers...`);
        
        for (let i = 0; i < filesToDownload.length; i++) {
            const file = filesToDownload[i];
            const a = document.createElement("a");
            a.href = file.filePath!;
            a.download = file.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (i < filesToDownload.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
    };

    const handleRename = async () => {
        if (!renamingFile || !newName) return;
        setIsRenaming(true);
        try {
            const res = await fetch("/api/dashboard/cloud/rename", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: renamingFile.id, type: renamingFile.type, newName }),
            });
            if (res.ok) {
                setFiles(prev => prev.map(f => (f.id === renamingFile.id && f.type === renamingFile.type) ? { ...f, fileName: newName } : f));
                toast.success("Fichier renommé.");
                setRenamingFile(null);
            } else {
                toast.error("Erreur lors du renommage.");
            }
        } catch (e) {
            toast.error("Erreur de connexion.");
        } finally {
            setIsRenaming(false);
        }
    };

    const handleCreateShareLink = async () => {
        if (!sharingFile) return;
        setIsCreatingLink(true);
        try {
            const res = await fetch("/api/share/create-from-cloud", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: sharingFile.id, type: sharingFile.type, expiration: shareExp, password: sharePass }),
            });
            const data = await res.json();
            if (res.ok) {
                setShareUrl(data.shareUrl);
                toast.success("Lien de partage créé !");
            } else {
                toast.error(data.error || "Erreur lors de la création du lien.");
            }
        } catch (e) {
            toast.error("Erreur de connexion.");
        } finally {
            setIsCreatingLink(false);
        }
    };

    const copyToClipboard = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.info("Lien copié !");
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileThumbnail = (file: CloudFile) => {
        const type = (file.targetType || "").toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(type);
        
        if (file.filePath && !file.filePath.startsWith('db://')) {
            if (isImage) {
                return (
                    <div className="relative w-full h-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img 
                            src={file.filePath} 
                            alt={file.fileName} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as any).style.display = 'none';
                                (e.target as any).parentElement.innerHTML = '<div class="text-xs text-red-500 font-bold">ERR</div>';
                            }}
                        />
                    </div>
                );
            }
        }

        if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(type)) return <Video className="text-purple-500" />;
        if (['mp3', 'wav', 'ogg', 'm4a', 'mpeg'].includes(type)) return <Music className="text-pink-500" />;
        if (['pdf'].includes(type)) return <FileText className="text-red-500" />;
        return <FileText className="text-slate-500" />;
    };

    const handleDownload = (file: CloudFile) => {
        if (!file.filePath) {
            toast.error("Ce fichier n'est plus disponible au téléchargement.");
            return;
        }

        if (file.filePath.startsWith('db://')) {
            const fileId = file.filePath.replace('db://', '');
            const url = `/api/download/${fileId}`;
            const a = document.createElement("a");
            a.href = url;
            a.download = file.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        const a = document.createElement("a");
        a.href = file.filePath;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDelete = async () => {
        if (!deletingFile) return;
        setIsProcessingDelete(true);
        try {
            const res = await fetch("/api/dashboard/cloud/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deletingFile.id, type: deletingFile.type }),
            });

            if (res.ok) {
                setFiles(files.filter(f => !(f.id === deletingFile.id && f.type === deletingFile.type)));
                toast.success("Fichier supprimé.");
                setDeletingFile(null);
            } else {
                toast.error("Erreur lors de la suppression.");
            }
        } catch (e) {
            toast.error("Erreur de connexion.");
        } finally {
            setIsProcessingDelete(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mon Cloud MetaConvert</h1>
                    <p className="text-muted-foreground mt-1">Retrouvez et gérez tous vos fichiers convertis.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                    <HardDrive size={16} />
                    <span>{formatSize(files.reduce((acc, f) => acc + f.size, 0))} utilisés</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-muted/50 p-1 rounded-xl border border-border overflow-x-auto no-scrollbar w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Tous' },
                        { id: 'images', label: 'Images' },
                        { id: 'videos', label: 'Vidéos' },
                        { id: 'audio', label: 'Audio' },
                        { id: 'docs', label: 'Docs' },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilterType(btn.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                filterType === btn.id 
                                    ? "bg-background text-primary shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                        placeholder="Rechercher dans vos fichiers..." 
                        className="pl-10 h-11 bg-card border-border shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {filteredFiles.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border">
                        <Checkbox 
                            id="select-all" 
                            checked={selectedIds.length === filteredFiles.length && filteredFiles.length > 0}
                            onCheckedChange={toggleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-xs font-medium cursor-pointer select-none">
                            Tout sélectionner
                        </label>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse border border-border" />
                    ))}
                </div>
            ) : filteredFiles.length === 0 ? (
                <Card className="border-dashed border-2 py-20 text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full text-muted-foreground">
                            <ImageIcon size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Aucun fichier trouvé</h3>
                            <p className="text-muted-foreground">Commencez par convertir un fichier pour le voir ici.</p>
                        </div>
                        <Button variant="outline" asChild className="mt-2">
                            <a href="/dashboard/image">Démarrer une conversion</a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFiles.map((file, i) => {
                        const isSelected = selectedIds.includes(`${file.type}-${file.id}`);
                        return (
                            <Card 
                                key={`${file.type}-${file.id}`} 
                                className={cn(
                                    "group transition-all overflow-hidden border-border bg-card relative",
                                    isSelected ? "ring-2 ring-primary border-primary/50 bg-primary/5" : "hover:border-primary/50 hover:shadow-md"
                                )}
                            >
                                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity">
                                    <Checkbox 
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSelect(`${file.type}-${file.id}`)}
                                        className="bg-background shadow-lg"
                                    />
                                </div>
                                <CardContent className="p-0">
                                    <div className="p-4 flex items-start justify-between gap-4">
                                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0 border border-border/50 overflow-hidden">
                                            {getFileThumbnail(file)}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className="text-sm font-bold text-foreground truncate">{file.fileName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                    {file.targetType || file.fileType}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => setPreviewFile(file)} className="gap-2 cursor-pointer">
                                                    <Eye size={14} /> Aperçu
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDownload(file)} className="gap-2 cursor-pointer">
                                                    <Download size={14} /> Télécharger
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setRenamingFile(file); setNewName(file.fileName); }} className="gap-2 cursor-pointer">
                                                    <Pencil size={14} /> Renommer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSharingFile(file); setShareUrl(null); setAfficherQr(false); }} className="gap-2 cursor-pointer">
                                                    <Share2 size={14} /> Créer un lien
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSharingFile(file); setShareUrl(null); setAfficherQr(true); }} className="gap-2 cursor-pointer">
                                                    <QrCode size={14} /> Code QR
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => setDeletingFile(file)}>
                                                    <Trash2 size={14} /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="px-4 pb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Clock size={10} />
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </div>
                                        {!isSelected && (
                                            <div className="flex gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => { setSharingFile(file); setShareUrl(null); setAfficherQr(false); }}
                                                    title="Partager"
                                                >
                                                    <Share2 size={12} />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity gap-1 px-2"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download size={10} /> Download
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Selection Bar - Modern Floating Design */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
                    <div className="bg-slate-950/90 dark:bg-card/90 backdrop-blur-xl text-white dark:text-foreground px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-10 duration-500 ease-out">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center font-black text-primary-foreground shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                                {selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold tracking-tight">Fichiers sélectionnés</span>
                                <span className="text-[10px] text-white/50 dark:text-muted-foreground uppercase tracking-widest font-medium">Actions groupées</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="rounded-xl gap-2 font-bold h-10 px-4 hover:scale-105 transition-all active:scale-95" 
                                onClick={handleBatchDownload}
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Télécharger</span>
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-xl gap-2 font-bold h-10 px-4 hover:scale-105 transition-all active:scale-95 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border-none" 
                                onClick={() => setIsBatchDeletingOpen(true)}
                            >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Supprimer</span>
                            </Button>

                            <div className="w-[1px] h-8 bg-white/10 dark:bg-border mx-2" />

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 dark:text-muted-foreground" 
                                onClick={() => setSelectedIds([])}
                                title="Annuler la sélection"
                            >
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="flex items-center gap-3">
                            <div className="h-8 w-8 flex items-center justify-center">
                                {previewFile && getFileThumbnail(previewFile)}
                            </div>
                            <span className="truncate">{previewFile?.fileName}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto p-6 bg-slate-900/5 dark:bg-black/20 flex items-center justify-center min-h-[300px]">
                        {previewFile?.filePath ? (
                            <div className="w-full h-full flex items-center justify-center">
                                {previewFile.filePath.startsWith('db://') ? (
                                    <div className="text-center space-y-4 p-8 bg-card border border-border rounded-2xl shadow-xl">
                                        <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                                            <Lock size={32} />
                                        </div>
                                        <p className="text-muted-foreground">Fichier sécurisé en base de données.<br/>Aperçu non disponible.</p>
                                        <Button onClick={() => handleDownload(previewFile)}>Télécharger pour voir</Button>
                                    </div>
                                ) : (
                                    <>
                                        {['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes((previewFile.targetType || "").toLowerCase()) ? (
                                            <img src={previewFile.filePath} alt="Preview" className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-lg" />
                                        ) : ['mp4', 'webm', 'ogg', 'mov'].includes((previewFile.targetType || "").toLowerCase()) ? (
                                            <video src={previewFile.filePath} controls className="max-w-full max-h-[60vh] rounded-lg shadow-2xl" />
                                        ) : ['mp3', 'wav', 'ogg', 'm4a', 'mpeg'].includes((previewFile.targetType || "").toLowerCase()) ? (
                                            <audio src={previewFile.filePath} controls className="w-full max-w-md" />
                                        ) : (
                                            <div className="text-center space-y-4 p-12 bg-card border border-border rounded-2xl shadow-xl">
                                                <div className="p-4 bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                                    <FileText size={32} />
                                                </div>
                                                <p className="text-muted-foreground">L'aperçu n'est pas disponible pour ce type de fichier ({previewFile.targetType}).</p>
                                                <Button onClick={() => handleDownload(previewFile)}>Télécharger pour voir</Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">Fichier non disponible.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={!!renamingFile} onOpenChange={(open) => !open && setRenamingFile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renommer le fichier</DialogTitle>
                        <DialogDescription>Entrez le nouveau nom pour "{renamingFile?.fileName}"</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            placeholder="Nouveau nom..."
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRenamingFile(null)}>Annuler</Button>
                        <Button onClick={handleRename} disabled={isRenaming || !newName}>
                            {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={!!sharingFile} onOpenChange={(open) => {
                if (!open) {
                    setSharingFile(null);
                    setAfficherQr(false);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Partager le fichier</DialogTitle>
                        <DialogDescription>Générez un lien éphémère pour "{sharingFile?.fileName}"</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {!shareUrl ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Expiration</label>
                                        <Select value={shareExp} onValueChange={setShareExp}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Heure</SelectItem>
                                                <SelectItem value="24">24 Heures</SelectItem>
                                                <SelectItem value="168">7 Jours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Mot de passe</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                            <Input 
                                                type="password" 
                                                placeholder="Optionnel" 
                                                className="h-10 pl-9" 
                                                value={sharePass}
                                                onChange={(e) => setSharePass(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full gap-2 h-11" onClick={handleCreateShareLink} disabled={isCreatingLink}>
                                    {isCreatingLink ? <Loader2 className="animate-spin" size={16} /> : <LinkIcon size={16} />}
                                    Créer le lien sécurisé
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-600">
                                    <Check size={20} />
                                    <div className="text-sm font-medium">Lien prêt !</div>
                                </div>
                                <div className="flex gap-2">
                                    <Input value={shareUrl} readOnly className="bg-muted" />
                                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </Button>
                                </div>

                                {afficherQr && (
                                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-border animate-in zoom-in duration-300">
                                        <QRCodeSVG 
                                            value={shareUrl} 
                                            size={180}
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: "/favicon.png",
                                                x: undefined,
                                                y: undefined,
                                                height: 30,
                                                width: 30,
                                                excavate: true,
                                            }}
                                        />
                                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scannez pour télécharger</p>
                                    </div>
                                )}

                                <p className="text-[10px] text-muted-foreground text-center">
                                    Le lien expirera automatiquement selon le délai choisi.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Single Delete Dialog */}
            <Dialog open={!!deletingFile} onOpenChange={(open) => !open && setDeletingFile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le fichier</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{deletingFile?.fileName}" ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="ghost" onClick={() => setDeletingFile(null)} disabled={isProcessingDelete}>Annuler</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isProcessingDelete}>
                            {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Batch Delete Dialog */}
            <Dialog open={isBatchDeletingOpen} onOpenChange={setIsBatchDeletingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la sélection</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer les {selectedIds.length} fichiers sélectionnés ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="ghost" onClick={() => setIsBatchDeletingOpen(false)} disabled={isProcessingDelete}>Annuler</Button>
                        <Button variant="destructive" onClick={handleBatchDelete} disabled={isProcessingDelete}>
                            {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tout supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}