import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

// Create a client only if connection string is available.

const sqlClient = connectionString ? neon(connectionString) : null;



// Auto-repair missing columns for Better Auth



if (sqlClient) {



    (async () => {



        try {



            // Table verification



            await sqlClient`ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "createdAt" timestamp;`;



            await sqlClient`ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;`;



            



            // Table user



            await sqlClient`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" boolean DEFAULT false;`;



            await sqlClient`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();`;



            await sqlClient`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now();`;







            // Table account



            await sqlClient`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();`;



            await sqlClient`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now();`;



            



            // Table session



            await sqlClient`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();`;



            await sqlClient`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now();`;



        } catch (e) {



            console.error("Auto-migration error:", e);



        }



    })();



}







export const db = sqlClient ? drizzle(sqlClient, { schema }) : ({} as any);
