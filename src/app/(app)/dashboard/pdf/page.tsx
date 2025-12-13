"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { cn } from "@/lib/utils";
import { FileText, Lock, Merge, Scissors, Split, ArrowRight, Check, Image as ImageIcon, FileWarning, KeyRound } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


const tools = [
  { id: "merge", label: "Fusionner PDF", icon: Merge, color: "text-blue-500", bg: "bg-blue-50", description: "Combinez plusieurs PDF en un seul document." },
  { id: "split", label: "Diviser PDF", icon: Split, color: "text-purple-500", bg: "bg-purple-50", description: "Extrayez des pages ou divisez un document." },
  { id: "compress", label: "Compresser PDF", icon: Scissors, color: "text-orange-500", bg: "bg-orange-50", description: "Réduisez la taille de vos PDF sans perte." },
  { id: "protect", label: "Protéger PDF", icon: Lock, color: "text-red-500", bg: "bg-red-50", description: "Ajoutez un mot de passe à votre document." },
  { id: "to-word", label: "PDF vers Word", icon: FileText, color: "text-green-500", bg: "bg-green-50", description: "Convertissez votre PDF en document Word modifiable." },
  { id: "to-images", label: "PDF vers Images", icon: ImageIcon, color: "text-cyan-500", bg: "bg-cyan-50", description: "Convertissez chaque page PDF en image." },
];

