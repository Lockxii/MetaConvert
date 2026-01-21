"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@radix-ui/react-label";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { cn } from "@/lib/utils";
import { Download, Layers, Maximize2, RotateCw, Wand2, ArrowRight, Crop, Minimize2, FlipHorizontal, FlipVertical, Sparkles, ImageOff, Type, Check, Shield } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop as ReactCropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; 
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolButton } from "@/components/dashboard/ToolButton"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareDialog } from "@/components/dashboard/ShareDialog";

const tools = [
  { id: "convert", label: "Convertir", icon: Type, color: "text-blue-500", bg: "bg-blue-500/10", description: "Changez le format de votre image (PNG, JPG, WEBP)." },
  { id: "crop", label: "Rogner", icon: Crop, color: "text-green-500", bg: "bg-green-500/10", description: "Recadrez votre image aux dimensions souhaitées." },
  { id: "transform", label: "Transformer", icon: RotateCw, color: "text-purple-500", bg: "bg-purple-500/10", description: "Pivotez ou retournez votre image." },
  { id: "upscale", label: "Upscale", icon: Maximize2, color: "text-orange-500", bg: "bg-orange-500/10", description: "Augmentez la résolution de votre image (2x, 4x)." },
  { id: "enhance", label: "Sublimer", icon: Wand2, color: "text-pink-500", bg: "bg-pink-500/10", description: "Améliorez le contraste et la netteté." },
];

