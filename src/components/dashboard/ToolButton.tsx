"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ToolButtonProps {
    icon: React.ElementType; // Lucide icon component
    label: string;
    active?: boolean;
    onClick: () => void;
}

export function ToolButton({ icon: Icon, label, active = false, onClick }: ToolButtonProps) {
   // Add a defensive check for the Icon prop
   if (!Icon) {
     console.error(`ToolButton: Icon component for label "${label}" is undefined.`);
     return null; 
   }
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left",
            active 
               ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
               : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
         )}
      >
         <Icon size={18} className={active ? "text-blue-600" : "text-slate-400"} />
         {label}
      </button>
   )
}
