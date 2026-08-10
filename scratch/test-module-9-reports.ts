import { prisma } from "../lib/db/prisma";
import { getReportsData } from "../lib/services/report.service";
import { getActivityLogs } from "../lib/services/activity.service";
import { AuthUser } from "../types";
import { ActivityAction, EntityType } from "@prisma/client";

async function runTests() {
  console.log("=== EVOLIX OS MODULE 9: REPORTS & ACTIVITY TEST SUITE ===");

  // 1. Fetch Founder and Intern test accounts from database
  const founderUser = await prisma.user.findFirst({
    where: { role: "CO_FOUNDER", isActive: true },
  });

  const internUser = await prisma.user.findFirst({
    where: { role: "INTERN", isActive: true },
  });

  if (!founderUser) {
    console.error("FAIL: No active CO_FOUNDER found in database.");
    process.exit(1);
  }

  if (!internUser) {
    console.error("FAIL: No active INTERN found in database.");
    process.exit(1);
  }

  const founderAuth: AuthUser = {
    id: founderUser.id,
    email: founderUser.email,
    name: founderUser.name,
    role: founderUser.role as "CO_FOUNDER",
    isActive: founderUser.isActive,
  };

  const internAuth: AuthUser = {
    id: internUser.id,
    email: internUser.email,
    name: internUser.name,
    role: internUser.role as "INTERN",
    isActive: internUser.isActive,
  };

  console.log(`Founder User: ${founderAuth.name} (${founderAuth.email})`);
  console.log(`Intern User: ${internAuth.name} (${internAuth.email})`);

  // TEST 1: Founder Reports Data
  console.log("\n--- TEST 1: CO_FOUNDER REPORTS ---");
  const founderReportsResult = await getReportsData(founderAuth);

  if (founderReportsResult.role !== "CO_FOUNDER") {
    throw new Error("FAIL: Founder reports role mismatch");
  }

  const fData = founderReportsResult.data;
  console.log("✓ Founder Sales Metrics:", fData.sales);
  console.log("✓ Founder Client Growth:", fData.clients);
  console.log("✓ Founder Project Completion:", fData.projects);
  console.log("✓ Founder Task Completion:", fData.tasks);
  console.log("✓ Founder Team Workload count:", fData.teamWorkload.length);
  console.log("✓ Founder Financials:", fData.financials);

  if (
    typeof fData.financials.revenue !== "number" ||
    typeof fData.financials.expenses !== "number" ||
    typeof fData.financials.profit !== "number"
  ) {
    throw new Error("FAIL: Financial metrics missing in founder report");
  }

  console.log("SUCCESS: Founder Reports test passed.");

  // TEST 2: Founder Activity Log & Filters
  console.log("\n--- TEST 2: CO_FOUNDER GLOBAL ACTIVITY LOG & FILTERS ---");
  const globalLogs = await getActivityLogs(founderAuth, { page: 1, limit: 10 });
  console.log(`✓ Fetched ${globalLogs.logs.length} activity logs out of total ${globalLogs.total}`);

  // Test filtering by user
  const userFilteredLogs = await getActivityLogs(founderAuth, { userId: founderUser.id });
  console.log(`✓ User filter test returned ${userFilteredLogs.logs.length} logs for user ${founderUser.id}`);

  // Test filtering by entityType
  const taskFilteredLogs = await getActivityLogs(founderAuth, { entityType: EntityType.TASK });
  console.log(`✓ Entity filter test returned ${taskFilteredLogs.logs.length} TASK logs`);

  console.log("SUCCESS: Founder Activity Log test passed.");

  // TEST 3: Intern Personal Performance
  console.log("\n--- TEST 3: INTERN PERSONAL PERFORMANCE REPORT ---");
  const internReportsResult = await getReportsData(internAuth);

  if (internReportsResult.role !== "INTERN") {
    throw new Error("FAIL: Intern reports role mismatch");
  }

  const iData = internReportsResult.data;
  console.log("✓ Intern Completed Tasks:", iData.completedTasks);
  console.log("✓ Intern Pending Tasks:", iData.pendingTasks);
  console.log("✓ Intern Overdue Tasks:", iData.overdueTasks);
  console.log("✓ Intern Completion Rate:", iData.completionRate, "%");
  console.log("✓ Intern Assigned Projects:", iData.assignedProjects.length);

  console.log("SUCCESS: Intern Personal Performance test passed.");

  // TEST 4: Intern Financial Restriction
  console.log("\n--- TEST 4: INTERN FINANCIAL RESTRICTION ---");
  // Ensure no financial fields exist on intern report data
  const rawInternData = iData as any;
  const prohibitedKeys = ["revenue", "expenses", "profit", "profitMargin", "financials", "payments"];
  for (const key of prohibitedKeys) {
    if (rawInternData[key] !== undefined) {
      throw new Error(`SECURITY BREACH: Prohibited financial key '${key}' exposed to INTERN!`);
    }
  }
  console.log("✓ Confirmed ZERO financial fields present in Intern report object.");
  console.log("SUCCESS: Intern Financial Restriction test passed.");

  // TEST 5: Intern Activity Restriction
  console.log("\n--- TEST 5: INTERN ACTIVITY LOG RESTRICTION ---");
  let internBlocked = false;
  try {
    await getActivityLogs(internAuth, {});
  } catch (err: any) {
    if (err.statusCode === 403 || err.message?.includes("Forbidden") || err.message?.includes("Co-Founder")) {
      internBlocked = true;
      console.log(`✓ Access blocked successfully for INTERN: ${err.message}`);
    } else {
      throw err;
    }
  }

  if (!internBlocked) {
    throw new Error("SECURITY BREACH: INTERN was able to access global activity logs!");
  }

  console.log("SUCCESS: Intern Activity Restriction test passed.");

  console.log("\n==========================================");
  console.log("ALL MODULE 9 TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("==========================================");
}

runTests()
  .catch((err) => {
    console.error("\nTEST SUITE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
