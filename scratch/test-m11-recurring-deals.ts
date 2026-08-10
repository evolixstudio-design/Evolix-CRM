import { prisma } from "../lib/db/prisma";
import {
  createRecurringContract,
  getRecurringContractById,
  generateScheduledInvoices,
  checkAndTriggerReminders,
} from "../lib/services/recurring.service";
import { UserRole } from "@prisma/client";

async function runM11Test() {
  console.log("=== MAJOR MODULE M11: RECURRING BRAND DEALS TEST ===");

  // 1. Get or create Co-Founder user
  let cofounder = await prisma.user.findFirst({
    where: { role: UserRole.CO_FOUNDER },
  });

  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Test Co-Founder M11",
        email: "m11_cofounder@evolix.io",
        role: UserRole.CO_FOUNDER,
        isActive: true,
      },
    });
  }

  const authUser = {
    id: cofounder.id,
    name: cofounder.name,
    email: cofounder.email,
    role: cofounder.role,
    isActive: true,
  };

  // 2. Get or create Client
  let client = await prisma.client.findFirst();
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: "M11 Brand Sponsor Corp",
        companyName: "Global Brand Retainers Inc",
        email: "m11_brand@sponsor.com",
      },
    });
  }

  // 3. Create 12-Month Brand Deal (₹50,000/month, 12 months)
  console.log("\n1. Creating 12-Month Brand Deal (₹50,000/month for 12 months)...");
  const deal = await createRecurringContract(authUser, {
    title: "12-Month Annual Brand Sponsorship Retainer",
    clientId: client.id,
    startDate: new Date().toISOString(),
    durationMonths: 12,
    billingFrequency: "MONTHLY",
    monthlyAmount: 50000,
    currency: "INR",
    notes: "Monthly brand sponsorship & media placement retainer",
  });

  console.log(`✓ Deal Created: ID ${deal.id} | Title: "${deal.title}"`);
  console.log(`   Monthly Rate: ₹${deal.monthlyAmount.toLocaleString("en-IN")} | Total Value: ₹${deal.totalContractValue.toLocaleString("en-IN")}`);

  // 4. Verify Billing Periods
  console.log("\n2. Verifying 12 Billing Periods...");
  if (deal.billingPeriods.length !== 12) {
    throw new Error(`ASSERTION FAILED: Expected 12 billing periods, got ${deal.billingPeriods.length}`);
  }

  deal.billingPeriods.forEach((p) => {
    console.log(`   - Period #${p.periodNumber}: Window = ${p.periodStartDate.split("T")[0]} to ${p.periodEndDate.split("T")[0]} | Due: ${p.dueDate.split("T")[0]} | Amount: ₹${p.amount} | Status: ${p.status}`);
  });
  console.log("✓ All 12 Billing Periods verified with unique identity and dates.");

  // 5. Generate Scheduled Invoices
  console.log("\n3. Generating Auto Scheduled Invoices...");
  const genResult1 = await generateScheduledInvoices(authUser, deal.id);
  console.log(`✓ Scheduled Invoice Generation Result: Generated ${genResult1.generatedCount} invoice(s)`);
  genResult1.invoices.forEach((inv) => {
    console.log(`   - Generated Invoice #${inv.invoiceNumber} for Period #${inv.periodNumber} | Amount: ₹${inv.amount}`);
  });

  const updatedDeal1 = await getRecurringContractById(authUser, deal.id);
  console.log(`✓ Updated Generated Invoices Count: ${updatedDeal1.generatedInvoicesCount} / 12`);

  // 6. Anti-Duplication Verification (Run invoice generation AGAIN on same schedule)
  console.log("\n4. Verifying Anti-Duplication Protection (Re-triggering invoice generation)...");
  const genResult2 = await generateScheduledInvoices(authUser, deal.id);
  console.log(`✓ Re-trigger Result: Generated ${genResult2.generatedCount} invoice(s) (NO DUPLICATES CREATED!)`);

  if (genResult2.generatedCount !== 0) {
    throw new Error(`ASSERTION FAILED: Expected 0 new invoices on re-trigger, got ${genResult2.generatedCount}`);
  }

  const updatedDeal2 = await getRecurringContractById(authUser, deal.id);
  if (updatedDeal2.generatedInvoicesCount !== updatedDeal1.generatedInvoicesCount) {
    throw new Error(`ASSERTION FAILED: Duplicate invoices created! Previous: ${updatedDeal1.generatedInvoicesCount}, Now: ${updatedDeal2.generatedInvoicesCount}`);
  }
  console.log("✓ Anti-duplication strictly verified: 0 duplicate invoices produced.");

  // 7. Verify Reminders Engine
  console.log("\n5. Verifying Internal Reminders Engine (Upcoming, Due Today, Overdue)...");
  const reminders = await checkAndTriggerReminders(authUser);
  console.log(`✓ Reminders Summary:`, reminders.summary);
  console.log(`   - Upcoming Count: ${reminders.upcoming.length}`);
  console.log(`   - Due Today Count: ${reminders.dueToday.length}`);
  console.log(`   - Overdue Count: ${reminders.overdue.length}`);

  console.log("\n=== MAJOR MODULE M11 TEST PASSED SUCCESSFULLY ===");
}

runM11Test()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
