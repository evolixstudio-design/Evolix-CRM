import { prisma } from "../lib/db/prisma";
import {
  createQuotation,
  getQuotationById,
  getQuotations,
  updateQuotationStatus,
  convertQuotationToProjectData,
  generateQuotationNumber,
} from "../lib/services/quotation.service";
import { QuotationStatus } from "@prisma/client";

async function runM8QuotationTest() {
  console.log("=== TESTING MAJOR MODULE M8: QUOTATION MANAGEMENT ===");

  // 1. Get or create a Co-Founder test user
  let coFounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!coFounder) {
    coFounder = await prisma.user.create({
      data: {
        name: "Test Co-Founder",
        email: "cofounder.m8@evolix.io",
        role: "CO_FOUNDER",
      },
    });
  }

  const authUser = {
    id: coFounder.id,
    name: coFounder.name,
    email: coFounder.email,
    role: coFounder.role as "CO_FOUNDER",
    isActive: true,
  };

  // 2. Create a test Lead for auto-population testing
  const lead = await prisma.lead.create({
    data: {
      name: "Rohan Varma",
      companyName: "Varma Tech Solutions",
      email: "rohan@varmatech.com",
      phone: "+919876543210",
      source: "WEBSITE",
      assignedToId: coFounder.id,
      notes: "High value software lead",
    },
  });

  console.log(`✓ 1. Created Test Lead '${lead.name}' (${lead.companyName})`);

  // 3. Test Quotation Auto-Number Generation
  const quoNumber = await generateQuotationNumber();
  console.log(`✓ 2. Generated Quotation Number: ${quoNumber}`);
  if (!quoNumber.startsWith("QUO-")) {
    throw new Error("FAIL: Quotation number pattern invalid!");
  }

  // 4. Create Quotation with Lead Auto-Population & Financial Items
  const createPayload = {
    leadId: lead.id,
    currency: "INR",
    discountAmount: 5000,
    taxRate: 18, // 18% GST
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    terms: "50% upfront, 50% on completion",
    notes: "Quotation created from Lead auto-population",
    items: [
      { description: "Custom Next.js Web Portal Development", quantity: 1, unitRate: 100000 },
      { description: "API Integration & Cloud Deployment", quantity: 2, unitRate: 15000 },
    ],
  };

  const quotation = await createQuotation(authUser, createPayload);

  console.log(`\n✓ 3. Created Quotation #${quotation.quotationNumber}:`);
  console.log(`   Contact Name (Auto-Populated): ${quotation.contactName}`);
  console.log(`   Company Name (Auto-Populated): ${quotation.companyName}`);
  console.log(`   Email (Auto-Populated): ${quotation.email}`);
  console.log(`   Phone (Auto-Populated): ${quotation.phone}`);

  if (quotation.contactName !== lead.name || quotation.companyName !== lead.companyName) {
    throw new Error("FAIL: Lead contact info was not auto-populated correctly!");
  }

  // 5. Verify Financial Calculation Engine
  // Subtotal = 100000 + (2 * 15000) = 130,000
  // Discount = 5,000 => Taxable Subtotal = 125,000
  // Tax (18%) = 125,000 * 0.18 = 22,500
  // Total = 125,000 + 22,500 = 147,500
  console.log(`\n✓ 4. Verified Financial Calculation Engine (Default Currency: ${quotation.currency}):`);
  console.log(`   Subtotal: ₹${quotation.subtotal.toLocaleString("en-IN")}`);
  console.log(`   Discount: -₹${quotation.discountAmount.toLocaleString("en-IN")}`);
  console.log(`   Tax Rate: ${quotation.taxRate}%`);
  console.log(`   Total Amount: ₹${quotation.totalAmount.toLocaleString("en-IN")}`);

  if (quotation.subtotal !== 130000) {
    throw new Error(`FAIL: Expected subtotal 130000, got ${quotation.subtotal}`);
  }
  if (quotation.totalAmount !== 147500) {
    throw new Error(`FAIL: Expected totalAmount 147500, got ${quotation.totalAmount}`);
  }

  // 6. Test Status Transitions
  let updatedQuo = await updateQuotationStatus(authUser, quotation.id, QuotationStatus.SENT);
  console.log(`\n✓ 5. Status Transition: DRAFT -> ${updatedQuo.status}`);

  updatedQuo = await updateQuotationStatus(authUser, quotation.id, QuotationStatus.VIEWED);
  console.log(`✓ Status Transition: SENT -> ${updatedQuo.status}`);

  updatedQuo = await updateQuotationStatus(authUser, quotation.id, QuotationStatus.ACCEPTED);
  console.log(`✓ Status Transition: VIEWED -> ${updatedQuo.status}`);

  // 7. Test Quotation Conversion to Project Data Payload
  const projectData = await convertQuotationToProjectData(authUser, quotation.id);

  console.log(`\n✓ 6. Converted Accepted Quotation to Project Data Payload:`);
  console.log(`   Project Name: ${projectData.projectName}`);
  console.log(`   Contract Value: ₹${projectData.contractValue}`);
  console.log(`   Currency: ${projectData.currency}`);
  console.log(`   Notes: ${projectData.notes}`);

  const finalQuo = await getQuotationById(authUser, quotation.id);
  console.log(`   Quotation Final Status: ${finalQuo.status}`);

  if (finalQuo.status !== "CONVERTED") {
    throw new Error("FAIL: Quotation status did not update to CONVERTED!");
  }

  console.log("\n=== MAJOR MODULE M8 TEST PASSED SUCCESSFULLY ===");
}

runM8QuotationTest()
  .catch((e) => {
    console.error("M8 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
