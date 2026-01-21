"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { cn } from "@/lib/utils";
import { FileText, Lock, Merge, Scissors, Split, ArrowRight, Check, Image as ImageIcon, FileWarning, KeyRound } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tools = [
  { id: "merge", label: "Fusionner PDF", icon: Merge, color: "text-blue-500", bg: "bg-blue-500/10", description: "Combinez plusieurs PDF en un seul document." },
  { id: "split", label: "Diviser PDF", icon: Split, color: "text-purple-500", bg: "bg-purple-500/10", description: "Extrayez des pages ou divisez un document." },
  { id: "compress", label: "Compresser PDF", icon: Scissors, color: "text-orange-500", bg: "bg-orange-500/10", description: "Réduisez la taille de vos PDF sans perte." },
  { id: "to-images", label: "PDF vers Images", icon: ImageIcon, color: "text-cyan-500", bg: "bg-cyan-500/10", description: "Convertissez chaque page PDF en image haute qualité." },
  { id: "to-word", label: "Extraction Texte", icon: FileText, color: "text-green-500", bg: "bg-green-500/10", description: "Extrayez le texte brut de votre PDF." },
];

export default function PDFToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  
  // Tool specific parameters
  const [splitPageNumber, setSplitPageNumber] = useState("");
  const [protectPassword, setProtectPassword] = useState("");
  const [imageFormat, setImageFormat] = useState("png");


  const { processFiles, loading, progress, batchProgress } = useFileProcessor({
    apiEndpoint: "/api/pdf/process",
    onSuccess: () => {
        // Success feedback is handled by the hook
    }
  });

  const handleProcess = () => {
    if (!activeToolId) {
        toast.error("Veuillez sélectionner un outil.");
        return;
    }

    if (selectedFiles.length === 0) {
        toast.error("Veuillez sélectionner au moins un fichier.");
        return;
    }

    let toolParams: Record<string, any> = { tool: activeToolId };

    if (activeToolId === "merge") {
        if (selectedFiles.length < 2) {
            toast.error("Veuillez sélectionner au moins deux PDF à fusionner.");
            return;
        }
        // Custom logic for merge as it's the only one taking MULTIPLE files in ONE request
        const mergeFormData = new FormData();
        selectedFiles.forEach((file) => mergeFormData.append(`files`, file));
        mergeFormData.append('tool', 'merge');

        const toastId = toast.loading("Fusion en cours...");
        fetch("/api/pdf/process", { method: "POST", body: mergeFormData })
        .then(async (res) => {
            if (!res.ok) throw new Error("Erreur lors de la fusion.");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `merged_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("PDF fusionné !", { id: toastId });
            setSelectedFiles([]);
        })
        .catch(err => toast.error(err.message, { id: toastId }));
        return;
    }

    switch (activeToolId) {
        case "split":
            if (!splitPageNumber) {
                toast.error("Veuillez entrer un numéro de page.");
                return;
            }
            toolParams.pageNumber = parseInt(splitPageNumber);
            break;
        case "to-word": 
        case "to-images": 
            toolParams.format = imageFormat;
            break;
        case "compress":
        default:
            break;
    }
    
    processFiles(selectedFiles, toolParams);
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
       <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Outils PDF</h1>
          <p className="text-muted-foreground">Sélectionnez un outil et transformez vos documents.</p>
       </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setSelectedFiles([]);
                }}
                className={cn(
                   "p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:shadow-md relative overflow-hidden",
                   activeToolId === tool.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border bg-card hover:border-primary/50"
                )}
                title={tool.description}
             >
                <div className={cn("p-2 rounded-lg", tool.bg)}>
                   <tool.icon className={cn("h-6 w-6", tool.color)} />
                </div>
                <span className="text-sm font-medium text-foreground">{tool.label}</span>
                {activeToolId === tool.id && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                        <Check size={12} />
                    </div>
                )}
             </button>
          ))}
       </div>

       {/* Workspace Area - Only shown when tool selected */}
       {activeToolId && activeTool && (
         <div className="bg-card border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                 <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 <h2 className="text-lg font-bold text-foreground">{activeTool.label}</h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FileUploader 
                        key={activeToolId}
                        onFileChange={setSelectedFiles}
                        acceptedFileTypes={{'application/pdf': ['.pdf']}}
                        label={activeToolId === 'merge' ? "Déposez les PDF à fusionner" : `Déposez vos PDF pour ${activeTool.label.toLowerCase()}`}
                        multiple={activeToolId !== 'split'}
                    />
                    {selectedFiles.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg border border-primary/20 animate-in fade-in">
                            <Check size={16} />
                            <span className="text-sm font-medium">{selectedFiles.length} fichier(s) prêt(s)</span>
                        </div>
                    )}
                </div>
                 

                 <div className="flex flex-col justify-center gap-4 p-6 bg-muted/30 rounded-xl border border-border">
                     <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">Paramètres</h3>
                        {/* Tool specific parameter inputs */}
                        {activeToolId === "split" && (
                            <Input 
                                type="number" 
                                placeholder="Numéro de page à extraire" 
                                value={splitPageNumber} 
                                onChange={(e) => setSplitPageNumber(e.target.value)} 
                                min="1"
                                className="bg-card border-border"
                            />
                        )}

                        {activeToolId === "to-images" && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Format d'image</label>
                                <Select onValueChange={setImageFormat} value={imageFormat}>
                                    <SelectTrigger className="bg-card border-border">
                                        <SelectValue placeholder="Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="png">PNG (Sans perte)</SelectItem>
                                        <SelectItem value="webp">WebP (Web)</SelectItem>
                                        <SelectItem value="jpeg">JPEG (Photo)</SelectItem>
                                        <SelectItem value="tiff">TIFF (Print)</SelectItem>
                                        <SelectItem value="bmp">BMP (Bitmap)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeToolId === "compress" && (
                             <div className="p-3 bg-blue-500/10 text-blue-500 text-sm rounded-lg border border-blue-500/20 flex items-center gap-2">
                                <FileWarning size={20} /> La compression est basique.
                            </div>
                        )}
                     </div>
                     
                     <div className="flex-1" /> {/* Spacer */}

                     <Button 
                        size="lg" 
                        onClick={handleProcess} 
                        disabled={selectedFiles.length === 0 || loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    >
                        {loading 
                            ? (batchProgress.total > 1 ? `Traitement ${batchProgress.current}/${batchProgress.total}...` : `Traitement...`) 
                            : `Lancer ${activeTool.label.split(' ')[0]} `} <ArrowRight size={18} className="ml-2" />
                    </Button>
                 </div>
             </div>
         </div>
       )}
    </div>
  );
}