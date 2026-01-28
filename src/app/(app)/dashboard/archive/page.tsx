"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Archive, 
    Lock, 
    ShieldCheck, 
    ArrowRight, 
    Loader2, 
    Check, 
    X,
    FileArchive,
    Shield,
    Zap,
    Unlock
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

export default function ArchiveToolsPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [archiveName, setArchiveName] = useState("mon_archive.zip");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"standard" | "secure">("standard");

  const handleCreateArchive = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins un fichier.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(mode === "secure" ? "Création du coffre-fort (Serveur)..." : "Création de l'archive (Navigateur)...");

    try {
        let finalBlob: Blob;
        const finalName = archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`;

        if (mode === "standard") {
            // --- MODE STANDARD (CLIENT-SIDE / JSZIP) ---
            // Ultra-rapide, pas de limite de taille, compatible Windows natif
            const zip = new JSZip();
            selectedFiles.forEach(f => zip.file(f.name, f));
            finalBlob = await zip.generateAsync({ type: "blob" });
            
            // Sauvegarder dans le Cloud (via API save)
            const formData = new FormData();
            formData.append("file", new File([finalBlob], finalName, { type: "application/zip" }));
            formData.append("tool", "archive");
            await fetch("/api/dashboard/cloud/save", { method: "POST", body: formData });

        } else {
            // --- MODE SECURE (SERVER-SIDE / AES-256) ---
            if (!password) {
                toast.error("Un mot de passe est requis pour le mode sécurisé.");
                setLoading(false);
                toast.dismiss(toastId);
                return;
            }

            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append("files", file));
            formData.append("password", password);
            formData.append("fileName", finalName);

            const res = await fetch("/api/archive/create", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erreur serveur.");
            }
            finalBlob = await res.blob();
        }

        // Téléchargement
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(mode === "secure" ? "Coffre-fort créé !" : "Archive ZIP créée !", { id: toastId });
        setSelectedFiles([]);
        setPassword("");
    } catch (e: any) {
        console.error(e);
        toast.error(e.message, { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-[1000] text-foreground tracking-tighter uppercase">MetaArchive</h1>
        <p className="text-muted-foreground text-lg italic">Gérez vos fichiers avec élégance et sécurité.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: File Selection */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-[2.5rem] p-1 overflow-hidden shadow-sm">
                <FileUploader 
                    onFileChange={(files) => setSelectedFiles(prev => [...prev, ...files])}
                    label="Glissez vos fichiers ici"
                    multiple={true}
                    className="border-none bg-transparent min-h-[350px]"
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-black text-xs uppercase tracking-widest text-foreground flex items-center gap-2">
                                <FileArchive size={16} className="text-primary" />
                                File d'attente
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                {selectedFiles.length} fichiers • {formatSize(totalSize)}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 rounded-xl text-[10px] font-black uppercase">
                            Tout vider
                        </Button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto pr-2 no-scrollbar space-y-2">
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-[10px] font-black text-primary border border-border shadow-sm">
                                        {file.name.split('.').pop()?.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate max-w-[250px]">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">{formatSize(file.size)}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                    className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-border bg-card p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative space-y-8">
                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border">
                        <button 
                            onClick={() => setMode("standard")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "standard" ? "bg-background text-primary shadow-sm shadow-primary/5" : "text-slate-500 hover:text-foreground"
                            )}
                        >
                            <Zap size={14} /> Classique
                        </button>
                        <button 
                            onClick={() => setMode("secure")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "secure" ? "bg-background text-primary shadow-sm shadow-primary/5" : "text-slate-500 hover:text-foreground"
                            )}
                        >
                            <Lock size={14} /> Sécurisé
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nom de l'archive</label>
                            <Input 
                                placeholder="mon_projet.zip"
                                value={archiveName}
                                onChange={(e) => setArchiveName(e.target.value)}
                                className="h-14 rounded-[1.2rem] bg-muted/30 border-border focus:ring-primary/50 font-bold"
                            />
                        </div>

                        {mode === "secure" ? (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Shield size={12} className="text-emerald-500" /> Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input 
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 pl-12 rounded-[1.2rem] bg-muted/30 border-border focus:ring-primary/50 font-bold"
                                    />
                                </div>
                                <p className="text-[9px] text-muted-foreground italic px-1 leading-relaxed">
                                    Ce mode utilise le chiffrement AES-256. 
                                    <br />⚠️ Incompatible avec l'explorateur Windows natif. Utilisez 7-Zip.
                                </p>
                            </div>
                        ) : (
                            <div className="p-6 rounded-[1.5rem] bg-blue-500/5 border border-blue-500/10 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                                <Unlock className="text-blue-500 shrink-0" size={24} />
                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                    Mode standard : compatible avec tous les systèmes (Windows, Mac, Linux). Idéal pour les fichiers volumineux.
                                </p>
                            </div>
                        )}
                    </div>

                    <Button 
                        size="lg"
                        onClick={handleCreateArchive}
                        disabled={loading || selectedFiles.length === 0}
                        className="w-full h-16 rounded-[1.5rem] font-[1000] uppercase text-sm tracking-[0.2em] gap-3 shadow-2xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Archive size={20} strokeWidth={3} />}
                        {loading ? "Calcul..." : "Lancer l'archivage"}
                    </Button>
                </div>
            </Card>

            <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Technologie MetaArchive</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    Toutes les archives créées sont automatiquement synchronisées avec votre Cloud MetaConvert pour un accès universel.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}