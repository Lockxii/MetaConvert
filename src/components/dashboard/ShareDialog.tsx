"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Share2, Loader2, Link as LinkIcon, Lock } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  file: Blob | null;
  fileName: string;
  onClose: () => void;
}

export function ShareDialog({ file, fileName, onClose }: ShareDialogProps) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Settings
  const [expiration, setExpiration] = useState("24");
  const [password, setPassword] = useState("");

  const handleCreateLink = async () => {
    if (!file) return;
    setSharing(true);

    const formData = new FormData();
    // Le Blob doit être transformé en File pour l'API
    const fileToUpload = new File([file], fileName, { type: file.type });
    formData.append("file", fileToUpload);
    formData.append("expiration", expiration);
    if (password) formData.append("password", password);

    try {
      const res = await fetch("/api/share/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setShareUrl(data.shareUrl);
        toast.success("Lien de partage créé !");
      } else {
        toast.error(data.error || "Échec de la création du lien");
      }
    } catch (e) {
      toast.error("Erreur réseau");
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info("Lien copié !");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {!shareUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Share2 size={18} />
            <span>Générer un lien éphémère</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Expiration</label>
                <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger className="h-9">
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Mot de passe (Optionnel)</label>
                <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                    <Input 
                        type="password" 
                        placeholder="Secret" 
                        className="h-9 pl-8" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleCreateLink} disabled={sharing}>
            {sharing ? <Loader2 className="animate-spin" size={16} /> : <LinkIcon size={16} />}
            Créer le lien sécurisé
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-600">
            <Check size={20} />
            <div className="text-sm font-medium">Lien prêt et sécurisé !</div>
          </div>
          
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="bg-muted" />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </Button>
          </div>
          
          <p className="text-[10px] text-muted-foreground text-center italic">
            Ce lien expirera automatiquement dans {expiration === "1" ? "1 heure" : expiration === "24" ? "24 heures" : "7 jours"}.
          </p>
        </div>
      )}
    </div>
  );
}
