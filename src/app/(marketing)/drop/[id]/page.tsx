"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    UploadCloud, 
    Lock, 
    FileText, 
    AlertCircle, 
    Clock, 
    Loader2, 
    CheckCircle2, 
    X,
    FolderUp,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export default function PublicDropPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/drop/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
            if (data.error.includes("désactivé")) {
                setLinkInfo({ ...data, isClosed: true });
            } else {
                setError(data.error);
            }
        }
        else setLinkInfo(data);
      })
      .catch(() => setError("Erreur lors de la récupération du lien"))
      .finally(() => setLoading(false));
  }, [id]);

  const onDrop = (acceptedFiles: File[]) => {
    if (linkInfo?.isClosed) return;
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: linkInfo?.isClosed 
  });

  const handleUpload = async () => {
    if (files.length === 0 || linkInfo?.isClosed) return;
    setUploading(true);
    
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    if (password) formData.append("password", password);

    try {
      const res = await fetch(`/api/drop/${id}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFiles([]);
        toast.success("Fichiers déposés !");
      } else {
        toast.error(data.error || "Échec du dépôt");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mb-8 shadow-xl">
            <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-black mb-4">Lien indisponible</h1>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Ce lien de dépôt a expiré ou n'existe pas. Veuillez demander un nouveau lien à votre contact.
        </p>
        <Button className="mt-10 rounded-2xl h-12 px-8 font-bold" asChild>
            <a href="/">Retour à MetaConvert</a>
        </Button>
    </div>
  );

  if (linkInfo?.isClosed) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-500/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 shadow-2xl">
            <Lock size={56} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black mb-4">Dépôt fermé</h1>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Un fichier a déjà été déposé pour cette demande. Ce lien est désormais verrouillé pour des raisons de sécurité.
        </p>
        <div className="mt-10">
            <Button className="rounded-2xl h-12 px-8 font-bold" asChild>
                <a href="/">Découvrir MetaConvert</a>
            </Button>
        </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 shadow-2xl">
            <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black mb-4">Merci Arthur !</h1>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Vos fichiers ont été déposés en toute sécurité dans l'espace cloud.
        </p>
        <div className="mt-10 space-x-4">
            <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold" onClick={() => setSuccess(false)}>
                Déposer d'autres fichiers
            </Button>
            <Button className="rounded-2xl h-12 px-8 font-bold" asChild>
                <a href="/">Découvrir MetaConvert</a>
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <FolderUp size={14} /> Dépôt Sécurisé
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{linkInfo.title}</h1>
            {linkInfo.description && <p className="text-muted-foreground text-lg">{linkInfo.description}</p>}
        </div>

        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none rounded-[3rem] overflow-hidden bg-white dark:bg-card">
          <CardContent className="p-8 md:p-12 space-y-8">
            {linkInfo.hasPassword && (
                <div className="space-y-3 p-6 bg-slate-50 dark:bg-muted/30 rounded-3xl border border-border">
                    <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <Lock size={16} /> Ce dépôt est protégé
                    </label>
                    <Input 
                        type="password" 
                        placeholder="Entrez le mot de passe requis"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white dark:bg-background h-12 rounded-2xl border-border"
                    />
                </div>
            )}

            <div 
                {...getRootProps()} 
                className={cn(
                    "relative border-4 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] text-center",
                    isDragActive ? "border-primary bg-primary/5" : "border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/10 hover:bg-slate-100/50",
                    files.length > 0 ? "border-emerald-200 bg-emerald-50/20" : ""
                )}
            >
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-background shadow-xl flex items-center justify-center text-primary mb-6">
                    <UploadCloud size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black mb-2">
                    {isDragActive ? "Relâchez vos fichiers !" : "Déposez vos documents ici"}
                </h3>
                <p className="text-muted-foreground max-w-xs leading-relaxed">
                    Cliquez pour parcourir ou glissez-déposez n'importe quel type de fichier.
                </p>
            </div>

            {files.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{files.length} fichiers sélectionnés</span>
                        <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-red-500 font-bold hover:bg-red-50">Réinitialiser</Button>
                    </div>
                    <div className="grid gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-background flex items-center justify-center text-xs font-black text-primary border border-border">
                                        {file.name.split('.').pop()?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-2 hover:bg-red-100 text-muted-foreground hover:text-red-500 rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <Button 
                        className="w-full h-16 rounded-[2rem] text-xl font-black gap-3 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]" 
                        onClick={handleUpload}
                        disabled={uploading || (linkInfo.hasPassword && !password)}
                    >
                        {uploading ? <Loader2 className="animate-spin" /> : <FolderUp size={24} strokeWidth={2.5} />}
                        {uploading ? "Envoi en cours..." : "Lancer le dépôt sécurisé"}
                    </Button>
                </div>
            )}

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Shield size={12} />
                    Chiffrement de bout en bout
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={12} />
                    Expire le {new Date(linkInfo.expiresAt).toLocaleDateString()}
                </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground font-medium">
            Propulsé par <span className="text-foreground font-bold">MetaConvert</span> • Solution de transfert éphémère.
        </p>
      </div>
    </div>
  );
}
