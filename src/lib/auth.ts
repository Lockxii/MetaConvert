import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Ensure this exports your Drizzle instance
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
             ...schema
        }
    }),
    // On force l'URL de production pour éviter les erreurs de détection sur Vercel
    baseURL: process.env.NODE_ENV === "production" 
        ? "https://meta-convert-steel.vercel.app" 
        : "http://localhost:3000",
    trustedOrigins: [
        "http://localhost:3000", 
        "https://*.vercel.app",
        "https://meta-convert-steel.vercel.app"
    ],
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
});
