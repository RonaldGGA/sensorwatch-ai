import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sensorwatch.com" },
    update: {},
    create: { email: "admin@sensorwatch.com", password },
  });
  console.log("Admin created");
}

main().then(() => prisma.$disconnect());