export default function ImageToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageSrc, setImageSrc] = useState("");
  
  // Share state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastProcessedBlob, setLastProcessedBlob] = useState<Blob | null>(null);
  const [lastProcessedFileName, setLastProcessedFileName] = useState("");

  // Processing state
  const { processFiles, loading: processing, progress, batchProgress } = useFileProcessor({
    apiEndpoint: "/api/image/process", 
    onSuccess: (blob, fileName) => {
      setLastProcessedBlob(blob);
      setLastProcessedFileName(fileName);
      // We only show share dialog for the last file or single files
      if (batchProgress.current === batchProgress.total || batchProgress.total === 1) {
          setShowShareDialog(true);
      }
    },
    onError: (error) => {
      toast.error(`Erreur : ${error}`);
    },
  });

  // Tool specific states
  const [targetFormat, setTargetFormat] = useState("png");
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  
  // Crop & Transform states
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<ReactCropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState(1); // Zoom for crop view

  useEffect(() => {
    if (selectedFiles.length === 0) {
        setImageSrc("");
        return;
    }
    // Only preview the FIRST file for crop/transform
    const reader = new FileReader();
    reader.addEventListener("load", () => setImageSrc(reader.result?.toString() || ""));
    reader.readAsDataURL(selectedFiles[0]);
  }, [selectedFiles]);

  const activeTool = tools.find(t => t.id === activeToolId);

  const isBatchTool = activeToolId === "convert" || activeToolId === "upscale" || activeToolId === "enhance";

  // Handlers
  const handleProcess = async () => {
    if (selectedFiles.length === 0 || !activeToolId) return;

    if (activeToolId === "convert") {
        await processFiles(selectedFiles, { tool: "convert", format: targetFormat });
    } else if (activeToolId === "upscale") {
        await processFiles(selectedFiles, { tool: "upscale", factor: upscaleFactor });
    } else if (activeToolId === "enhance") {
        await processFiles(selectedFiles, { tool: "enhance", sharpen: "true", contrast: "true" });
    } else if (activeToolId === "crop" || activeToolId === "transform") {
        onDownloadCropClick(); 
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const onRotateClick = () => setRotation((prev) => (prev + 90) % 360);
  const onFlipHorizontalClick = () => setScaleX((prev) => prev === 1 ? -1 : 1);
  const onFlipVerticalClick = () => setScaleY((prev) => prev === 1 ? -1 : 1);

  const onDownloadCropClick = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
        // If no crop, maybe we just want to apply transform?
        // Use full image as crop if no crop set?
        toast.error("Veuillez définir une zone de recadrage ou valider la transformation.");
        return;
    }

    await canvasPreview(
      image,
      previewCanvas,
      completedCrop,
      scale, // This scale is zoom, not image scale
      rotation,
      scaleX,
      scaleY
    );

    const blob = await new Promise<Blob | null>((resolve) => previewCanvas.toBlob(resolve, 'image/png'));
    if (blob) {
        const fileName = `edited_${selectedFiles[0]?.name || 'image'}.png`;
        
        // 1. Local Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 2. Upload to Cloud
        const formData = new FormData();
        formData.append("file", new File([blob], fileName, { type: "image/png" }));
        formData.append("tool", activeToolId || "edit");
        
        try {
            await fetch("/api/dashboard/cloud/save", { method: "POST", body: formData });
            toast.success("Image traitée et sauvegardée sur le Cloud !");
        } catch (e) {
            console.error("Cloud save error:", e);
            toast.error("Image téléchargée mais erreur lors de la sauvegarde Cloud.");
        }
        
        // Trigger share dialog
        setLastProcessedBlob(blob);
        setLastProcessedFileName(fileName);
        setShowShareDialog(true);
    }
  };


  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Outils Image</h1>
        <p className="text-muted-foreground">Transformez, améliorez et convertissez vos images.</p>
      </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setSelectedFiles([]); 
                    setRotation(0);
                    setScaleX(1);
                    setScaleY(1);
                    setCrop(undefined);
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

       {/* Workspace Area */}
       {activeToolId && activeTool && (
         <div className="bg-card border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                 <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 <h2 className="text-lg font-bold text-foreground">{activeTool.label}</h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <FileUploader 
                        onFileChange={setSelectedFiles}
                        acceptedFileTypes={{'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.heic', '.heif', '.tiff', '.bmp', '.ico', '.tga', '.jp2', '.pcx', '.xpm', '.sgi', '.dpx', '.ppm', '.eps', '.psd', '.raw']}}
                        label={`Déposez vos images pour ${activeTool.label.toLowerCase()}`}
                        multiple={isBatchTool}
                    />
                    
                    {selectedFiles.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg border border-primary/20 animate-in fade-in">
                            <Check size={16} />
                            <span className="text-sm font-medium">{selectedFiles.length} fichier(s) prêt(s)</span>
                        </div>
                    )}
                    
                    {/* Preview Area for Crop/Transform */}
                    {(activeToolId === "crop" || activeToolId === "transform") && imageSrc && (
                        <div className="mt-4 bg-muted/50 rounded-lg p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
                             <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                             >
                                <img
                                    ref={imgRef}
                                    alt="Source"
                                    src={imageSrc}
                                    onLoad={onImageLoad}
                                    style={{ transform: `scale(${scale * scaleX}, ${scale * scaleY}) rotate(${rotation}deg)` }}
                                    className="max-w-full h-auto block"
                                />
                             </ReactCrop>
                        </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-6 p-6 bg-muted/30 rounded-xl border border-border">
                     <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Paramètres</h3>

                        {activeToolId === "convert" && (
                            <div className="space-y-2">
                                <Label className="text-foreground">Format de sortie</Label>
                                <Select onValueChange={setTargetFormat} value={targetFormat}>
                                    <SelectTrigger className="bg-card border-border">
                                        <SelectValue placeholder="Sélectionner format" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[350px]">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Standards Web</div>
                                        <SelectItem value="webp">WEBP (Plus performant)</SelectItem>
                                        <SelectItem value="png">PNG (Transparence)</SelectItem>
                                        <SelectItem value="jpeg">JPEG (Photo)</SelectItem>
                                        <SelectItem value="gif">GIF (Animé)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">Pro & Print</div>
                                        <SelectItem value="avif">AVIF (Ultra-compression)</SelectItem>
                                        <SelectItem value="heic">HEIC (Apple iPhone)</SelectItem>
                                        <SelectItem value="tiff">TIFF (Impression)</SelectItem>
                                        <SelectItem value="pdf">PDF (Document)</SelectItem>
                                        <SelectItem value="eps">EPS (Vectoriel/Print)</SelectItem>
                                        <SelectItem value="psd">PSD (Photoshop)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">Software & Legacy</div>
                                        <SelectItem value="bmp">BMP (Bitmap)</SelectItem>
                                        <SelectItem value="ico">ICO (Favicon)</SelectItem>
                                        <SelectItem value="tga">TGA (Targa)</SelectItem>
                                        <SelectItem value="jp2">JP2 (JPEG 2000)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">Spécialisés</div>
                                        <SelectItem value="pcx">PCX (Paintbrush)</SelectItem>
                                        <SelectItem value="xpm">XPM (X11 Pixmap)</SelectItem>
                                        <SelectItem value="sgi">SGI (Silicon Graphics)</SelectItem>
                                        <SelectItem value="dpx">DPX (Cinéma)</SelectItem>
                                        <SelectItem value="ppm">PPM (Portable Pixel)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeToolId === "upscale" && (
                            <div className="space-y-2">
                                <Label className="text-foreground">Facteur d'agrandissement ({upscaleFactor}x)</Label>
                                <Slider
                                    min={1.5}
                                    max={4}
                                    step={0.5}
                                    value={upscaleFactor}
                                    onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {activeToolId === "crop" && (
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Ratio d'aspect</Label>
                                    <Select onValueChange={(val) => setAspect(val === "none" ? undefined : Number(val))}>
                                        <SelectTrigger className="bg-card border-border">
                                            <SelectValue placeholder="Libre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Libre</SelectItem>
                                            <SelectItem value="1">1:1 (Carré)</SelectItem>
                                            <SelectItem value="1.7777777777777777">16:9 (Écran large)</SelectItem>
                                            <SelectItem value="0.75">3:4</SelectItem>
                                            <SelectItem value="0.6666666666666666">2:3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Zoom Prévisualisation</Label>
                                    <Slider
                                        min={0.5}
                                        max={2}
                                        step={0.1}
                                        value={scale}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                             </div>
                        )}

                        {activeToolId === "transform" && (
                            <div className="grid grid-cols-2 gap-3">
                                <ToolButton icon={RotateCw} onClick={onRotateClick} label="Rotation +90°" />
                                <ToolButton icon={FlipHorizontal} onClick={onFlipHorizontalClick} label="Miroir H" />
                                <ToolButton icon={FlipVertical} onClick={onFlipVerticalClick} label="Miroir V" />
                            </div>
                        )}
                     </div>
                     
                     <div className="flex-1" />

                     <Button 
                        size="lg" 
                        onClick={handleProcess} 
                        disabled={selectedFiles.length === 0 || processing}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {processing 
                            ? (batchProgress.total > 1 
                                ? `Traitement ${batchProgress.current}/${batchProgress.total}...` 
                                : "Traitement...") 
                            : (activeToolId === "crop" || activeToolId === "transform" ? "Appliquer & Télécharger" : "Lancer le traitement")} 
                        {!processing && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                 </div>
             </div>
             
             {/* Hidden canvas for processing */}
             <canvas
                ref={previewCanvasRef}
                style={{
                  display: "none", 
                }}
              />
         </div>
       )}

       <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Partager le fichier</DialogTitle>
            </DialogHeader>
            <ShareDialog 
              file={lastProcessedBlob} 
              fileName={lastProcessedFileName} 
              onClose={() => setShowShareDialog(false)} 
            />
          </DialogContent>
       </Dialog>
    </div>
  );
}

// Updated canvasPreview to handle flips
async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
  scaleX = 1,
  scaleY = 1,
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const naturalScaleX = image.naturalWidth / image.width;
  const naturalScaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * naturalScaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * naturalScaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * naturalScaleX;
  const cropY = crop.y * naturalScaleY;

  const rotateRads = rotate * Math.PI / 180;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scaleX, scaleY); // Apply flip
  ctx.translate(-centerX, -centerY);
  
  ctx.drawImage(
    image,
    cropX,
    cropY,
    crop.width * naturalScaleX,
    crop.height * naturalScaleY,
    0,
    0,
    crop.width * naturalScaleX,
    crop.height * naturalScaleY,
  );

  ctx.restore();
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}