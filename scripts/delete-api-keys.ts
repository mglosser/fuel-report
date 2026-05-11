import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../app/generated/prisma/client";
import { getDatabaseUrl } from "../lib/database-url";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient({
  adapter: new PrismaPg(getDatabaseUrl()),
});

async function main() {
  const existingCount = await prisma.apiKeys.count();
  const result = await prisma.apiKeys.deleteMany();

  console.log(`Deleted ${result.count} of ${existingCount} API key rows.`);
}

main()
  .catch((error) => {
    console.error("Failed to delete API keys.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
