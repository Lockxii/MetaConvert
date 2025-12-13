import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

// Create a client only if connection string is available.
// This prevents build crashes when env var is missing.
// The actual queries will fail at runtime if db is used without config.
const sql = connectionString ? neon(connectionString) : null;

export const db = sql ? drizzle(sql, { schema }) : ({} as any);