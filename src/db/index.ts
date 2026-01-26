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

            await sqlClient`ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "createdAt" timestamp;`;

            await sqlClient`ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;`;

        } catch (e) {

            // Ignore if columns already exist or other permission issues

        }

    })();

}



export const db = sqlClient ? drizzle(sqlClient, { schema }) : ({} as any);
