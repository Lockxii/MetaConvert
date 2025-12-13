import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/server-utils";
import { db } from "@/db";
import { user as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // In a real application, you would fetch the user's plan from your billing system
        // or a dedicated 'subscriptions' table linked to the user.
        // For this demo, we'll return a mock plan based on user ID or a default.

        // Mock plan data:
        const mockPlans = [
            { id: "free", name: "Gratuit", features: ["5 conversions / jour", "Qualité Standard"], price: "0" },
            { id: "pro", name: "Pro", features: ["Illimité", "Upscaling AI 4K", "Priorité haute"], price: "12" },
            { id: "business", name: "Business", features: ["API Access", "SSO & SAML", "Support dédié"], price: "49" },
        ];

        // Assign a 'pro' plan to a specific user ID for demo purposes, otherwise free
        const userPlanId = (userId.startsWith('user_pro_')) ? "pro" : "free"; 
        const userPlan = mockPlans.find(p => p.id === userPlanId);

        const userDetails = await db.query.user.findFirst({
            where: eq(usersTable.id, userId),
            columns: {
                id: true,
                email: true,
                name: true,
            }
        });

        return NextResponse.json({
            user: userDetails,
            plan: userPlan,
            currentUsage: {
                conversionsThisMonth: 5, // Mock data
                upscalesThisMonth: 2, // Mock data
            },
            nextBillingDate: userPlan?.id !== "free" ? "2026-01-01" : null,
        });

    } catch (error) {
        console.error("GET user plan error:", error);
        return NextResponse.json({ error: "Failed to fetch user plan" }, { status: 500 });
    }
}
