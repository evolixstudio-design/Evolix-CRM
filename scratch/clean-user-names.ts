import { prisma } from "../lib/db/prisma";

async function cleanNames() {
  console.log("Removing '(Co-Founder)' and '(Intern)' text from user names...");

  const users = await prisma.user.findMany({});

  for (const u of users) {
    const cleanName = u.name
      .replace(/\s*\(Co-Founder\)/i, "")
      .replace(/\s*\(Intern\)/i, "")
      .trim();

    if (cleanName !== u.name) {
      await prisma.user.update({
        where: { id: u.id },
        data: { name: cleanName },
      });
      console.log(`✓ Updated '${u.name}' ➔ '${cleanName}'`);
    }
  }

  console.log("All user display names cleaned!");
}

cleanNames()
  .catch((e) => {
    console.error("Error cleaning names:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
