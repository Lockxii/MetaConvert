"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Camera, ArrowRight, Loader2, FileText, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function WebToolsPage() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"jpeg" | "pdf">("jpeg");
  const [loading, setLoading] = useState(false);
  const [activeToolId, setActiveToolId] = useState("capture"); // Only one tool for now

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
        
        const fileName = `capture_${Date.now()}.${format === "jpeg" ? "jpg" : "pdf"}`;
        
        // Auto download
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        toast.success("Capture réalisée avec succès !", { id: toastId });

    } catch (e: any) {
        console.error(e);
        toast.error(e.message, { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Outils Web</h1>
        <p className="text-muted-foreground">Capturez des sites web en image ou PDF.</p>
      </div>

       <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
         {/* Tool Selection (simplified as only one for now) */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
             <button
                key="capture"
                onClick={() => setActiveToolId("capture")}
                className={cn(
                   "p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:shadow-md relative overflow-hidden",
                   activeToolId === "capture"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                )}
             >
                <div className={cn("p-2 rounded-lg bg-blue-500/10")}>
                   <Globe className={cn("h-6 w-6 text-blue-500")} />
                </div>
                <span className="text-sm font-medium text-foreground">Capture URL</span>
                {activeToolId === "capture" && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                        <Check size={12} />
                    </div>
                )}
             </button>
         </div>


         <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL à capturer</label>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                   <Globe className="text-muted-foreground" />
                   <Input 
                      placeholder="https://example.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-card border-border flex-1"
                   />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Format de sortie</label>
                <Select onValueChange={(val: "jpeg" | "pdf") => setFormat(val)} value={format}>
                    <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Sélectionner format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button 
               size="lg"
               onClick={handleCapture}
               disabled={!url || loading}
               className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2" />}
               {loading ? `Capture en cours (${format.toUpperCase()})...` : `Capturer en ${format.toUpperCase()}`}
            </Button>
         </div>
      </div>
    </div>
  );
}