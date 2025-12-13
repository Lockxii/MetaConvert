"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Bell, Search, User, LogOut, Loader2, FileCheck, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes"; // Import useTheme

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme(); // Get setTheme from next-themes

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  // const [theme, setTheme] = useState("system"); // This state is now managed by next-themes


  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // Fetch and apply initial theme from settings
  useEffect(() => {
    async function fetchAndApplyTheme() {
        if (!session?.user?.id) return;
        try {
            const res = await fetch("/api/settings/user");
            if (res.ok) {
                const data = await res.json();
                setTheme(data.theme); // Use setTheme from next-themes
            }
        } catch (e) {
            console.error("Failed to fetch user theme:", e);
        }
    }
    fetchAndApplyTheme();
  }, [session, setTheme]); // Add setTheme to dependencies


  const handleSearch = async () => {
    if (!searchQuery) {
        setSearchResults(null);
        return;
    }
    setSearching(true);
    try {
        const res = await fetch(`/api/dashboard/search?query=${searchQuery}`);
        if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
        } else {
            toast.error("Échec de la recherche.");
        }
    } catch (e) {
        console.error("Search error:", e);
        toast.error("Erreur de connexion lors de la recherche.");
    } finally {
        setSearching(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };


  const handleThemeChange = async (val: string) => {
    setTheme(val);
    // Optimistically update
    try {
        await fetch("/api/settings/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme: val }),
        });
    } catch (e) {
        console.error("Failed to save theme preference:", e);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col ml-[80px] md:ml-[250px] transition-all duration-300 min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
           {/* Global Search */}
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Rechercher un outil, un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="w-64 bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:border-blue-500 transition-all"
              />
               <AnimatePresence>
                {searchQuery && searchResults && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto"
                    >
                        {searching && <div className="p-2 text-center text-sm text-slate-500">Recherche...</div>}
                        {!searching && searchResults.conversions.length === 0 && searchResults.upscales.length === 0 && (
                            <div className="p-2 text-center text-sm text-slate-500">Aucun résultat trouvé.</div>
                        )}
                        {searchResults.conversions.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                                <FileCheck size={16} className="text-blue-500" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-slate-500">Conversion vers {item.targetType}</p>
                                </div>
                            </Link>
                        ))}
                        {searchResults.upscales.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                                <ImageIcon size={16} className="text-purple-500" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-slate-500">Upscale {item.factor}x</p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
               </AnimatePresence>
           </div>

           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
                 <Bell size={18} />
              </Button>
              
              <div className="h-6 w-[1px] bg-slate-200" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-2 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-900 leading-none">{session.user.name}</p>
                            <p className="text-xs text-slate-500">{session.user.email}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={18} />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pricing" className="cursor-pointer">Mon Plan</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Removed local theme state and use the one from next-themes */}
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-28 bg-white border-slate-200">
                    <SelectValue placeholder="Thème" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="system">Système</SelectItem>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                </SelectContent>
            </Select>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}