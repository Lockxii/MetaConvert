"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUsers(search = "") {
    try {
        const query = db.select().from(user);
        
        if (search) {
            query.where(or(
                like(user.name, `%${search}%`),
                like(user.email, `%${search}%`)
            ));
        }

        const users = await query.limit(50); // Limit for now
        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function updateUser(userId: string, data: Partial<typeof user.$inferSelect>) {
    try {
        await db.update(user).set({
            name: data.name,
            email: data.email,
            updatedAt: new Date()
        }).where(eq(user.id, userId));
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(userId: string) {
    try {
        // Warning: This should probably cascade delete related data (conversions, upscales, etc.)
        // For now, assuming Drizzle or DB foreign keys handle cascade or we just delete user.
        await db.delete(user).where(eq(user.id, userId));
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
