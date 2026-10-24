import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const configuredPoolMax = Number.parseInt(process.env.DB_POOL_MAX ?? "10", 10);
const poolMax = Number.isFinite(configuredPoolMax)
  ? Math.min(Math.max(configuredPoolMax, 1), 50)
  : 10;

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
