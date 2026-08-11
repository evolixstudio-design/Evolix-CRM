import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🧹 Clearing all mock and test data from the database...");

  // Delete dependent child records first to respect foreign key constraints
  await prisma.subtask.deleteMany({});
  await prisma.taskAttachment.deleteMany({});
  await prisma.taskComment.deleteMany({});
  await prisma.task.deleteMany({});

  await prisma.projectPhase.deleteMany({});
  await prisma.projectMember.deleteMany({});

  await prisma.payment.deleteMany({});
  await prisma.expense.deleteMany({});

  await prisma.invoiceItem.deleteMany({});
  await prisma.recurringBillingPeriod.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.recurringContract.deleteMany({});

  await prisma.project.deleteMany({});
  await prisma.onboarding.deleteMany({});
  await prisma.client.deleteMany({});

  await prisma.leadActivity.deleteMany({});
  await prisma.leadFollowUp.deleteMany({});
  await prisma.meetingReminder.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.lead.deleteMany({});

  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});

  await prisma.noteAttachment.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.attendance.deleteMany({});

  await prisma.user.deleteMany({});


  console.log("✨ Database cleared successfully! Re-creating clean admin user accounts...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Co-Founders and Interns
  await prisma.user.createMany({
    data: [
      {
        name: "Qusai",
        email: "qusai@evolix.io",
        role: UserRole.CO_FOUNDER,
        passwordHash,
        isActive: true,
      },
      {
        name: "Saifuddin",
        email: "saifuddin@evolix.io",
        role: UserRole.CO_FOUNDER,
        passwordHash,
        isActive: true,
      },
      {
        name: "Taikhum",
        email: "taikhum@evolix.io",
        role: UserRole.CO_FOUNDER,
        passwordHash,
        isActive: true,
      },
      {
        name: "Huzefa",
        email: "huzefa@evolix.io",
        role: UserRole.INTERN,
        passwordHash,
        isActive: true,
      },
    ],
  });

  console.log("🎉 Clean database reset complete! System is ready with 4 active admin users.");
}

clearDatabase()
  .catch((e) => {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
