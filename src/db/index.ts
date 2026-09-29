import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

const globalForDb = globalThis as typeof globalThis & {
  __droidMatrixDb?:
    | ReturnType<typeof drizzleNodePg>
    | ReturnType<typeof drizzlePglite>;
  __droidMatrixPool?: Pool;
  __droidMatrixPglite?: PGlite;
};

function initDb() {
  const databaseUrl = getDatabaseUrl();
  if (databaseUrl) {
    const pool =
      globalForDb.__droidMatrixPool ??
      new Pool({
        connectionString: databaseUrl,
      });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__droidMatrixPool = pool;
    }
    return drizzleNodePg(pool);
  }

  // Zero-config embedded PostgreSQL fallback (stores locally in ./.data/pglite)
  const dataDir = path.resolve(process.cwd(), ".data/pglite");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore directory creation errors
  }

  const client =
    globalForDb.__droidMatrixPglite ?? new PGlite(dataDir);
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__droidMatrixPglite = client;
  }
  return drizzlePglite(client);
}

export const db = globalForDb.__droidMatrixDb ?? initDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__droidMatrixDb = db;
}
