"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    MoreHorizontal, 
    Pencil, 
    Trash2
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

interface User {
    id: string;
    name: string;
    email: string;
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
    const [editForm, setEditForm] = useState({ name: "", email: "" });

    const handleSearch = async (term: string) => {
        setSearch(term);
        setLoading(true);
        const res = await getUsers(term);
        if (res.success && res.data) {
            setUsers(res.data as unknown as User[]);
        }
        setLoading(false);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
        });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        const res = await updateUser(editingUser.id, {
            name: editForm.name,
            email: editForm.email,
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
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date d'inscription</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">Chargement...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">Aucun utilisateur trouvé.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{user.name}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
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
                            Modifiez les informations de l'utilisateur.
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