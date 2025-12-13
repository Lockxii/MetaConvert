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
        <h1 className="text-2xl font-bold text-slate-900">Outils Web</h1>
        <p className="text-slate-500">Capturez des sites web en image ou PDF.</p>
      </div>

       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
         {/* Tool Selection (simplified as only one for now) */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
             <button
                key="capture"
                onClick={() => setActiveToolId("capture")}
                className={cn(
                   "p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:shadow-md relative overflow-hidden",
                   activeToolId === "capture"
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-blue-300"
                )}
             >
                <div className={cn("p-2 rounded-lg bg-blue-50")}>
                   <Globe className={cn("h-6 w-6 text-blue-500")} />
                </div>
                <span className="text-sm font-medium text-slate-700">Capture URL</span>
                {activeToolId === "capture" && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
                        <Check size={12} />
                    </div>
                )}
             </button>
         </div>


         <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">URL à capturer</label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <Globe className="text-slate-400" />
                   <Input 
                      placeholder="https://example.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-white border-slate-200 flex-1"
                   />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Format de sortie</label>
                <Select onValueChange={(val: "jpeg" | "pdf") => setFormat(val)} value={format}>
                    <SelectTrigger className="bg-white">
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
               className="h-12 bg-blue-600 hover:bg-blue-700"
            >
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2" />}
               {loading ? `Capture en cours (${format.toUpperCase()})...` : `Capturer en ${format.toUpperCase()}`}
            </Button>
         </div>
      </div>
    </div>
  );
}