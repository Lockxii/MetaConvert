"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Ban, 
    CheckCircle,
    Shield
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUser, deleteUser, getUsers } from "@/app/actions/admin-users";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface User {
    id: string;
    name: string;
    email: string;
    role: string | null;
    banned: boolean | null;
    createdAt: Date;
    image?: string | null;
}

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Edit State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "user", banned: false });

    const handleSearch = async (term: string) => {
        setSearch(term);
        setLoading(true);
        // Debounce could be added here
        const res = await getUsers(term);
        if (res.success && res.data) {
             // Safe cast since we know the shape matches roughly or we should validate
            setUsers(res.data as unknown as User[]);
        }
        setLoading(false);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role || "user",
            banned: user.banned || false
        });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        const res = await updateUser(editingUser.id, {
            name: editForm.name,
            email: editForm.email,
            role: editForm.role,
            banned: editForm.banned
        });

        if (res.success) {
            toast.success("Utilisateur mis à jour");
            setIsEditOpen(false);
            handleSearch(search); // Refresh
            router.refresh();
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
        
        const res = await deleteUser(userId);
        if (res.success) {
            toast.success("Utilisateur supprimé");
            handleSearch(search); // Refresh
            router.refresh();
        } else {
            toast.error("Erreur lors de la suppression");
        }
    };

    const toggleBan = async (user: User) => {
        const newBanStatus = !user.banned;
        const res = await updateUser(user.id, { banned: newBanStatus });
        if (res.success) {
            toast.success(newBanStatus ? "Utilisateur banni" : "Utilisateur rétabli");
            handleSearch(search);
            router.refresh();
        } else {
            toast.error("Erreur lors du changement de statut");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                        placeholder="Rechercher par nom ou email..." 
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nom</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date d'inscription</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Chargement...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Aucun utilisateur trouvé.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{user.name}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">User</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {user.banned ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium dark:bg-red-900/30 dark:text-red-400">
                                                    <Ban size={12} /> Banni
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle size={12} /> Actif
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleBan(user)}>
                                                        {user.banned ? (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Débloquer
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="mr-2 h-4 w-4 text-red-500" /> Bannir
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations et les permissions de l'utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nom</Label>
                            <Input id="name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <select 
                                id="role" 
                                className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="banned" className="text-right">Banni</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch 
                                    id="banned" 
                                    checked={editForm.banned}
                                    onCheckedChange={(checked) => setEditForm({...editForm, banned: checked})}
                                />
                                <Label htmlFor="banned" className="font-normal text-muted-foreground">
                                    {editForm.banned ? "L'accès est bloqué" : "L'accès est autorisé"}
                                </Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveEdit}>Sauvegarder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
