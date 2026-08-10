import { prisma } from "../lib/db/prisma";
import { getWorkboardData } from "../lib/services/workboard.service";
import { AppError } from "../lib/errors";

async function runM7WorkboardTest() {
  console.log("=== TESTING MAJOR MODULE M7: TEAM LEADER WORKBOARD ===");

  // 1. Ensure Co-Founder Team Leaders (Saifuddin, Taikhum, Qusai) exist
  const leaderDefs = [
    { name: "Saifuddin", domain: "Digital Marketing + Design" },
    { name: "Taikhum", domain: "Software + Website" },
    { name: "Qusai", domain: "Operations + Finance + Onboarding + Consulting" },
  ];

  const coFounders: any[] = [];
  for (const def of leaderDefs) {
    let leader = await prisma.user.findFirst({ where: { name: def.name } });
    if (!leader) {
      leader = await prisma.user.create({
        data: {
          name: def.name,
          email: `${def.name.toLowerCase()}@evolix.io`,
          role: "CO_FOUNDER",
        },
      });
    }
    coFounders.push(leader);
  }

  console.log(`✓ 1. Verified Co-Founder Team Leaders in Database:`);
  coFounders.forEach((cf) => console.log(`   - ${cf.name} (${cf.email})`));

  // 2. Test Workboard data access for each Co-Founder
  for (const cf of coFounders) {
    const authUser = {
      id: cf.id,
      name: cf.name,
      email: cf.email,
      role: cf.role as "CO_FOUNDER",
      isActive: true,
    };

    const data = await getWorkboardData(authUser, { leaderId: cf.id });
    console.log(`\n✓ Workboard Data for Leader '${cf.name}':`);
    console.log(`   Domain: ${data.selectedLeader.domain}`);
    console.log(`   My Projects: ${data.summary.myProjectsCount}`);
    console.log(`   My Tasks: ${data.summary.myTasksCount}`);
    console.log(`   Pending Acceptance: ${data.summary.pendingAcceptanceCount}`);
    console.log(`   In Progress: ${data.summary.inProgressCount}`);
    console.log(`   Submitted: ${data.summary.submittedCount}`);
    console.log(`   Completed: ${data.summary.completedCount}`);
    console.log(`   Overdue: ${data.summary.overdueCount}`);
    console.log(`   Avg Progress: ${data.summary.avgProgressPercentage}%`);

    if (data.leadersWorkload.length < 3) {
      throw new Error("FAIL: leadersWorkload comparison grid missing leaders!");
    }
  }

  console.log(`\n✓ 2. Successfully verified operational Workboard data for all 3 Co-Founders.`);

  // 3. Test Security Denial for Interns (HTTP 403)
  let intern = await prisma.user.findFirst({ where: { role: "INTERN" } });
  if (!intern) {
    intern = await prisma.user.create({
      data: {
        name: "Test Intern User",
        email: "intern.test@evolix.io",
        role: "INTERN",
      },
    });
  }

  const internAuth = {
    id: intern.id,
    name: intern.name,
    email: intern.email,
    role: intern.role as "INTERN",
    isActive: true,
  };

  console.log(`\nTesting Intern Access Security Denial for '${intern.name}'...`);
  try {
    await getWorkboardData(internAuth);
    throw new Error("FAIL: Intern was allowed to access Team Leader Workboard!");
  } catch (error: any) {
    if (error.statusCode === 403) {
      console.log(`✓ 3. HTTP 403 Forbidden Rejection Verified for Intern: "${error.message}"`);
    } else {
      throw error;
    }
  }

  console.log("\n=== MAJOR MODULE M7 TEST PASSED SUCCESSFULLY ===");
}

runM7WorkboardTest()
  .catch((e) => {
    console.error("M7 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
