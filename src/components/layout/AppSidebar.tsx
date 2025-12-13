"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Globe, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { name: "Image", href: "/dashboard/image", icon: ImageIcon },
  { name: "PDF", href: "/dashboard/pdf", icon: FileText },
  { name: "Vidéo", href: "/dashboard/video", icon: Video },
  { name: "Audio", href: "/dashboard/audio", icon: Music },
  { name: "Web", href: "/dashboard/web", icon: Globe },
  { name: "Réglages", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 80 : 250 }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 shadow-sm"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
               <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                 <span className="text-white font-bold text-xs">M</span>
               </div>
               <span className="font-semibold text-foreground tracking-tight">
                 MetaConvert
               </span>
            </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700")} />
              
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {!collapsed ? (
            <div className="rounded-lg bg-slate-900 p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-xl -translate-y-10 translate-x-10" />
                <h4 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Plan Pro
                </h4>
                <p className="text-xs text-slate-400 mb-3">Débloquez la 4K et le batch processing.</p>
                <Link href="/pricing" className="w-full text-xs bg-white text-slate-900 font-medium py-1.5 rounded hover:bg-slate-100 transition-colors text-center block">
                    Mettre à niveau
                </Link>
            </div>
        ) : (
            <Link href="/pricing" className="flex justify-center">
                <Zap size={20} className="text-blue-600 fill-blue-100" />
            </Link>
        )}
      </div>
    </motion.aside>
  );
}