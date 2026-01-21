"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Lock, FileText, AlertCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SharePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setLinkInfo(data);
      })
      .catch(() => setError("Erreur lors de la récupération du lien"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/share/${id}`, {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (res.ok) {
        const a = document.createElement("a");
        a.href = data.downloadUrl;
        a.download = linkInfo.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Téléchargement démarré");
      } else {
        toast.error(data.error || "Accès refusé");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
            <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Lien Indisponible</h1>
        <p className="text-muted-foreground text-center max-w-md">
            Ce lien de partage a expiré ou est invalide. Les fichiers partagés sur MetaConvert sont éphémères pour votre sécurité.
        </p>
        <Button className="mt-8" asChild>
            <a href="/">Retour à l'accueil</a>
        </Button>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <FileText size={32} />
          </div>
          <CardTitle className="text-2xl">Fichier Partagé</CardTitle>
          <CardDescription>Quelqu'un vous a envoyé un fichier via MetaConvert</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground truncate">{linkInfo.fileName}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>Expire le {new Date(linkInfo.expiresAt).toLocaleString()}</span>
            </div>
          </div>

          {linkInfo.hasPassword && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock size={14} /> Mot de passe requis
              </label>
              <Input 
                type="password" 
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg font-bold gap-2" 
            onClick={handleDownload}
            disabled={verifying || (linkInfo.hasPassword && !password)}
          >
            {verifying ? <Loader2 className="animate-spin" /> : <Download size={20} />}
            Télécharger le fichier
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            Sécurisé par MetaConvert
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
