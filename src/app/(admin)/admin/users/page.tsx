import { getUsers } from "@/app/actions/admin-users";
import { UsersClient } from "./UsersClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminUsersPage() {
    const res = await getUsers();
    const users = res.success && res.data ? res.data : [];

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
            </div>
            
            <UsersClient initialUsers={users} />
        </div>
    );
}
