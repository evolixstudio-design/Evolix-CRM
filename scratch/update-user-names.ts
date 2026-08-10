import { prisma } from "../lib/db/prisma";

async function updateNames() {
  console.log("Updating team user accounts to Qusai, Saifuddin, Taikhum, and Huzefa...");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  const cofounders = users.filter((u) => u.role === "CO_FOUNDER");
  const interns = users.filter((u) => u.role === "INTERN");

  if (cofounders[0]) {
    await prisma.user.update({
      where: { id: cofounders[0].id },
      data: {
        name: "Qusai (Co-Founder)",
        email: "qusai@evolix.io",
      },
    });
    console.log(`✓ Updated Co-Founder 1: Qusai (Co-Founder) [qusai@evolix.io]`);
  }

  if (cofounders[1]) {
    await prisma.user.update({
      where: { id: cofounders[1].id },
      data: {
        name: "Saifuddin (Co-Founder)",
        email: "saifuddin@evolix.io",
      },
    });
    console.log(`✓ Updated Co-Founder 2: Saifuddin (Co-Founder) [saifuddin@evolix.io]`);
  }

  if (cofounders[2]) {
    await prisma.user.update({
      where: { id: cofounders[2].id },
      data: {
        name: "Taikhum (Co-Founder)",
        email: "taikhum@evolix.io",
      },
    });
    console.log(`✓ Updated Co-Founder 3: Taikhum (Co-Founder) [taikhum@evolix.io]`);
  }

  if (interns[0]) {
    await prisma.user.update({
      where: { id: interns[0].id },
      data: {
        name: "Huzefa (Intern)",
        email: "huzefa@evolix.io",
      },
    });
    console.log(`✓ Updated Intern 1: Huzefa (Intern) [huzefa@evolix.io]`);
  }

  console.log("All team member names updated successfully!");
}

updateNames()
  .catch((e) => {
    console.error("Failed to update user names:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
