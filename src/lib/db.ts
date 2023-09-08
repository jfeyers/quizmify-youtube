import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  var cachedPrisma: PrismaClient;
}
export let prisma: PrismaClient;
if (process.env.NODE_Env === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}
