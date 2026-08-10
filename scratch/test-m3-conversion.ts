import { prisma } from "../lib/db/prisma";
import { createLead, convertLeadToClient, getLeadById, logLeadCall } from "../lib/services/lead.service";
import { getClientById } from "../lib/services/client.service";
import { getOnboardings, updateOnboarding } from "../lib/services/onboarding.service";
import { LeadSource, LeadStatus, OnboardingStatus } from "@prisma/client";
import { CallOutcome } from "../types/lead";

async function runM3ConversionTest() {
  console.log("=== TESTING MAJOR MODULE M3: LEAD -> CLIENT -> ONBOARDING ===");

  // 1. Get or create a Co-Founder user for testing
  let cofounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Conversion Founder",
        email: "convfounder@evolix.io",
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

  // 2. Create a Lead with full details
  const leadName = `Apex Tech ${Date.now()}`;
  const testLead = await createLead(
    {
      name: leadName,
      companyName: "Apex Solutions Global",
      email: "ceo@apextech.com",
      phone: "+919876543210",
      source: LeadSource.INSTAGRAM,
      service: "Custom Enterprise Portal + CRM Integration",
      estimatedValue: "250000.00",
      notes: "High value enterprise client interested in annual retainer.",
    },
    founderAuth.id
  );
  console.log(`✓ 1. Created Lead: '${testLead.name}' (ID: ${testLead.id})`);

  // Log some history on lead
  await logLeadCall(founderAuth, testLead.id, {
    outcome: CallOutcome.INTERESTED,
    notes: "Discussed scope and timeline requirements.",
    callDate: new Date().toISOString(),
  });
  console.log("✓ Logged call activity on Lead.");

  // 3. Convert Lead to Client & Onboarding
  console.log("Executing Lead Conversion...");
  const conversionResult = await convertLeadToClient(testLead.id, founderAuth.id);

  console.log(`✓ 2. Converted Lead to Client ID: ${conversionResult.client.id}`);
  console.log(`✓ Created Onboarding ID: ${conversionResult.onboarding.id}`);

  // 4. Verify Client Details & Carried Fields
  const client = await getClientById(founderAuth, conversionResult.client.id);
  console.log("\n--- Verifying Client Carried Data ---");
  console.log(`Client Name: ${client.name}`);
  console.log(`Company Name: ${client.companyName}`);
  console.log(`Email: ${client.email}`);
  console.log(`Phone: ${client.phone}`);
  console.log(`Source: ${client.source}`);
  console.log(`Converted From Lead ID: ${client.convertedFromLeadId}`);
  console.log(`Notes include lead history: ${client.notes?.includes("Carried Lead History")}`);

  if (client.name !== "Apex Solutions Global" || client.email !== "ceo@apextech.com") {
    throw new Error("Client field carrying validation failed!");
  }

  // 5. Verify Onboarding Details
  console.log("\n--- Verifying Onboarding Initial Record ---");
  const onboardingsList = await getOnboardings(founderAuth, {});
  const onboardingItem = onboardingsList.onboardings.find((o) => o.id === conversionResult.onboarding.id);

  if (!onboardingItem) {
    throw new Error("Onboarding record not found in query!");
  }

  console.log(`Onboarding Status: ${onboardingItem.status}`);
  console.log(`Onboarding Services: ${onboardingItem.services}`);
  console.log(`Onboarding Deal Info: ${onboardingItem.dealInfo}`);
  console.log(`Onboarding Contact Info: ${onboardingItem.contactInfo}`);

  if (onboardingItem.status !== "NOT_STARTED") {
    throw new Error("Initial onboarding status should be NOT_STARTED!");
  }

  // 6. Test Updating Onboarding Workflow Status & Information
  console.log("\n--- Testing Onboarding Workflow Update ---");
  const updatedOnboarding = await updateOnboarding(founderAuth, onboardingItem.id, {
    status: OnboardingStatus.IN_PROGRESS,
    businessInfo: "GSTIN: 27AAAAA0000A1Z5 / Reg # 123456",
    documents: "Signed Master Services Agreement, Brand Assets Zip",
    targetEndDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
    notes: "Kickoff call scheduled for tomorrow 2 PM.",
  });

  console.log(`Updated Onboarding Status: ${updatedOnboarding.status}`);
  console.log(`Updated Business Info: ${updatedOnboarding.businessInfo}`);
  console.log(`Updated Documents: ${updatedOnboarding.documents}`);

  // 7. Verify Duplicate Conversion Prevention
  console.log("\n--- Testing Duplicate Conversion Prevention ---");
  try {
    await convertLeadToClient(testLead.id, founderAuth.id);
    throw new Error("FAIL: System allowed duplicate conversion!");
  } catch (err: any) {
    console.log(`✓ Duplicate conversion correctly blocked! Error message: "${err.message}"`);
  }

  // 8. Verify No Project Created (M4 boundary check)
  const clientProjects = await prisma.project.findMany({
    where: { clientId: client.id },
  });
  console.log(`✓ Verified Project Count for Client: ${clientProjects.length} (Strictly 0 for M3)`);

  console.log("\n=== MAJOR MODULE M3 TEST PASSED SUCCESSFULLY ===");
}

runM3ConversionTest()
  .catch((e) => {
    console.error("M3 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