export default function PDFToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // For merge
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For single file operations
  
  // Tool specific parameters
  const [splitPageNumber, setSplitPageNumber] = useState("");
  const [protectPassword, setProtectPassword] = useState("");


  const { processFile, loading, progress } = useFileProcessor({
    apiEndpoint: "/api/pdf/process",
    onSuccess: () => {
        setSelectedFiles([]);
        setSelectedFile(null);
        setSplitPageNumber("");
        setProtectPassword("");
    }
  });

  const handleProcess = () => {
    if (!activeToolId) {
        toast.error("Veuillez sélectionner un outil.");
        return;
    }

    let fileToSend: File | FormData | null = null;
    let toolParams: Record<string, any> = { tool: activeToolId };

    if (activeToolId === "merge") {
        if (selectedFiles.length < 2) {
            toast.error("Veuillez sélectionner au moins deux PDF à fusionner.");
            return;
        }
        // For multiple files, use a FormData directly. useFileProcessor handles single file primarily.
        // We'll create a custom FormData here.
        const mergeFormData = new FormData();
        selectedFiles.forEach((file, index) => {
            mergeFormData.append(`files`, file); // Append as 'files'
        });
        mergeFormData.append('tool', activeToolId);
        fileToSend = mergeFormData;
    } else {
        if (!selectedFile) {
            toast.error("Veuillez sélectionner un fichier PDF.");
            return;
        }
        fileToSend = selectedFile;
    }

    switch (activeToolId) {
        case "split":
            if (!splitPageNumber) {
                toast.error("Veuillez entrer un numéro de page.");
                return;
            }
            toolParams.pageNumber = parseInt(splitPageNumber);
            break;
        case "protect":
            if (!protectPassword) {
                toast.error("Veuillez entrer un mot de passe pour protéger le PDF.");
                return;
            }
            toolParams.password = protectPassword;
            break;
        case "to-word": // MOCKED in backend
        case "to-images": // MOCKED in backend
        case "compress":
        default:
            break;
    }
    
    // If it's merge, we're doing a custom fetch.
    if (activeToolId === "merge") {
        const toastId = toast.loading("Fusion en cours...");
        fetch("/api/pdf/process", {
            method: "POST",
            body: fileToSend as FormData,
        })
        .then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erreur lors de la fusion.");
            }
            const blob = await res.blob();
            const fileName = `merged_${Date.now()}.pdf`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("PDF fusionné avec succès !", { id: toastId });
            setSelectedFiles([]);
            setSelectedFile(null);
        })
        .catch((error) => {
            console.error(error);
            toast.error(error.message, { id: toastId });
        });
    } else {
        processFile(fileToSend as File, toolParams);
    }
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
       <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Outils PDF</h1>
          <p className="text-slate-500">Sélectionnez un outil et transformez vos documents.</p>
       </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setSelectedFile(null); // Clear file on tool change
                    setSelectedFiles([]);
                }}
                className={cn(
                   "p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:shadow-md relative overflow-hidden",
                   activeToolId === tool.id 
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" 
                      : "border-slate-200 bg-white hover:border-blue-300"
                )}
                title={tool.description}
             >
                <div className={cn("p-2 rounded-lg", tool.bg)}>
                   <tool.icon className={cn("h-6 w-6", tool.color)} />
                </div>
                <span className="text-sm font-medium text-slate-700">{tool.label}</span>
                {activeToolId === tool.id && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
                        <Check size={12} />
                    </div>
                )}
             </button>
          ))}
       </div>

       {/* Workspace Area - Only shown when tool selected */}
       {activeToolId && activeTool && (
         <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 <h2 className="text-lg font-bold text-slate-900">{activeTool.label}</h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                 {activeToolId === "merge" ? (
                    <div className="space-y-4">
                        <FileUploader 
                            key={activeToolId}
                            onFileChange={setSelectedFiles} // Handles multiple files
                            acceptedFileTypes={{'application/pdf': ['.pdf']}}
                            label="Déposez les PDF à fusionner (min. 2)"
                            multiple={true}
                        />
                        {selectedFiles.length > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 animate-in fade-in">
                                <Check size={16} />
                                <span className="text-sm font-medium">{selectedFiles.length} fichiers prêts à fusionner</span>
                            </div>
                        )}
                    </div>
                 ) : (
                    <div className="space-y-4">
                        <FileUploader 
                            key={activeToolId}
                            onFileChange={(files) => setSelectedFile(files[0])} // Handles single file
                            acceptedFileTypes={{'application/pdf': ['.pdf']}}
                            label={`Déposez votre PDF pour ${activeTool.label.toLowerCase()}`}
                        />
                         {selectedFile && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 animate-in fade-in">
                                <Check size={16} />
                                <span className="text-sm font-medium">Fichier prêt : {selectedFile.name}</span>
                            </div>
                         )}
                    </div>
                 )}
                 

                 <div className="flex flex-col justify-center gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="space-y-2">
                        <h3 className="font-semibold text-slate-900">Paramètres</h3>
                        {/* Tool specific parameter inputs */}
                        {activeToolId === "split" && (
                            <Input 
                                type="number" 
                                placeholder="Numéro de page à extraire" 
                                value={splitPageNumber} 
                                onChange={(e) => setSplitPageNumber(e.target.value)} 
                                min="1"
                                className="bg-white"
                            />
                        )}
                        {activeToolId === "protect" && (
                            <div className="space-y-2">
                                <Input 
                                    type="password" 
                                    placeholder="Mot de passe pour le PDF" 
                                    value={protectPassword} 
                                    onChange={(e) => setProtectPassword(e.target.value)} 
                                    className="bg-white"
                                />
                                <p className="text-xs text-slate-500 flex items-center gap-1"><KeyRound size={12} /> Le mot de passe sera appliqué à l'ouverture du PDF.</p>
                            </div>
                        )}

                        {activeToolId === "compress" && (
                             <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex items-center gap-2">
                                <FileWarning size={20} /> La compression est basique via PDF-LIB. Pour une compression avancée, utilisez un outil dédié.
                            </div>
                        )}
                     </div>
                     
                     <div className="flex-1" /> {/* Spacer */}

                     <Button 
                        size="lg" 
                        onClick={handleProcess} 
                        disabled={(activeToolId === "merge" && selectedFiles.length < 2) || (activeToolId !== "merge" && !selectedFile) || loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? `Traitement (${Math.round(progress)}%)` : `Lancer ${activeTool.label.split(' ')[0]} `} <ArrowRight size={18} className="ml-2" />
                    </Button>
                 </div>
             </div>
         </div>
       )}
    </div>
  );
}