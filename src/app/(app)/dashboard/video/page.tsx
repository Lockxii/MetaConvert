"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { Video, Film, Volume2, ArrowRight, Scissors, RotateCcw, Clock, Check, Minimize2, FileVideo, X, Play, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const tools = [
  { id: "convert", label: "Convertir", icon: Film, color: "text-blue-500", bg: "bg-blue-500/10", description: "Convertissez la vidéo vers un autre format." },
  { id: "compress", label: "Compresser", icon: Minimize2, color: "text-purple-500", bg: "bg-purple-500/10", description: "Réduisez la taille de votre vidéo sans perte visible." },
  { id: "extract-audio", label: "Extraire Audio", icon: Volume2, color: "text-orange-500", bg: "bg-orange-500/10", description: "Récupérez la piste audio de votre vidéo." },
  { id: "to-gif", label: "Vidéo vers GIF", icon: RotateCcw, color: "text-red-500", bg: "bg-red-500/10", description: "Créez un GIF animé à partir de votre vidéo." },
  { id: "trim", label: "Découper", icon: Scissors, color: "text-green-500", bg: "bg-green-500/10", description: "Découpez une partie spécifique de la vidéo." },
];

export default function VideoToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isVideoSupported, setIsVideoSupported] = useState(false);
  const [processingResult, setProcessingResult] = useState<{ blob: Blob, fileName: string } | null>(null);

  // Tool specific parameters
  const [targetFormat, setTargetFormat] = useState("mp4"); // Convert
  const [trimStart, setTrimStart] = useState("00:00:00"); // Trim (HH:mm:ss)
  const [trimDuration, setTrimDuration] = useState("00:00:10"); // Trim (HH:mm:ss)
  
  // New Params
  const [compressionPreset, setCompressionPreset] = useState("balanced");
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [gifFps, setGifFps] = useState(10);

  const { processFile, loading, progress } = useFileProcessor({
    apiEndpoint: "/api/video/process",
    onSuccess: (blob, fileName) => {
        toast.success("Traitement terminé avec succès !");
        setProcessingResult({ blob, fileName });
    },
    onError: (err) => {
        toast.error(`Erreur : ${err}`);
    }
  });

  // Handle File Selection
  const handleFileChange = (files: File[]) => {
      if (files && files[0]) {
          const file = files[0];
          setSelectedFile(file);
          setProcessingResult(null); // Clear previous result
          
          // Determine if browser can likely play it
          const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
          const isSupported = supportedTypes.includes(file.type);
          setIsVideoSupported(isSupported);

          // Create URL for preview if supported
          if (isSupported) {
              const url = URL.createObjectURL(file);
              setVideoSrc(url);
          } else {
              setVideoSrc(null);
          }
      }
  };

  const clearFile = () => {
      if (videoSrc) {
          URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(null);
      setSelectedFile(null);
      setIsVideoSupported(false);
      setProcessingResult(null);
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (videoSrc) URL.revokeObjectURL(videoSrc);
      };
  }, [videoSrc]);

  const handleDownloadResult = () => {
    if (!processingResult) return;
    const url = URL.createObjectURL(processingResult.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = processingResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleProcess = () => {
    if (!selectedFile) {
        toast.error("Veuillez sélectionner un fichier vidéo.");
        return;
    }
    if (!activeToolId) {
        toast.error("Veuillez sélectionner un outil.");
        return;
    }
    
    setProcessingResult(null); // Clear previous result before starting

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
        case "compress":
            toolParams.preset = compressionPreset;
            break;
        case "extract-audio":
            toolParams.audioFormat = audioFormat;
            break;
        case "to-gif":
            toolParams.fps = gifFps;
            break;
        default:
            break;
    }
    
    processFile(selectedFile, toolParams);
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Outils Vidéo</h1>
        <p className="text-muted-foreground mt-2 text-lg">Suite complète pour éditer, convertir et optimiser vos vidéos.</p>
      </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setProcessingResult(null);
                    // Do not clear file here to allow tool switching
                    if (tool.id === "trim") {
                        setTrimStart("00:00:00");
                        setTrimDuration("00:00:10");
                    }
                }}
                className={cn(
                   "p-5 rounded-xl border transition-all flex flex-col items-center gap-4 hover:shadow-lg relative overflow-hidden group text-center h-full",
                   activeToolId === tool.id 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2" 
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                )}
             >
                <div className={cn("p-3 rounded-full transition-transform group-hover:scale-110", tool.bg)}>
                   <tool.icon className={cn("h-6 w-6", tool.color)} />
                </div>
                <div>
                    <span className="block text-sm font-semibold text-foreground mb-1">{tool.label}</span>
                    <span className="block text-xs text-muted-foreground line-clamp-2">{tool.description}</span>
                </div>
                
                {activeToolId === tool.id && (
                    <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-sm animate-in zoom-in">
                        <Check size={14} strokeWidth={3} />
                    </div>
                )}
             </button>
          ))}
       </div>

       {/* Workspace Area */}
       {activeToolId && activeTool && (
         <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                 <div className={cn("p-2 rounded-lg", activeTool.bg)}>
                    <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-foreground">{activeTool.label}</h2>
                    <p className="text-sm text-muted-foreground">Configurez les paramètres ci-dessous</p>
                 </div>
             </div>

             <div className="grid lg:grid-cols-12 gap-8">
                 {/* Left Column: File Upload or Preview */}
                 <div className="lg:col-span-7 space-y-4">
                    {!selectedFile ? (
                        <FileUploader 
                            key={activeToolId}
                            onFileChange={handleFileChange}
                            acceptedFileTypes={{'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']}}
                            label={`Déposez votre vidéo pour ${activeTool.label.toLowerCase()}`}
                            className="h-full min-h-[350px]"
                            maxSize={2 * 1024 * 1024 * 1024} // 2GB
                        />
                    ) : (
                        <div className="w-full h-full min-h-[350px] bg-muted/30 rounded-xl border-2 border-border flex flex-col overflow-hidden relative group">
                            {/* Header Bar */}
                            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent z-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={clearFile}
                                    className="shadow-md"
                                >
                                    <X size={16} className="mr-2" /> Changer de fichier
                                </Button>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
                                {isVideoSupported && videoSrc ? (
                                    <video 
                                        src={videoSrc} 
                                        controls 
                                        className="w-full h-full object-contain max-h-[400px] rounded-lg shadow-lg bg-black"
                                    />
                                ) : (
                                    // Fallback UI for non-playable formats (MOV, AVI, etc.)
                                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                        <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <FileVideo size={48} />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2 max-w-md break-words">
                                            {selectedFile.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm">
                                            <span className="font-mono font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            <div className="h-4 w-px bg-border" />
                                            <span className="uppercase">{selectedFile.name.split('.').pop()}</span>
                                        </div>
                                        <div className="mt-8 flex gap-2">
                                             <Button variant="outline" onClick={clearFile}>
                                                <RotateCcw size={16} className="mr-2" /> Changer
                                             </Button>
                                             <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                                                <Check size={16} /> Prêt à traiter
                                             </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Right Column: Settings & Action */}
                 <div className="lg:col-span-5 flex flex-col gap-6">
                     <div className="p-6 bg-muted/30 rounded-xl border border-border flex-1 flex flex-col">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-muted-foreground" />
                            Paramètres
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            {activeToolId === "convert" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground">Format de sortie</Label>
                                        <Select onValueChange={setTargetFormat} value={targetFormat}>
                                            <SelectTrigger className="bg-card w-full border-border">
                                                <SelectValue placeholder="Sélectionner format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mp4">MP4 (Standard)</SelectItem>
                                                <SelectItem value="webm">WebM (Web)</SelectItem>
                                                <SelectItem value="mov">MOV (Apple)</SelectItem>
                                                <SelectItem value="avi">AVI (Legacy)</SelectItem>
                                                <SelectItem value="mkv">MKV (Haute qualité)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Le format MP4 est recommandé pour la compatibilité.</p>
                                    </div>
                                    <Button 
                                        size="lg" 
                                        onClick={handleProcess} 
                                        disabled={!selectedFile || loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                                    >
                                        {loading ? "Traitement..." : "Convertir & Télécharger"}
                                    </Button>
                                </div>
                            )}

                            {activeToolId === "trim" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground">Début (HH:mm:ss)</Label>
                                        <Input 
                                            type="text" 
                                            placeholder="00:00:00" 
                                            value={trimStart} 
                                            onChange={(e) => setTrimStart(e.target.value)} 
                                            className="bg-card border-border font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground">Durée (HH:mm:ss)</Label>
                                        <Input 
                                            type="text" 
                                            placeholder="00:00:10" 
                                            value={trimDuration} 
                                            onChange={(e) => setTrimDuration(e.target.value)} 
                                            className="bg-card border-border font-mono"
                                        />
                                    </div>
                                    <Button 
                                        size="lg" 
                                        onClick={handleProcess} 
                                        disabled={!selectedFile || loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                                    >
                                        {loading ? "Traitement..." : "Découper & Télécharger"}
                                    </Button>
                                </div>
                            )}

                            {activeToolId === "compress" && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-foreground mb-2 block">Choisissez un niveau de compression :</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'quality', label: 'Haute Qualité', desc: 'Fichier plus lourd, meilleure image', icon: Film },
                                            { id: 'balanced', label: 'Équilibré', desc: 'Le meilleur compromis (Recommandé)', icon: Check },
                                            { id: 'size', label: 'Taille Réduite', desc: 'Fichier léger, qualité moindre', icon: Minimize2 },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setCompressionPreset(opt.id);
                                                    if (selectedFile) processFile(selectedFile, { tool: 'compress', preset: opt.id });
                                                    else toast.error("Veuillez sélectionner un fichier d'abord.");
                                                }}
                                                disabled={loading || !selectedFile}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted transition-all text-left group"
                                            >
                                                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg group-hover:bg-purple-500/20">
                                                    <opt.icon size={20} />
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-foreground">{opt.label}</span>
                                                    <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                                                </div>
                                                {loading && compressionPreset === opt.id && <RotateCcw className="animate-spin ml-auto text-purple-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {activeToolId === "extract-audio" && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-foreground mb-2 block">Format d'extraction :</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'mp3', label: 'MP3', desc: 'Standard universel', icon: Volume2 },
                                            { id: 'wav', label: 'WAV', desc: 'Non compressé, haute qualité', icon: Volume2 },
                                            { id: 'aac', label: 'AAC', desc: 'Moderne et efficace', icon: Volume2 },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setAudioFormat(opt.id);
                                                    if (selectedFile) processFile(selectedFile, { tool: 'extract-audio', audioFormat: opt.id });
                                                    else toast.error("Veuillez sélectionner un fichier d'abord.");
                                                }}
                                                disabled={loading || !selectedFile}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted transition-all text-left group"
                                            >
                                                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg group-hover:bg-orange-500/20">
                                                    <opt.icon size={20} />
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-foreground">{opt.label}</span>
                                                    <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                                                </div>
                                                {loading && audioFormat === opt.id && <RotateCcw className="animate-spin ml-auto text-orange-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {activeToolId === "to-gif" && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-foreground mb-2 block">Fluidité du GIF :</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 5, label: '5 FPS', desc: 'Très léger' },
                                            { id: 10, label: '10 FPS', desc: 'Standard' },
                                            { id: 15, label: '15 FPS', desc: 'Fluide' },
                                            { id: 24, label: '24 FPS', desc: 'Cinéma' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setGifFps(opt.id);
                                                    if (selectedFile) processFile(selectedFile, { tool: 'to-gif', fps: opt.id });
                                                    else toast.error("Veuillez sélectionner un fichier d'abord.");
                                                }}
                                                disabled={loading || !selectedFile}
                                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted transition-all text-center group"
                                            >
                                                <span className="font-bold text-lg text-foreground">{opt.label}</span>
                                                <span className="text-xs text-muted-foreground">{opt.desc}</span>
                                                {loading && gifFps === opt.id && <RotateCcw className="animate-spin mt-1 text-red-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-border space-y-3">
                             {processingResult && (
                                <Button 
                                    size="lg"
                                    variant="outline"
                                    onClick={handleDownloadResult}
                                    className="w-full border-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/10 hover:border-green-500/30 animate-in fade-in slide-in-from-top-2"
                                >
                                    <Download size={18} className="mr-2" />
                                    Télécharger le résultat ({processingResult.fileName})
                                </Button>
                            )}
                        </div>
                     </div>
                 </div>
             </div>
         </div>
       )}
    </div>
  );
}