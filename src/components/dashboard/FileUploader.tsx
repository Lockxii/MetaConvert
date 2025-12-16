import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FileIcon, Video, Music, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileChange: (files: File[]) => void; // Changed to files[]
  acceptedFileTypes?: Record<string, string[]>;
  maxSize?: number; // in bytes
  label?: string;
  className?: string;
  multiple?: boolean; // New prop
}

export function FileUploader({ 
  onFileChange, 
  acceptedFileTypes, 
  maxSize = 50 * 1024 * 1024, // 50MB default
  label = "Déposez votre fichier ici",
  className,
  multiple = false // Default to single file
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]); // Changed to files[]
  const [previews, setPreviews] = useState<string[]>([]); // Changed to previews[]

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
            toast.error(`Le fichier est trop volumineux. Max: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
        } else if (rejection.errors[0].code === "file-invalid-type") {
            toast.error("Type de fichier non supporté.");
        } else {
            toast.error(rejection.errors[0].message);
        }
        return;
    }

    setFiles(acceptedFiles);
    onFileChange(acceptedFiles);

    // Create previews
    const newPreviews: string[] = [];
    acceptedFiles.forEach(file => {
      if (file.type.startsWith("image/")) {
        newPreviews.push(URL.createObjectURL(file));
      } else if (file.type === "application/pdf") {
         // Create a simple text preview for PDF if available or an icon
         newPreviews.push(""); // Placeholder for PDF icon
      } else {
         newPreviews.push("");
      }
    });
    setPreviews(newPreviews);
  }, [onFileChange, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    maxFiles: multiple ? undefined : 1, // Use undefined for multiple
    accept: acceptedFileTypes,
    maxSize
  });

  const clearFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    files.forEach(f => {
        const url = URL.createObjectURL(f);
        URL.revokeObjectURL(url); // Clean up URLs
    });
    setFiles([]);
    setPreviews([]);
  };

  const getFileIcon = (file: File, index: number) => {
    if (file.type.startsWith("image/")) {
        return <img src={previews[index]} alt="Preview" className="w-full h-full object-contain" />;
    }
    if (file.type === "application/pdf") return <FileIcon className="h-8 w-8 text-red-500" />;
    if (file.type.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />;
    if (file.type.startsWith("audio/")) return <Music className="h-8 w-8 text-pink-500" />;
    return <FileIcon className="h-8 w-8 text-slate-500" />;
  };

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] bg-muted/30 hover:bg-muted/50",
        isDragActive ? "border-primary bg-primary/10" : "border-border",
        files.length > 0 ? "border-green-500 bg-green-500/10" : "",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {files.length > 0 ? (
        <div className="w-full flex flex-col items-center gap-4">
          <div className={cn("grid gap-4", multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1")}>
             {files.map((file, index) => (
                <div key={file.name} className="flex flex-col items-center text-center p-2 rounded-lg bg-card shadow-sm border border-border">
                    <div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-md mb-2">
                        {getFileIcon(file, index)}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate w-full">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
             ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFiles}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X size={16} className="mr-2" /> Changer {multiple ? "les fichiers" : "de fichier"}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary">
              <Upload size={32} />
           </div>
           <div>
              <p className="text-lg font-semibold text-foreground">
                {isDragActive ? "Relâchez pour ajouter" : label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {multiple ? "Ou cliquez pour parcourir plusieurs fichiers" : "Ou cliquez pour parcourir"}
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
