"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";


interface UserSettings {
    defaultOutputFormat: string;
    receiveEmailNotifications: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/settings/user");
        if (res.ok) {
          const data = await res.json();
          // We filter out 'theme' from the local state as it's not managed here anymore
          setSettings({
              defaultOutputFormat: data.defaultOutputFormat,
              receiveEmailNotifications: data.receiveEmailNotifications
          });
        } else {
          toast.error("Échec du chargement des paramètres utilisateur.");
        }
      } catch (e) {
        console.error(e);
        toast.error("Erreur de connexion au serveur pour les paramètres.");
      } finally {
        setLoadingSettings(false);
      }
    }

    if (session?.user?.id) {
        fetchSettings();
    }
  }, [session]);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Paramètres sauvegardés avec succès !");
      } else {
        toast.error("Échec de la sauvegarde des paramètres.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur de connexion au serveur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingSettings) {
      return (
          <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (!session?.user?.id) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Chargement de la session utilisateur...</p>
        </div>
      )
  }

  if (!settings) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <p>Impossible de charger les paramètres. Veuillez réessayer.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Recharger</Button>
          </div>
      )
  }


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos préférences utilisateur.</p>
        </div>

        {/* User Profile Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Profil Utilisateur</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" value={session.user.name || ""} disabled className="bg-muted/30" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={session.user.email || ""} disabled className="bg-muted/30" />
                </div>
            </div>
        </div>

        {/* General Preferences */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Préférences Générales</h2>
            
            <div className="grid grid-cols-2 gap-4 items-center">
                <Label htmlFor="defaultOutputFormat">Format de sortie par défaut</Label>
                <Select value={settings.defaultOutputFormat} onValueChange={(value) => setSettings(prev => prev ? { ...prev, defaultOutputFormat: value } : null)}>
                    <SelectTrigger className="w-full bg-card border-border">
                        <SelectValue placeholder="Sélectionner format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="mp3">MP3</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Notifications par email</Label>
                <Switch 
                    checked={settings.receiveEmailNotifications} 
                    onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, receiveEmailNotifications: checked } : null)} 
                />
            </div>
            
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Sauvegarder les modifications
            </Button>
        </div>
    </div>
  )
}