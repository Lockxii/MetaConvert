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
    Shield
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ArchiveToolsPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [archiveName, setArchiveName] = useState("mon_archive.zip");
  const [loading, setLoading] = useState(false);

  const handleCreateArchive = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins un fichier.");
      return;
    }
    if (!password) {
      toast.error("Un mot de passe est requis pour le chiffrement AES-256.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Création de l'archive chiffrée...");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("password", password);
    formData.append("fileName", archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`);

    try {
        const res = await fetch("/api/archive/create", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Erreur lors de la création de l'archive.");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Archive créée et chiffrée avec succès !", { id: toastId });
        setSelectedFiles([]);
        setPassword("");
    } catch (e: any) {
        console.error(e);
        toast.error(e.message, { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-foreground tracking-tight">MetaVault</h1>
        <p className="text-muted-foreground mt-2 text-lg">Créez des archives ZIP ultra-sécurisées avec chiffrement AES-256.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: File Selection */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-[2rem] p-1 overflow-hidden shadow-sm">
                <FileUploader 
                    onFileChange={(files) => setSelectedFiles(prev => [...prev, ...files])}
                    label="Déposez les fichiers à inclure dans le coffre-fort"
                    multiple={true}
                    className="border-none bg-transparent min-h-[300px]"
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileArchive size={16} />
                            Fichiers sélectionnés ({selectedFiles.length})
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 text-[10px] font-black uppercase">
                            Tout vider
                        </Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-[10px] font-bold text-primary border border-border">
                                        {file.name.split('.').pop()?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                    className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="font-black text-xl">Paramètres du Coffre</h2>
                            <p className="text-xs text-muted-foreground">Chiffrement AES-256 activé par défaut</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nom de l'archive</label>
                            <Input 
                                placeholder="nom_archive.zip"
                                value={archiveName}
                                onChange={(e) => setArchiveName(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 border-border focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Mot de passe secret</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input 
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-12 rounded-xl bg-muted/30 border-border focus:border-primary"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic px-1">
                                Ce mot de passe sera requis pour ouvrir le fichier ZIP. Ne le perdez pas !
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            size="lg"
                            onClick={handleCreateArchive}
                            disabled={loading || selectedFiles.length === 0}
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Archive size={20} strokeWidth={3} />}
                            {loading ? "Archivage..." : "Créer le Coffre-Fort"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Security Note */}
            <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                    <Shield size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Protection Maximale</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        MetaConvert utilise l'algorithme AES-256 bit pour protéger vos fichiers. Même nous ne pouvons pas accéder au contenu sans votre mot de passe.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
