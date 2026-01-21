"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseFileProcessorProps {
  apiEndpoint: string;
  onSuccess?: (blob: Blob, fileName: string) => void;
  onError?: (error: string) => void;
}

export function useFileProcessor({ apiEndpoint, onSuccess, onError }: UseFileProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const processFiles = async (files: File[], params: Record<string, string | number>) => {
    if (files.length === 0) return;
    
    setLoading(true);
    setProgress(0);
    setBatchProgress({ current: 0, total: files.length });
    
    const toastId = toast.loading(files.length > 1 ? `Traitement de 1/${files.length}...` : "Traitement en cours...");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (files.length > 1) {
            toast.loading(`Traitement de ${i + 1}/${files.length} : ${file.name}`, { id: toastId });
            setBatchProgress({ current: i + 1, total: files.length });
        }

        const formData = new FormData();
        formData.append("file", file);
        Object.entries(params).forEach(([key, value]) => formData.append(key, String(value)));

        const res = await fetch(apiEndpoint, { method: "POST", body: formData });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Erreur sur ${file.name}`);
        }

        const blob = await res.blob();
        const contentDisposition = res.headers.get("Content-Disposition");
        let fileName = `result_${file.name}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) fileName = match[1];
        }

        // Auto download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (onSuccess) onSuccess(blob, fileName);
        
        // Update individual file progress simulation
        setProgress(((i + 1) / files.length) * 100);
      }

      toast.success(files.length > 1 ? `${files.length} fichiers traités !` : "Fichier traité avec succès !", { id: toastId });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message, { id: toastId });
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  // Keep processFile for backward compatibility
  const processFile = (file: File, params: Record<string, string | number>) => processFiles([file], params);

  return { processFile, processFiles, loading, progress, batchProgress };
}