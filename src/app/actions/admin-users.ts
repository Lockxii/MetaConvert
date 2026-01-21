"use server";

import { db } from "@/db";
import { 
    user, 
    conversions, 
    upscales, 
    session, 
    account, 
    userSettings, 
    sharedLinks, 
    dropLinks 
} from "@/db/schema";
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
        // Manual Cascade Delete
        // Order matters slightly for some FKs, but usually deleting dependents first is safest.
        
        // 1. Delete User Settings
        await db.delete(userSettings).where(eq(userSettings.userId, userId));
        
        // 2. Delete Auth Sessions & Accounts
        await db.delete(session).where(eq(session.userId, userId));
        await db.delete(account).where(eq(account.userId, userId));

        // 3. Delete App Data (Conversions, Upscales, Links)
        await db.delete(conversions).where(eq(conversions.userId, userId));
        await db.delete(upscales).where(eq(upscales.userId, userId));
        await db.delete(sharedLinks).where(eq(sharedLinks.userId, userId));
        await db.delete(dropLinks).where(eq(dropLinks.userId, userId));

        // 4. Finally Delete User
        await db.delete(user).where(eq(user.id, userId));
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
