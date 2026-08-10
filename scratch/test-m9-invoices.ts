import { prisma } from "../lib/db/prisma";
import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoiceStatus,
  generateInvoiceNumber,
} from "../lib/services/invoice.service";
import { InvoiceStatus } from "@prisma/client";

async function runM9InvoiceTest() {
  console.log("=== TESTING MAJOR MODULE M9: INVOICE MANAGEMENT ===");

  // 1. Get or create Co-Founder user
  let coFounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!coFounder) {
    coFounder = await prisma.user.create({
      data: {
        name: "Test Co-Founder",
        email: "cofounder.m9@evolix.io",
        role: "CO_FOUNDER",
      },
    });
  }

  const coFounderAuth = {
    id: coFounder.id,
    name: coFounder.name,
    email: coFounder.email,
    role: coFounder.role as "CO_FOUNDER",
    isActive: true,
  };

  // 2. Create test Client & Project
  const client = await prisma.client.create({
    data: {
      name: "Summit Enterprises",
      companyName: "Summit Global Tech",
      email: "billing@summit.com",
      phone: "+919876543211",
      assignedToId: coFounder.id,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Summit Enterprise ERP System",
      clientId: client.id,
      serviceType: "SOFTWARE",
      contractValue: 250000,
      currency: "INR",
      ownerId: coFounder.id,
    },
  });

  console.log(`✓ 1. Created Test Client '${client.name}' and Project '${project.name}'`);

  // 3. Test Invoice Auto-Number Generation
  const invNumber = await generateInvoiceNumber();
  console.log(`✓ 2. Generated Invoice Number: ${invNumber}`);
  if (!invNumber.startsWith("INV-")) {
    throw new Error("FAIL: Invoice number pattern invalid!");
  }

  // 4. Create Invoice with Line Items & Financial Calculations
  const createPayload = {
    projectId: project.id,
    clientId: client.id,
    currency: "INR",
    discountAmount: 10000,
    taxRate: 18, // 18% GST
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    terms: "Net 14 payment terms",
    notes: "Phase 1 Software Deliverable",
    items: [
      { description: "Custom Software Development — Phase 1", quantity: 1, unitRate: 150000 },
      { description: "Database Optimization & Indexing", quantity: 2, unitRate: 25000 },
    ],
  };

  const invoice = await createInvoice(coFounderAuth, createPayload);

  console.log(`\n✓ 3. Created Invoice #${invoice.invoiceNumber}:`);
  console.log(`   Client: ${invoice.client.name} (${invoice.client.companyName})`);
  console.log(`   Project: ${invoice.project?.name}`);

  // Subtotal = 150000 + (2 * 25000) = 200,000
  // Discount = 10,000 => Taxable Subtotal = 190,000
  // Tax (18%) = 190,000 * 0.18 = 34,200
  // Total = 190,000 + 34,200 = 224,200
  console.log(`\n✓ 4. Verified Financial Calculation Engine (Default Currency: ${invoice.currency}):`);
  console.log(`   Subtotal: ₹${invoice.subtotal.toLocaleString("en-IN")}`);
  console.log(`   Discount: -₹${invoice.discountAmount.toLocaleString("en-IN")}`);
  console.log(`   Tax Rate: ${invoice.taxRate}%`);
  console.log(`   Total Invoice Amount: ₹${invoice.totalAmount.toLocaleString("en-IN")}`);

  if (invoice.subtotal !== 200000) {
    throw new Error(`FAIL: Expected subtotal 200000, got ${invoice.subtotal}`);
  }
  if (invoice.totalAmount !== 224200) {
    throw new Error(`FAIL: Expected totalAmount 224200, got ${invoice.totalAmount}`);
  }

  // 5. Test Status Transitions
  let updatedInv = await updateInvoiceStatus(coFounderAuth, invoice.id, InvoiceStatus.SENT);
  console.log(`\n✓ 5. Status Transition: DRAFT -> ${updatedInv.status}`);

  updatedInv = await updateInvoiceStatus(coFounderAuth, invoice.id, InvoiceStatus.PAID);
  console.log(`✓ Status Transition: SENT -> ${updatedInv.status}`);

  // 6. Test Server-Side Financial Security (403 Rejection for Interns)
  let intern = await prisma.user.findFirst({ where: { role: "INTERN" } });
  if (!intern) {
    intern = await prisma.user.create({
      data: {
        name: "Test Intern User M9",
        email: "intern.m9@evolix.io",
        role: "INTERN",
      },
    });
  }

  const internAuth = {
    id: intern.id,
    name: intern.name,
    email: intern.email,
    role: intern.role as "INTERN",
    isActive: true,
  };

  console.log(`\nTesting Intern Financial Security Rejection for '${intern.name}'...`);
  try {
    await getInvoices(internAuth, {});
    throw new Error("FAIL: Intern was allowed to access Invoice financial data!");
  } catch (error: any) {
    if (error.statusCode === 403) {
      console.log(`✓ 6. HTTP 403 Forbidden Financial Isolation Rejection Verified for Intern: "${error.message}"`);
    } else {
      throw error;
    }
  }

  console.log("\n=== MAJOR MODULE M9 TEST PASSED SUCCESSFULLY ===");
}

runM9InvoiceTest()
  .catch((e) => {
    console.error("M8 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
