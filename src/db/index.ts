import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Une seule connexion réutilisée entre les rechargements à chaud du serveur de dev.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

const client = globalForDb.sql ?? postgres(process.env.DATABASE_URL!, { max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.sql = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
