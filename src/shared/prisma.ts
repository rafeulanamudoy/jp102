import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], 
});

// Handle disconnection on exit
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.info("🔄 Prisma disconnected due to SIGINT");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.info("🔄 Prisma disconnected due to SIGTERM");
  process.exit(0);
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.info("🔄 Prisma disconnected due to process exit");
});

export default prisma;
