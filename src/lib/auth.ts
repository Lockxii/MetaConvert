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
    // On passe le secret explicitement
    secret: process.env.BETTER_AUTH_SECRET,
    // URL de base propre
    baseURL: "https://meta-convert-steel.vercel.app",
    trustedOrigins: [
        "http://localhost:3000", 
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
    // Activer les logs pour voir l'erreur réelle dans Vercel
    debug: true,
});
