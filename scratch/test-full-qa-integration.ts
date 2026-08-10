import { prisma } from "../lib/db/prisma";
import { getDashboardData } from "../lib/services/dashboard.service";
import { createLead, convertLeadToClient, getLeads } from "../lib/services/lead.service";
import { getClients, createClient } from "../lib/services/client.service";
import { getOnboardings } from "../lib/services/onboarding.service";
import { createProject, getProjects } from "../lib/services/project.service";
import { createTask, updateTask, getTasks } from "../lib/services/task.service";
import { getTeamMembers, updateTeamMemberRole } from "../lib/services/team.service";
import { createPayment, createExpense, getFinanceSummary } from "../lib/services/finance.service";
import { getReportsData } from "../lib/services/report.service";
import { getActivityLogs } from "../lib/services/activity.service";
import { AuthUser } from "../types";
import { LeadSource, LeadPriority, ProjectServiceType, PaymentMethod } from "@prisma/client";

async function runFullQAIntegration() {
  console.log("==================================================");
  console.log("EVOLIX OS — MASTER QA & INTEGRATION AUDIT SUITE");
  console.log("==================================================\n");

  // 1. Fetch Founder and Intern accounts
  const founderUser = await prisma.user.findFirst({
    where: { role: "CO_FOUNDER", isActive: true },
  });

  const internUser = await prisma.user.findFirst({
    where: { role: "INTERN", isActive: true },
  });

  if (!founderUser || !internUser) {
    console.error("FATAL: Test users missing in database.");
    process.exit(1);
  }

  const founderAuth: AuthUser = {
    id: founderUser.id,
    email: founderUser.email,
    name: founderUser.name,
    role: "CO_FOUNDER",
    isActive: founderUser.isActive,
  };

  const internAuth: AuthUser = {
    id: internUser.id,
    email: internUser.email,
    name: internUser.name,
    role: "INTERN",
    isActive: internUser.isActive,
  };

  console.log(`[AUTH] Co-Founder authenticated: ${founderAuth.name} (${founderAuth.id})`);
  console.log(`[AUTH] Intern authenticated: ${internAuth.name} (${internAuth.id})\n`);

  // --------------------------------------------------
  // 2. END-TO-END DATA FLOW & ACTIVITY LOG VERIFICATION
  // --------------------------------------------------
  console.log("--- 2. TESTING END-TO-END BUSINESS DATA FLOW ---");

  // Step A: Create Lead
  const testLead = await createLead(
    {
      name: `QA Lead ${Date.now()}`,
      companyName: "QA Tech Solutions",
      email: `qa_${Date.now()}@example.com`,
      phone: "+919876543210",
      source: LeadSource.WEBSITE,
      estimatedValue: 45000,
      notes: "QA Integration test lead",
    },
    founderAuth.id
  );
  console.log(`[FLOW A] Created Lead: "${testLead.name}" (ID: ${testLead.id})`);

  // Step B: Convert Lead to Client (Creates Client & Onboarding)
  const conversionResult = await convertLeadToClient(testLead.id, founderAuth.id);
  const convertedClient = conversionResult.client;
  console.log(`[FLOW B] Converted Lead -> Client: "${convertedClient.name}" (ID: ${convertedClient.id})`);
  
  if (!conversionResult.onboarding) {
    throw new Error("FAIL: Automatic Onboarding creation missing on Lead conversion!");
  }
  console.log(`[FLOW B] Verified Onboarding auto-created (Status: ${conversionResult.onboarding.status})`);

  // Step C: Create Project under Client
  const testProject = await createProject(founderAuth, {
    clientId: convertedClient.id,
    name: `QA Project ${Date.now()}`,
    serviceType: ProjectServiceType.SOFTWARE,
    contractValue: 50000,
    ownerId: founderAuth.id,
    memberIds: [internAuth.id],
  });
  console.log(`[FLOW C] Created Project: "${testProject.name}" (ID: ${testProject.id})`);

  // Step D: Create Task & Assign to Intern
  const testTask = await createTask(founderAuth, {
    projectId: testProject.id,
    clientId: convertedClient.id,
    title: `QA Task ${Date.now()}`,
    description: "QA Task description for intern",
    assignedToId: internAuth.id,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  });
  console.log(`[FLOW D] Created Task & Assigned to Intern: "${testTask.title}" (ID: ${testTask.id})`);

  // Step E: Intern Updates Task Status to COMPLETED
  const completedTask = await updateTask(internAuth, testTask.id, {
    status: "COMPLETED",
  });
  console.log(`[FLOW E] Intern completed task (Status: ${completedTask.status}, CompletedAt: ${completedTask.completedAt})`);

  // Step F: Record Payment
  const testPayment = await createPayment(founderAuth, {
    clientId: convertedClient.id,
    projectId: testProject.id,
    amount: 25000,
    paymentDate: new Date().toISOString(),
    method: PaymentMethod.UPI,
    status: "PAID",
    reference: "UPI/QA/12345",
  });
  console.log(`[FLOW F] Recorded Payment: ₹${testPayment.amount} (ID: ${testPayment.id})`);

  // Step G: Record Expense
  const testExpense = await createExpense(founderAuth, {
    clientId: convertedClient.id,
    projectId: testProject.id,
    category: "Software",
    description: "QA Cloud Server Hosting",
    amount: 5000,
    expenseDate: new Date().toISOString(),
    paymentMethod: PaymentMethod.CARD,
  });
  console.log(`[FLOW G] Recorded Expense: ₹${testExpense.amount} (ID: ${testExpense.id})\n`);

  // --------------------------------------------------
  // 3. CO-FOUNDER FULL MODULE ACCESS VERIFICATION
  // --------------------------------------------------
  console.log("--- 3. VERIFYING CO-FOUNDER ACCESS (ALL 8 MODULES + ACTIVITY) ---");

  const [
    founderDash,
    founderLeads,
    founderClients,
    founderOnboardings,
    founderProjects,
    founderTasks,
    founderTeam,
    founderFinance,
    founderReports,
    founderActivity,
  ] = await Promise.all([
    getDashboardData(founderAuth),
    getLeads(founderAuth, {}),
    getClients(founderAuth, {}),
    getOnboardings(founderAuth, {}),
    getProjects(founderAuth, {}),
    getTasks(founderAuth, {}),
    getTeamMembers(founderAuth),
    getFinanceSummary(founderAuth),
    getReportsData(founderAuth),
    getActivityLogs(founderAuth, { page: 1, limit: 10 }),
  ]);

  console.log(`✓ Co-Founder Dashboard metrics loaded`);
  console.log(`✓ Co-Founder Leads: ${founderLeads.total} records`);
  console.log(`✓ Co-Founder Clients: ${founderClients.total} records`);
  console.log(`✓ Co-Founder Onboarding: ${founderOnboardings.total} records`);
  console.log(`✓ Co-Founder Projects: ${founderProjects.total} records`);
  console.log(`✓ Co-Founder Tasks: ${founderTasks.total} records`);
  console.log(`✓ Co-Founder Team Members: ${founderTeam.length} records`);
  console.log(`✓ Co-Founder Finance Revenue: ₹${founderFinance.totalPaidRevenue}`);
  console.log(`✓ Co-Founder Reports: Role confirmed ${founderReports.role}`);
  console.log(`✓ Co-Founder Activity Logs: ${founderActivity.total} total events recorded\n`);

  // --------------------------------------------------
  // 4. INTERN FINANCIAL ISOLATION & ACCESS AUDIT
  // --------------------------------------------------
  console.log("--- 4. AUDITING INTERN FINANCIAL ISOLATION & ROLE SECURITY ---");

  // A. Intern Dashboard
  const internDash = await getDashboardData(internAuth);
  const internDashRaw = internDash as any;
  const prohibitedFinancialKeys = ["revenue", "expenses", "profit", "pendingPayments", "paidPayments", "financials"];
  for (const k of prohibitedFinancialKeys) {
    if (internDashRaw[k] !== undefined) {
      throw new Error(`SECURITY VIOLATION: Prohibited key '${k}' found in Intern Dashboard payload!`);
    }
  }
  console.log("✓ Intern Dashboard: Confirmed ZERO financial attributes");

  // B. Intern Clients
  const internClients = await getClients(internAuth, {});
  for (const client of internClients.clients) {
    if (client.financials !== undefined) {
      throw new Error(`SECURITY VIOLATION: Financials payload leaked in Intern Clients endpoint!`);
    }
  }
  console.log("✓ Intern Clients API: Confirmed financial fields masked");

  // C. Intern Projects
  const internProjects = await getProjects(internAuth, {});
  for (const project of internProjects.projects) {
    if (project.contractValue !== undefined) {
      throw new Error(`SECURITY VIOLATION: ContractValue leaked in Intern Projects endpoint!`);
    }
  }
  console.log("✓ Intern Projects API: Confirmed contractValue masked");

  // D. Intern Reports
  const internReports = await getReportsData(internAuth);
  const internRepRaw = internReports.data as any;
  for (const k of prohibitedFinancialKeys) {
    if (internRepRaw[k] !== undefined) {
      throw new Error(`SECURITY VIOLATION: Prohibited key '${k}' found in Intern Reports payload!`);
    }
  }
  console.log("✓ Intern Reports API: Confirmed ZERO financial attributes");

  // E. Forbidden Endpoints Check
  let leadsBlocked = false;
  try {
    await getLeads(internAuth, {});
  } catch (err: any) {
    if (err.statusCode === 403) leadsBlocked = true;
  }
  if (!leadsBlocked) throw new Error("SECURITY VIOLATION: INTERN accessed Leads API!");
  console.log("✓ Leads Module: Intern access blocked (403 Forbidden)");

  let financeBlocked = false;
  try {
    await getFinanceSummary(internAuth);
  } catch (err: any) {
    if (err.statusCode === 403) financeBlocked = true;
  }
  if (!financeBlocked) throw new Error("SECURITY VIOLATION: INTERN accessed Finance API!");
  console.log("✓ Finance Module: Intern access blocked (403 Forbidden)");

  let teamBlocked = false;
  try {
    await getTeamMembers(internAuth);
  } catch (err: any) {
    if (err.statusCode === 403) teamBlocked = true;
  }
  if (!teamBlocked) throw new Error("SECURITY VIOLATION: INTERN accessed Team API!");
  console.log("✓ Team Management Module: Intern access blocked (403 Forbidden)");

  let activityBlocked = false;
  try {
    await getActivityLogs(internAuth, {});
  } catch (err: any) {
    if (err.statusCode === 403) activityBlocked = true;
  }
  if (!activityBlocked) throw new Error("SECURITY VIOLATION: INTERN accessed Global Activity Log!");
  console.log("✓ Activity Log Module: Intern access blocked (403 Forbidden)\n");

  console.log("==================================================");
  console.log("ALL INTEGRATION & QA SECURITY TESTS PASSED! 🚀");
  console.log("==================================================");
}

runFullQAIntegration()
  .catch((err) => {
    console.error("\nQA TEST SUITE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
