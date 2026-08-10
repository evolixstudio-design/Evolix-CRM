import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "";
  
  // Use Neon driver adapter when connecting to Neon cloud PostgreSQL
  if (connectionString.includes("neon.tech")) {
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    
    // Prefer native WebSocket in Node 18+ / Edge / Browser runtimes to avoid Webpack ws bufferUtil issue
    if (typeof globalThis.WebSocket !== "undefined") {
      neonConfig.webSocketConstructor = globalThis.WebSocket;
    } else {
      neonConfig.webSocketConstructor = require("ws");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    } as any);
  }

  // Standard PrismaClient for local PostgreSQL / standard TCP connection
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
