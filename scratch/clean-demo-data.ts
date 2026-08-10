import { prisma } from "../lib/db/prisma";

async function cleanDemoData() {
  console.log("Cleaning test and demo data from EVOLIX OS database...");

  // Delete dependent records first to handle foreign keys properly
  const deletedBillingPeriods = await prisma.recurringBillingPeriod.deleteMany({});
  console.log(`Deleted ${deletedBillingPeriods.count} recurring billing periods.`);

  const deletedRecurringContracts = await prisma.recurringContract.deleteMany({});
  console.log(`Deleted ${deletedRecurringContracts.count} recurring contracts.`);

  const deletedInvoiceItems = await prisma.invoiceItem.deleteMany({});
  console.log(`Deleted ${deletedInvoiceItems.count} invoice items.`);

  const deletedInvoices = await prisma.invoice.deleteMany({});
  console.log(`Deleted ${deletedInvoices.count} invoices.`);

  const deletedQuotationItems = await prisma.quotationItem.deleteMany({});
  console.log(`Deleted ${deletedQuotationItems.count} quotation items.`);

  const deletedQuotations = await prisma.quotation.deleteMany({});
  console.log(`Deleted ${deletedQuotations.count} quotations.`);

  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`Deleted ${deletedPayments.count} payments.`);

  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`Deleted ${deletedExpenses.count} expenses.`);

  const deletedTaskAttachments = await prisma.taskAttachment.deleteMany({});
  console.log(`Deleted ${deletedTaskAttachments.count} task attachments.`);

  const deletedTaskComments = await prisma.taskComment.deleteMany({});
  console.log(`Deleted ${deletedTaskComments.count} task comments.`);

  const deletedTasks = await prisma.task.deleteMany({});
  console.log(`Deleted ${deletedTasks.count} tasks.`);

  const deletedProjectPhases = await prisma.projectPhase.deleteMany({});
  console.log(`Deleted ${deletedProjectPhases.count} project phases.`);

  const deletedProjectMembers = await prisma.projectMember.deleteMany({});
  console.log(`Deleted ${deletedProjectMembers.count} project members.`);

  const deletedProjects = await prisma.project.deleteMany({});
  console.log(`Deleted ${deletedProjects.count} projects.`);

  const deletedOnboardings = await prisma.onboarding.deleteMany({});
  console.log(`Deleted ${deletedOnboardings.count} onboardings.`);

  const deletedClients = await prisma.client.deleteMany({});
  console.log(`Deleted ${deletedClients.count} clients.`);

  const deletedMeetingReminders = await prisma.meetingReminder.deleteMany({});
  console.log(`Deleted ${deletedMeetingReminders.count} meeting reminders.`);

  const deletedMeetings = await prisma.meeting.deleteMany({});
  console.log(`Deleted ${deletedMeetings.count} meetings.`);

  const deletedLeadFollowUps = await prisma.leadFollowUp.deleteMany({});
  console.log(`Deleted ${deletedLeadFollowUps.count} lead follow-ups.`);

  const deletedLeadActivities = await prisma.leadActivity.deleteMany({});
  console.log(`Deleted ${deletedLeadActivities.count} lead activities.`);

  const deletedLeads = await prisma.lead.deleteMany({});
  console.log(`Deleted ${deletedLeads.count} leads.`);

  const deletedNoteAttachments = await prisma.noteAttachment.deleteMany({});
  console.log(`Deleted ${deletedNoteAttachments.count} note attachments.`);

  const deletedNotifications = await prisma.notification.deleteMany({});
  console.log(`Deleted ${deletedNotifications.count} notifications.`);

  const deletedActivityLogs = await prisma.activityLog.deleteMany({});
  console.log(`Deleted ${deletedActivityLogs.count} activity logs.`);

  const deletedAttendance = await prisma.attendance.deleteMany({});
  console.log(`Deleted ${deletedAttendance.count} attendance records.`);

  // Clean test user accounts created by test scripts (e.g. M16_TEST_Intern, sec_cofounder, sec_intern, crmfounder)
  const deletedTestUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "test" } },
        { email: { contains: "sec_" } },
        { email: { contains: "crmfounder" } },
        { name: { contains: "M16_TEST" } },
        { name: { contains: "Security" } },
        { name: { contains: "CRM Founder" } },
      ],
    },
  });
  console.log(`Deleted ${deletedTestUsers.count} test user accounts.`);

  console.log("\n✅ All demo and test data has been successfully cleaned!");
  console.log("Core users and system structure remain intact.");
}

cleanDemoData()
  .catch((err) => {
    console.error("Error cleaning demo data:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
