import { prisma } from "../lib/db/prisma";
import {
  requireAuth,
  requireCoFounder,
  requireIntern,
  requireProjectAccess,
  requireTaskAccess,
  requireClientAccess,
} from "../lib/permissions/guards";
import { getFinanceSummary } from "../lib/services/finance.service";
import { getInvoices } from "../lib/services/invoice.service";
import { getQuotations } from "../lib/services/quotation.service";
import { getRecurringContracts } from "../lib/services/recurring.service";
import { getTeamMembers } from "../lib/services/team.service";
import { getWorkboardData } from "../lib/services/workboard.service";
import { getGlobalActivityLogs, getUserActivityLogs } from "../lib/services/activity.service";
import { validateAttachmentFile, sanitizeFileName } from "../lib/attachment-utils";
import { UserRole } from "@prisma/client";

async function runM15SecurityTest() {
  console.log("=== MAJOR MODULE M15: AUTHENTICATION + AUTHORIZATION SECURITY AUDIT ===");

  // 1. Setup Test Users
  let cofounder = await prisma.user.findFirst({
    where: { role: UserRole.CO_FOUNDER },
  });

  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Security CoFounder M15",
        email: "sec_cofounder@evolix.io",
        role: UserRole.CO_FOUNDER,
        isActive: true,
      },
    });
  }

  const cofounderAuth = {
    id: cofounder.id,
    name: cofounder.name,
    email: cofounder.email,
    role: cofounder.role,
    isActive: true,
  };

  let intern = await prisma.user.findFirst({
    where: { role: UserRole.INTERN },
  });

  if (!intern) {
    intern = await prisma.user.create({
      data: {
        name: "Security Intern M15",
        email: "sec_intern@evolix.io",
        role: UserRole.INTERN,
        isActive: true,
      },
    });
  }

  const internAuth = {
    id: intern.id,
    name: intern.name,
    email: intern.email,
    role: intern.role,
    isActive: true,
  };

  // ─── TEST SECTION 1: FINANCIAL ENDPOINT PROTECTION FOR INTERNS ───
  console.log("\n1. Testing Financial Endpoint Protection against Intern user...");

  // 1a. Finance Summary
  try {
    await getFinanceSummary(internAuth);
    throw new Error("SECURITY FAILURE: Intern accessed getFinanceSummary!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Finance Summary: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 1b. Invoices
  try {
    await getInvoices(internAuth, {});
    throw new Error("SECURITY FAILURE: Intern accessed getInvoices!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Invoices API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 1c. Quotations
  try {
    await getQuotations(internAuth, {});
    throw new Error("SECURITY FAILURE: Intern accessed getQuotations!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Quotations API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 1d. Recurring Deals
  try {
    await getRecurringContracts(internAuth, {});
    throw new Error("SECURITY FAILURE: Intern accessed getRecurringContracts!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Recurring Deals API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // ─── TEST SECTION 2: ADMIN & OPERATIONAL ENDPOINT PROTECTION ───
  console.log("\n2. Testing Administrative Endpoint Protection against Intern user...");

  // 2a. User Management
  try {
    await getTeamMembers(internAuth);
    throw new Error("SECURITY FAILURE: Intern accessed getTeamMembers!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ User Management API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 2b. Team Leader Workboard
  try {
    await getWorkboardData(internAuth);
    throw new Error("SECURITY FAILURE: Intern accessed getWorkboardData!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Team Leader Workboard API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 2c. Global Audit Activity Log
  try {
    await getGlobalActivityLogs(internAuth, {});
    throw new Error("SECURITY FAILURE: Intern accessed getGlobalActivityLogs!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ Global Audit Log API: Intern rejected with HTTP 403 Forbidden");
    } else throw err;
  }

  // 2d. Other User's Activity Logs
  try {
    await getUserActivityLogs(internAuth, cofounder.id, {});
    throw new Error("SECURITY FAILURE: Intern accessed another user's activity logs!");
  } catch (err: any) {
    if (err.statusCode === 403) {
      console.log("   ✓ User Log Privacy: Intern rejected from reading other user logs with HTTP 403 Forbidden");
    } else throw err;
  }

  // ─── TEST SECTION 3: RESOURCE OWNERSHIP & PRIVACY BOUNDARIES FOR INTERNS ───
  console.log("\n3. Testing Resource Ownership Boundaries for Intern user...");

  // 3a. Unassigned Project Access Check
  const dummyProjectId = "00000000-0000-0000-0000-000000000001";
  try {
    await requireProjectAccess(intern.id, dummyProjectId, UserRole.INTERN);
    throw new Error("SECURITY FAILURE: Intern granted access to dummy project!");
  } catch (err: any) {
    if (err.statusCode === 404 || err.statusCode === 403) {
      console.log(`   ✓ Unassigned Project: Access properly denied (${err.message})`);
    } else throw err;
  }

  // 3b. Unassigned Task Access Check
  const dummyTaskId = "00000000-0000-0000-0000-000000000002";
  try {
    await requireTaskAccess(intern.id, dummyTaskId, UserRole.INTERN);
    throw new Error("SECURITY FAILURE: Intern granted access to dummy task!");
  } catch (err: any) {
    if (err.statusCode === 404 || err.statusCode === 403) {
      console.log(`   ✓ Unassigned Task: Access properly denied (${err.message})`);
    } else throw err;
  }

  // 3c. Unassigned Client Access Check
  const dummyClientId = "00000000-0000-0000-0000-000000000003";
  try {
    await requireClientAccess(intern.id, dummyClientId, UserRole.INTERN);
    throw new Error("SECURITY FAILURE: Intern granted access to dummy client!");
  } catch (err: any) {
    if (err.statusCode === 404 || err.statusCode === 403) {
      console.log(`   ✓ Unassigned Client: Access properly denied (${err.message})`);
    } else throw err;
  }

  // ─── TEST SECTION 4: FILE UPLOAD SECURITY AUDIT ───
  console.log("\n4. Testing File Upload Security & Sanitization...");

  // 4a. Executable extension rejection
  const exeTest = validateAttachmentFile("malicious_script.exe", "application/x-msdownload", 1024);
  if (exeTest.valid) {
    throw new Error("SECURITY FAILURE: Executable extension .exe was accepted!");
  }
  console.log(`   ✓ Executable Rejection: .exe file blocked (${exeTest.error})`);

  // 4b. Path traversal sanitization
  const sanitizedPath = sanitizeFileName("../../etc/passwd");
  if (sanitizedPath.includes("/") || sanitizedPath.includes("\\") || sanitizedPath.includes("..")) {
    throw new Error(`SECURITY FAILURE: Path traversal string was not sanitized: ${sanitizedPath}`);
  }
  console.log(`   ✓ Path Traversal Protection: '../../etc/passwd' sanitized safely to '${sanitizedPath}'`);

  // 4c. MIME mismatch rejection
  const mimeMismatchTest = validateAttachmentFile("document.pdf", "image/png", 1024);
  if (mimeMismatchTest.valid) {
    throw new Error("SECURITY FAILURE: Mismatched MIME type vs extension accepted!");
  }
  console.log(`   ✓ MIME Consistency Check: PDF file with PNG mime blocked (${mimeMismatchTest.error})`);

  // 4d. Oversized file rejection
  const oversizedTest = validateAttachmentFile("large_file.pdf", "application/pdf", 15 * 1024 * 1024);
  if (oversizedTest.valid) {
    throw new Error("SECURITY FAILURE: 15MB file accepted despite 10MB limit!");
  }
  console.log(`   ✓ File Size Limit: 15MB file blocked (${oversizedTest.error})`);

  // ─── TEST SECTION 5: CO-FOUNDER FULL PERMISSIONS VERIFICATION ───
  console.log("\n5. Testing Co-Founder Permissions...");
  const cofounderFinance = await getFinanceSummary(cofounderAuth);
  console.log(`   ✓ Co-Founder Access Verified: Finance summary accessible (Total Revenue: ₹${cofounderFinance.totalPaidRevenue})`);

  const cofounderTeam = await getTeamMembers(cofounderAuth);
  console.log(`   ✓ Co-Founder Access Verified: Team members directory accessible (${cofounderTeam.length} members)`);

  console.log("\n=== MAJOR MODULE M15 SECURITY AUDIT PASSED 100% ===");
}

runM15SecurityTest()
  .catch((err) => {
    console.error("Security Audit Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
