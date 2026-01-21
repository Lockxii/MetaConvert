"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Camera, ArrowRight, Loader2, FileText, Check, Music, Youtube, Video, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const tools = [
    { id: "capture", label: "Capture URL", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", description: "Capturez une page web en Image ou PDF.", platform: "Web", type: "image" },
    { id: "yt-mp3", label: "YouTube MP3", icon: Music, color: "text-red-500", bg: "bg-red-500/10", description: "Audio YouTube vers MP3.", platform: "YouTube", type: "audio" },
    { id: "yt-mp4", label: "YouTube MP4", icon: Youtube, color: "text-red-600", bg: "bg-red-600/10", description: "Vidéo YouTube vers MP4.", platform: "YouTube", type: "video" },
    { id: "tt-mp4", label: "TikTok Vidéo", icon: Video, color: "text-pink-500", bg: "bg-pink-500/10", description: "Vidéo TikTok vers MP4.", platform: "TikTok", type: "video" },
    { id: "tt-mp3", label: "TikTok Audio", icon: Music, color: "text-pink-600", bg: "bg-pink-600/10", description: "Extrayez le son d'un TikTok.", platform: "TikTok", type: "audio" },
];

export default function WebToolsPage() {
  const [activeToolId, setActiveToolId] = useState("capture");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"jpeg" | "pdf">("jpeg");
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    if (!url) {
      toast.error("Veuillez entrer une URL.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Capture en cours...");

    const formData = new FormData();
    formData.append("url", url);
    formData.append("format", format);

    try {
        const res = await fetch("/api/web/capture", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Erreur lors de la capture.");
        }

        const blob = await res.blob();
        downloadBlob(blob, `capture_${Date.now()}.${format === "jpeg" ? "jpg" : "pdf"}`);
        toast.success("Capture réalisée avec succès !", { id: toastId });
    } catch (e: any) {
        toast.error(e.message, { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = async (formatType: "mp3" | "mp4", platform: string) => {
    if (!url) {
        toast.error(`Veuillez entrer une URL ${platform}.`);
        return;
    }
    setLoading(true);
    const toastId = toast.loading(`Téléchargement ${formatType.toUpperCase()} en cours...`);

    try {
        const res = await fetch("/api/web/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, format: formatType, type: platform.toLowerCase() }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Erreur lors du téléchargement.");
        }

        const blob = await res.blob();
        downloadBlob(blob, `${platform.toLowerCase()}_${Date.now()}.${formatType}`);
        toast.success("Téléchargement terminé !", { id: toastId });
    } catch (e: any) {
        toast.error(e.message, { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Outils Web & Réseaux</h1>
        <p className="text-muted-foreground">Téléchargez et capturez du contenu web instantanément.</p>
      </div>

       {/* Tool Selection */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setUrl("");
                }}
                className={cn(
                   "p-3 rounded-xl border transition-all flex flex-col items-center gap-2 hover:shadow-md relative overflow-hidden",
                   activeToolId === tool.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                )}
             >
                <div className={cn("p-2 rounded-lg", tool.bg)}>
                   <tool.icon className={cn("h-5 w-5", tool.color)} />
                </div>
                <div className="text-center">
                    <span className="text-xs font-bold text-foreground block truncate">{tool.label}</span>
                </div>
                {activeToolId === tool.id && (
                    <div className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground">
                        <Check size={10} />
                    </div>
                )}
             </button>
          ))}
       </div>

       <div className="bg-card border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", activeTool?.bg)}>
                    {activeTool && <activeTool.icon className={cn("h-5 w-5", activeTool.color)} />}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">{activeTool?.label}</h2>
                    <p className="text-xs text-muted-foreground">{activeTool?.description}</p>
                </div>
            </div>
         </div>

         <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    URL {activeTool?.platform === "Web" ? "du site" : "du contenu"}
                </label>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border focus-within:border-primary transition-all">
                   {activeTool?.platform === "YouTube" ? <Youtube className="text-red-600" /> : 
                    activeTool?.platform === "TikTok" ? <Share2 className="text-pink-500" /> : 
                    <Globe className="text-blue-500" />}
                   <Input 
                      placeholder={`Collez l'URL ${activeTool?.platform} ici...`} 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-transparent border-none flex-1 focus-visible:ring-0 p-0 text-base"
                   />
                </div>
            </div>

            {activeToolId === "capture" && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Format de sortie</label>
                    <Select onValueChange={(val: "jpeg" | "pdf") => setFormat(val)} value={format}>
                        <SelectTrigger className="bg-card border-border">
                            <SelectValue placeholder="Sélectionner format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jpeg">Image JPEG</SelectItem>
                            <SelectItem value="pdf">Document PDF</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Button 
               size="lg"
               onClick={() => {
                   if (activeToolId === "capture") handleCapture();
                   else if (activeToolId === "yt-mp3") handleDownload("mp3", "YouTube");
                   else if (activeToolId === "yt-mp4") handleDownload("mp4", "YouTube");
                   else if (activeToolId === "tt-mp3") handleDownload("mp3", "TikTok");
                   else if (activeToolId === "tt-mp4") handleDownload("mp4", "TikTok");
               }}
               disabled={!url || loading}
               className={cn(
                   "h-14 font-bold text-lg shadow-xl transition-all active:scale-95",
                   activeTool?.bg.replace('/10', ''),
                   "text-white border-none"
               )}
            >
               {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : activeTool && <activeTool.icon className="mr-2" />}
               {loading 
                ? "Traitement en cours..." 
                : activeToolId === "capture" ? `Capturer en ${format.toUpperCase()}` : `Télécharger le ${activeTool?.type === "audio" ? "MP3" : "MP4"}`}
            </Button>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Check size={20} /></div>
              <p className="text-xs text-muted-foreground">Sans filigrane sur les vidéos TikTok</p>
          </div>
          <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Check size={20} /></div>
              <p className="text-xs text-muted-foreground">Qualité audio maximale (320kbps)</p>
          </div>
          <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Check size={20} /></div>
              <p className="text-xs text-muted-foreground">Compatible YouTube 4K et Vimeo</p>
          </div>
      </div>
    </div>
  );
}