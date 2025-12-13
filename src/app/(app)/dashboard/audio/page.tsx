"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { Music, Mic, ArrowRight, Scissors, Gauge, Clock, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ToolButton } from "@/components/dashboard/ToolButton"; // Import shared ToolButton

const tools = [
  { id: "convert", label: "Convertir Audio", icon: Mic, color: "text-blue-500", bg: "bg-blue-50", description: "Convertissez le fichier audio vers un autre format." },
  { id: "trim", label: "Découper Audio", icon: Scissors, color: "text-purple-500", bg: "bg-purple-50", description: "Découpez une partie spécifique de l'audio." },
  { id: "normalize", label: "Normaliser Audio", icon: Gauge, color: "text-orange-500", bg: "bg-orange-50", description: "Ajustez le volume pour une écoute équilibrée." },
  { id: "speed", label: "Changer Vitesse", icon: Clock, color: "text-green-500", bg: "bg-green-50", description: "Accélérez ou ralentissez l'audio." },
];

export default function AudioToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Tool specific parameters
  const [targetFormat, setTargetFormat] = useState("mp3"); // Convert
  const [trimStart, setTrimStart] = useState("00:00:00"); // Trim (HH:mm:ss)
  const [trimDuration, setTrimDuration] = useState("00:00:10"); // Trim (HH:mm:ss)
  const [speedFactor, setSpeedFactor] = useState("1.0"); // Speed

  const { processFile, loading, progress } = useFileProcessor({
    apiEndpoint: "/api/audio/process",
    onSuccess: () => {
        setSelectedFile(null);
        setTrimStart("00:00:00");
        setTrimDuration("00:00:10");
        setSpeedFactor("1.0");
    }
  });

  const handleProcess = () => {
    if (!selectedFile) {
        toast.error("Veuillez sélectionner un fichier audio.");
        return;
    }
    if (!activeToolId) {
        toast.error("Veuillez sélectionner un outil.");
        return;
    }

    let toolParams: Record<string, any> = { tool: activeToolId };

    switch (activeToolId) {
        case "convert":
            toolParams.format = targetFormat;
            break;
        case "trim":
            if (!trimStart || !trimDuration) {
                toast.error("Veuillez spécifier l'heure de début et la durée.");
                return;
            }
            toolParams.start = trimStart;
            toolParams.duration = trimDuration;
            break;
        case "speed":
            if (!speedFactor) {
                toast.error("Veuillez spécifier un facteur de vitesse.");
                return;
            }
            toolParams.speedFactor = speedFactor;
            break;
        case "normalize":
        default:
            break;
    }
    
    processFile(selectedFile, toolParams);
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Outils Audio</h1>
        <p className="text-slate-500">Transformez vos fichiers audio avec nos outils puissants.</p>
      </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setSelectedFile(null); // Clear file on tool change
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

       {/* Workspace Area */}
       {activeToolId && activeTool && (
         <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 <h2 className="text-lg font-bold text-slate-900">{activeTool.label}</h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                 <FileUploader 
                    key={activeToolId}
                    onFileChange={(files) => setSelectedFile(files[0])}
                    acceptedFileTypes={{'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']}}
                    label={`Déposez votre audio pour ${activeTool.label.toLowerCase()}`}
                 />
                 {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 animate-in fade-in">
                        <Check size={16} />
                        <span className="text-sm font-medium">Fichier prêt : {selectedFile.name}</span>
                    </div>
                 )}

                 <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="space-y-2">
                        <h3 className="font-semibold text-slate-900">Paramètres</h3>
                        {activeToolId === "convert" && (
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 font-medium">Format de sortie</label>
                                <Select onValueChange={setTargetFormat} value={targetFormat}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Sélectionner format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mp3">MP3</SelectItem>
                                        <SelectItem value="wav">WAV</SelectItem>
                                        <SelectItem value="ogg">OGG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {activeToolId === "trim" && (
                            <div className="space-y-3">
                                <label className="text-xs text-slate-500 font-medium">Découpage (HH:mm:ss)</label>
                                <Input 
                                    type="text" 
                                    placeholder="Début (ex: 00:00:10)" 
                                    value={trimStart} 
                                    onChange={(e) => setTrimStart(e.target.value)} 
                                    className="bg-white"
                                />
                                <Input 
                                    type="text" 
                                    placeholder="Durée (ex: 00:00:30)" 
                                    value={trimDuration} 
                                    onChange={(e) => setTrimDuration(e.target.value)} 
                                    className="bg-white"
                                />
                                <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Format : HH:mm:ss</p>
                            </div>
                        )}
                        {activeToolId === "speed" && (
                            <div className="space-y-3">
                                <label className="text-xs text-slate-500 font-medium">Facteur de vitesse</label>
                                <Input 
                                    type="number" 
                                    step="0.1"
                                    placeholder="Ex: 1.5 (plus rapide)" 
                                    value={speedFactor} 
                                    onChange={(e) => setSpeedFactor(e.target.value)} 
                                    className="bg-white"
                                />
                                <p className="text-xs text-slate-500">1.0 = normal, 0.5 = 2x plus lent, 2.0 = 2x plus rapide.</p>
                            </div>
                        )}
                     </div>
                     
                     <div className="flex-1" /> {/* Spacer */}

                     <Button 
                        size="lg" 
                        onClick={handleProcess} 
                        disabled={!selectedFile || loading}
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