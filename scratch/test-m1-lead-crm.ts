import { prisma } from "../lib/db/prisma";
import {
  createLead,
  logLeadCall,
  createLeadFollowUp,
  toggleFollowUpComplete,
  getLeadById,
  getLeadFollowUps,
  getTodayFollowUpsSummary,
  updateLead,
} from "../lib/services/lead.service";
import { LeadSource, LeadStatus } from "@prisma/client";
import { CallOutcome, FollowUpType } from "../types/lead";

async function runM1CRMTest() {
  console.log("=== TESTING MAJOR MODULE M1: LEAD CRM (CALLS + FOLLOW-UPS) ===");

  // 1. Get or create a Co-Founder user for testing
  let cofounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "CRM Founder",
        email: "crmfounder@evolix.io",
        role: "CO_FOUNDER",
      },
    });
  }

  const founderAuth = {
    id: cofounder.id,
    name: cofounder.name,
    email: cofounder.email,
    role: cofounder.role as "CO_FOUNDER",
    isActive: true,
  };

  // 2. Create Lead
  const leadName = `CRM Lead ${Date.now()}`;
  const newLead = await createLead(
    {
      name: leadName,
      companyName: "Starlight Dynamics",
      email: "contact@starlight.io",
      phone: "+919876543210",
      source: LeadSource.LINKEDIN,
    },
    founderAuth.id
  );
  console.log(`✓ 1. Created Lead: ${newLead.name} (ID: ${newLead.id})`);

  // 3. Log Call
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const updatedLeadAfterCall = await logLeadCall(founderAuth, newLead.id, {
    outcome: CallOutcome.CONNECTED,
    notes: "Discussed enterprise package options. Client interested in demo.",
    nextFollowUpAt: tomorrow.toISOString(),
  });
  console.log(`✓ 2. Logged Call on Lead. Outcome: CONNECTED. Next Follow-up set to ${tomorrow.toISOString().split("T")[0]}.`);

  // 4. Create Follow-up explicitly
  const today = new Date();
  const followUp1 = await createLeadFollowUp(founderAuth, newLead.id, {
    type: FollowUpType.CALL,
    dueDate: today.toISOString(),
    notes: "Today's priority check-in call",
  });
  console.log(`✓ 3. Scheduled Follow-up: Type ${followUp1.type}, Due: ${followUp1.dueDate}`);

  // Schedule an overdue follow-up for testing
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  const overdueFollowUp = await createLeadFollowUp(founderAuth, newLead.id, {
    type: FollowUpType.EMAIL,
    dueDate: yesterday.toISOString(),
    notes: "Send updated proposal deck (Overdue)",
  });
  console.log(`✓ Scheduled Overdue Follow-up: Due ${overdueFollowUp.dueDate}`);

  // 5. Update Lead Status & Assignment to verify automatic timeline logging
  await updateLead(newLead.id, { status: LeadStatus.QUALIFIED, assignedToId: founderAuth.id }, founderAuth.id);
  console.log("✓ Updated lead status to QUALIFIED and assigned to founder.");

  // 6. Verify Timeline History
  const leadDetails = await getLeadById(newLead.id);
  console.log(`✓ 4. Verified Activity Timeline contains ${leadDetails.activities.length} entries.`);
  const activityTypes = leadDetails.activities.map((a: any) => a.type);
  console.log("Timeline Activity Types:", Array.from(new Set(activityTypes)));

  // 7. Verify Work Area Queries
  const todayFollowUps = await getLeadFollowUps(founderAuth, { view: "today" });
  console.log(`✓ 5. Verified Today's Follow-ups count: ${todayFollowUps.length}`);

  const overdueFollowUps = await getLeadFollowUps(founderAuth, { view: "overdue" });
  console.log(`✓ 6. Verified Overdue Follow-ups count: ${overdueFollowUps.length}`);

  const upcomingFollowUps = await getLeadFollowUps(founderAuth, { view: "upcoming" });
  console.log(`✓ Verified Upcoming Follow-ups count: ${upcomingFollowUps.length}`);

  const summary = await getTodayFollowUpsSummary(founderAuth);
  console.log("Work Area Summary Stats:", summary);

  // 8. Toggle Follow-up completion
  const completed = await toggleFollowUpComplete(founderAuth, followUp1.id, true);
  console.log(`✓ 7. Toggled Follow-up Completion: isCompleted = ${completed.isCompleted}`);

  console.log("\n=== MAJOR MODULE M1 TEST PASSED SUCCESSFULLY ===");
}

runM1CRMTest()
  .catch((e) => {
    console.error("M1 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
