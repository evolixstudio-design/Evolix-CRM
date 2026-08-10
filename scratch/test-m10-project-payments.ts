import { prisma } from "../lib/db/prisma";
import { createProject, createProjectPhase, getProjectById } from "../lib/services/project.service";
import { createPayment } from "../lib/services/finance.service";
import { createInvoice } from "../lib/services/invoice.service";
import { UserRole, ProjectServiceType, PaymentMethod, PaymentStatus } from "@prisma/client";

async function runM10Test() {
  console.log("=== MAJOR MODULE M10: PROJECT PAYMENTS + MILESTONES TEST ===");

  // 1. Get or create Co-Founder user
  let cofounder = await prisma.user.findFirst({
    where: { role: UserRole.CO_FOUNDER },
  });

  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Test Co-Founder",
        email: "m10_cofounder@evolix.io",
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
        name: "M10 Enterprise Client",
        companyName: "Acme Payments Corp",
        email: "m10_client@acme.com",
      },
    });
  }

  // 3. Create Project with ₹1,20,000 value
  console.log("\n1. Creating Project with ₹1,20,000 contract value...");
  const project = await createProject(authUser, {
    clientId: client.id,
    name: "M10 Payment Tracking Test Project",
    serviceType: ProjectServiceType.SOFTWARE,
    contractValue: 120000,
    currency: "INR",
  });

  console.log(`✓ Project Created: ${project.id} | Name: ${project.name} | Contract Value: ₹${project.contractValue}`);

  // 4. Create 4 Milestones (₹30,000 each)
  console.log("\n2. Creating 4 Milestone Phases (₹30,000 each)...");
  
  await createProjectPhase(authUser, project.id, {
    name: "Phase 1",
    amount: 30000,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    order: 0,
  });

  await createProjectPhase(authUser, project.id, {
    name: "Phase 2",
    amount: 30000,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    order: 1,
  });

  await createProjectPhase(authUser, project.id, {
    name: "Phase 3",
    amount: 30000,
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    order: 2,
  });

  await createProjectPhase(authUser, project.id, {
    name: "Phase 4",
    amount: 30000,
    dueDate: new Date(Date.now() + 28 * 86400000).toISOString(),
    order: 3,
  });

  let projectData = await getProjectById(authUser, project.id);
  console.log(`✓ Created 4 Milestones. Total Milestones Count: ${projectData.phases?.length}`);
  projectData.phases?.forEach((p) => {
    console.log(`   - ${p.name}: Amount = ₹${p.amount} | Due: ${p.dueDate?.split("T")[0]} | Status: ${p.paymentStatus}`);
  });

  const phase1 = projectData.phases?.find((p) => p.name === "Phase 1");
  if (!phase1) throw new Error("Phase 1 not found");

  // 5. Generate/update invoice relationship for Phase 1
  console.log("\n3. Generating/linking Invoice for Phase 1...");
  const invoice = await createInvoice(authUser, {
    projectId: project.id,
    clientId: client.id,
    items: [
      {
        description: "Phase 1 Milestone Deliverable",
        quantity: 1,
        unitRate: 30000,
      },
    ],
  });

  // Link invoice to Phase 1
  await prisma.projectPhase.update({
    where: { id: phase1.id },
    data: { invoiceId: invoice.id },
  });

  console.log(`✓ Invoice Linked: ${invoice.invoiceNumber} -> Phase 1 (${phase1.id})`);

  // 6. Record payment of ₹30,000 for Phase 1
  console.log("\n4. Recording payment of ₹30,000 for Phase 1...");
  const payment = await createPayment(authUser, {
    clientId: client.id,
    projectId: project.id,
    phaseId: phase1.id,
    invoiceId: invoice.id,
    amount: 30000,
    paymentDate: new Date().toISOString(),
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PAID,
    reference: "BANK-UTR-99881122",
  });

  console.log(`✓ Payment Recorded: ID ${payment.id} | Amount: ₹${payment.amount} | Ref: ${payment.reference}`);

  // 7. Verify Amount Received, Amount Pending, and Statuses
  console.log("\n5. Verifying Project Financial Metrics & Milestone Status...");
  const finalProject = await getProjectById(authUser, project.id);

  console.log(`   Project Value: ₹${finalProject.projectValue}`);
  console.log(`   Amount Received: ₹${finalProject.amountReceived}`);
  console.log(`   Amount Pending: ₹${finalProject.amountPending}`);
  console.log(`   Project Payment Status: ${finalProject.paymentStatus}`);

  if (finalProject.amountReceived !== 30000) {
    throw new Error(`ASSERTION FAILED: Amount Received expected 30000, got ${finalProject.amountReceived}`);
  }

  if (finalProject.amountPending !== 90000) {
    throw new Error(`ASSERTION FAILED: Amount Pending expected 90000, got ${finalProject.amountPending}`);
  }

  const updatedPhase1 = finalProject.phases?.find((p) => p.id === phase1.id);
  console.log(`   Phase 1 Payment Status: ${updatedPhase1?.paymentStatus} | Paid Date: ${updatedPhase1?.paymentReceivedDate}`);

  if (updatedPhase1?.paymentStatus !== PaymentStatus.PAID) {
    throw new Error(`ASSERTION FAILED: Phase 1 Payment Status expected PAID, got ${updatedPhase1?.paymentStatus}`);
  }

  console.log("\n=== MAJOR MODULE M10 TEST PASSED SUCCESSFULLY ===");
}

runM10Test()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
