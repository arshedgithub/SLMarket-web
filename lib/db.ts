import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

/*
 * Neon databases are reached through Neon's serverless driver: WebSockets
 * over port 443 instead of the Postgres protocol on 5432. Some networks
 * (including the dev machine's) let the 5432 TCP connection open but never
 * answer, which Prisma reports as "Can't reach database server". Port 443
 * always gets through, and it is Neon's recommended path for serverless
 * hosting too. Any other Postgres host uses Prisma's normal engine.
 */

function createClient() {
  const log: ("error" | "warn")[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const url = process.env.DATABASE_URL;

  if (url && new URL(url).hostname.endsWith(".neon.tech")) {
    neonConfig.webSocketConstructor = globalThis.WebSocket; // built into Node 22+
    const adapter = new PrismaNeon(new Pool({ connectionString: url }));
    return new PrismaClient({ adapter, log });
  }
  return new PrismaClient({ log });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = db;
