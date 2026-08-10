import { prisma } from "../lib/db/prisma";

async function cleanQaData() {
  console.log("Cleaning up all QA and mock business data from Evolix OS database...");

  // Delete child records first to respect foreign key constraints
  await prisma.$transaction([
    prisma.taskAttachment.deleteMany({}),
    prisma.taskComment.deleteMany({}),
    prisma.task.deleteMany({}),
    prisma.projectMember.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.onboarding.deleteMany({}),
    prisma.payment.deleteMany({}),
    prisma.expense.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.leadActivity.deleteMany({}),
    prisma.lead.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.activityLog.deleteMany({}),
  ]);

  console.log("✓ Successfully removed all QA leads, clients, onboarding, projects, tasks, payments, expenses, notifications, and activity logs.");
  console.log("✓ Kept user accounts so you can log in immediately.");
}

cleanQaData()
  .catch((err) => {
    console.error("Failed to clean QA data:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
