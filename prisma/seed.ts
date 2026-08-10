import {
  PrismaClient,
  UserRole,
  LeadStatus,
  LeadPriority,
  LeadSource,
  ClientStatus,
  OnboardingStatus,
  ProjectServiceType,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
  PaymentMethod,
  PaymentStatus,
  NotificationType,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with Module 2 test records...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Co-Founders
  const f1 = await prisma.user.upsert({
    where: { email: "qusai@evolix.io" },
    update: { name: "Qusai", passwordHash, isActive: true },
    create: {
      name: "Qusai",
      email: "qusai@evolix.io",
      role: UserRole.CO_FOUNDER,
      passwordHash,
    },
  });

  const f2 = await prisma.user.upsert({
    where: { email: "saifuddin@evolix.io" },
    update: { name: "Saifuddin", passwordHash, isActive: true },
    create: {
      name: "Saifuddin",
      email: "saifuddin@evolix.io",
      role: UserRole.CO_FOUNDER,
      passwordHash,
    },
  });

  const f3 = await prisma.user.upsert({
    where: { email: "taikhum@evolix.io" },
    update: { name: "Taikhum", passwordHash, isActive: true },
    create: {
      name: "Taikhum",
      email: "taikhum@evolix.io",
      role: UserRole.CO_FOUNDER,
      passwordHash,
    },
  });

  // 2. Interns
  const i1 = await prisma.user.upsert({
    where: { email: "huzefa@evolix.io" },
    update: { name: "Huzefa", passwordHash, isActive: true },
    create: {
      name: "Huzefa",
      email: "huzefa@evolix.io",
      role: UserRole.INTERN,
      passwordHash,
    },
  });

  const i2 = await prisma.user.upsert({
    where: { email: "intern2@evolix.io" },
    update: { name: "Emma Watson", passwordHash, isActive: true },
    create: {
      name: "Emma Watson",
      email: "intern2@evolix.io",
      role: UserRole.INTERN,
      passwordHash,
    },
  });

  // 3. Leads
  const lead1 = await prisma.lead.create({
    data: {
      name: "Starlight Media Inquiry",
      companyName: "Starlight Media",
      email: "contact@starlight.io",
      source: LeadSource.WEBSITE,
      service: "Website Redesign",
      status: LeadStatus.NEW,
      priority: LeadPriority.HIGH,
      estimatedValue: 12000,
      assignedToId: f1.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: "Apex Logistics Outreach",
      companyName: "Apex Logistics",
      email: "info@apex.com",
      source: LeadSource.LINKEDIN,
      service: "Software Development",
      status: LeadStatus.WON,
      priority: LeadPriority.URGENT,
      estimatedValue: 25000,
      assignedToId: f2.id,
      convertedAt: new Date(),
    },
  });

  // 4. Clients
  const client1 = await prisma.client.create({
    data: {
      name: "Apex Logistics Corp",
      companyName: "Apex Logistics",
      email: "billing@apex.com",
      status: ClientStatus.ACTIVE,
      assignedToId: f2.id,
      convertedFromLeadId: lead2.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Horizon E-Commerce",
      companyName: "Horizon Brands",
      email: "hello@horizon.io",
      status: ClientStatus.ONBOARDING,
      assignedToId: i1.id,
    },
  });

  // 5. Onboarding
  await prisma.onboarding.create({
    data: {
      clientId: client2.id,
      status: OnboardingStatus.IN_PROGRESS,
      startDate: new Date(),
    },
  });

  // 6. Projects
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      name: "Apex Global Portal",
      description: "Custom enterprise Web application",
      serviceType: ProjectServiceType.SOFTWARE,
      status: ProjectStatus.IN_PROGRESS,
      priority: ProjectPriority.HIGH,
      contractValue: 25000,
      ownerId: f2.id,
      members: {
        create: [
          { userId: i1.id },
          { userId: i2.id },
        ],
      },
    },
  });

  // 7. Tasks
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Overdue Task assigned to Intern 1
  await prisma.task.create({
    data: {
      projectId: project1.id,
      clientId: client1.id,
      title: "Integrate Payment Gateway Webhooks",
      description: "Configure Stripe webhook handlers",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignedToId: i1.id,
      createdById: f2.id,
      dueDate: yesterday,
    },
  });

  // Today's Task assigned to Intern 1
  await prisma.task.create({
    data: {
      projectId: project1.id,
      clientId: client1.id,
      title: "UI Design Mockups Review",
      description: "Finalize dashboard mockups",
      status: TaskStatus.ASSIGNED,
      priority: TaskPriority.MEDIUM,
      assignedToId: i1.id,
      createdById: f1.id,
      dueDate: now,
    },
  });

  // Completed Task assigned to Intern 1
  await prisma.task.create({
    data: {
      projectId: project1.id,
      clientId: client1.id,
      title: "Database Schema Migration",
      description: "Initial PostgreSQL schema setup",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      assignedToId: i1.id,
      createdById: f1.id,
      dueDate: yesterday,
      completedAt: yesterday,
    },
  });

  // Task assigned to Intern 2
  await prisma.task.create({
    data: {
      projectId: project1.id,
      clientId: client1.id,
      title: "API Documentation Draft",
      description: "Document REST endpoints",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      assignedToId: i2.id,
      createdById: f3.id,
      dueDate: tomorrow,
    },
  });

  // 8. Payments (Financials)
  await prisma.payment.create({
    data: {
      clientId: client1.id,
      projectId: project1.id,
      amount: 15000,
      paymentDate: new Date(),
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PAID,
      recordedById: f2.id,
    },
  });

  await prisma.payment.create({
    data: {
      clientId: client1.id,
      projectId: project1.id,
      amount: 10000,
      paymentDate: tomorrow,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PENDING,
      recordedById: f2.id,
    },
  });

  // 9. Expenses (Financials)
  await prisma.expense.create({
    data: {
      clientId: client1.id,
      projectId: project1.id,
      category: "Hosting",
      description: "AWS Cloud Infrastructure & Database",
      amount: 3500,
      expenseDate: new Date(),
      recordedById: f1.id,
    },
  });

  // 10. Notifications
  await prisma.notification.create({
    data: {
      userId: i1.id,
      type: NotificationType.TASK_ASSIGNED,
      title: "New Task Assigned",
      message: "You have been assigned to 'UI Design Mockups Review'.",
      isRead: false,
    },
  });

  console.log("Module 2 database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
