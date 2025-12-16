"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Search, User, LogOut, Loader2, FileCheck, Image as ImageIcon, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const { theme, setTheme, resolvedTheme } = useTheme(); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);


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
                // Only set if explicitly 'light' or 'dark' to respect user preference from DB
                // 'system' is default, so if it's 'system' we let next-themes handle it or do nothing
                if (data.theme && data.theme !== "system") {
                    setTheme(data.theme);
                }
            }
        } catch (e) {
            console.error("Failed to fetch user theme:", e);
        }
    }
    // Only run on mount or when session becomes available
    if (session?.user?.id && !mounted) {
         fetchAndApplyTheme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // removed 'mounted' from dep array to avoid re-running, added check inside


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

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Persist to DB (Fire and forget)
    fetch("/api/settings/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
    }).catch(e => console.error("Failed to persist theme:", e));
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher un outil, un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="w-64 bg-muted/50 border border-input rounded-lg pl-10 pr-4 py-1.5 text-sm focus:border-primary transition-all"
              />
               <AnimatePresence>
                {searchQuery && searchResults && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto"
                    >
                        {searching && <div className="p-2 text-center text-sm text-muted-foreground">Recherche...</div>}
                        {!searching && searchResults.conversions.length === 0 && searchResults.upscales.length === 0 && (
                            <div className="p-2 text-center text-sm text-muted-foreground">Aucun résultat trouvé.</div>
                        )}
                        {searchResults.conversions.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted border-b border-border last:border-b-0">
                                <FileCheck size={16} className="text-primary" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-muted-foreground">Conversion vers {item.targetType}</p>
                                </div>
                            </Link>
                        ))}
                        {searchResults.upscales.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted border-b border-border last:border-b-0">
                                <ImageIcon size={16} className="text-purple-500" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-muted-foreground">Upscale {item.factor}x</p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
               </AnimatePresence>
           </div>

           <div className="flex items-center gap-4">
              {/* Notifications removed */}
              
              <div className="h-6 w-[1px] bg-border" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-2 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-foreground leading-none">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pricing" className="cursor-pointer">Mon Plan</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="ml-2"
                aria-label="Toggle theme"
              >
                {mounted && (resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />)}
              </Button>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden bg-slate-50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}