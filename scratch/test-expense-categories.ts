import { prisma } from "../lib/db/prisma";
import { getExpenseCategories, createExpenseCategory, createExpense, getExpenses } from "../lib/services/finance.service";

async function runTest() {
  console.log("=== TESTING EXPENSE CATEGORY FUNCTIONALITY ===");

  // 1. Get or create a Co-Founder user for testing
  let cofounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Test Founder",
        email: "testfounder@evolix.io",
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

  // 2. Fetch categories (auto-seeds defaults if empty)
  const initialCategories = await getExpenseCategories();
  console.log(`✓ Fetched ${initialCategories.length} categories.`);
  console.log("Categories sample:", initialCategories.slice(0, 5).map(c => c.name));

  // 3. Create expense with existing predefined category
  const exp1 = await createExpense(founderAuth, {
    description: "Cloud Hosting Monthly Bill",
    category: "Hosting",
    amount: 1500,
    expenseDate: new Date().toISOString(),
    vendor: "AWS",
  });
  console.log(`✓ Created expense with existing category 'Hosting': ${exp1.description} (ID: ${exp1.id})`);

  // 4. Create custom category
  const customCatName = `Custom Cat ${Date.now()}`;
  const customCat = await createExpenseCategory(founderAuth, customCatName);
  console.log(`✓ Created custom category '${customCat.name}' (ID: ${customCat.id})`);

  // 5. Create expense using custom category
  const exp2 = await createExpense(founderAuth, {
    description: "Tech Conference Sponsorship",
    category: customCat.name,
    amount: 5000,
    expenseDate: new Date().toISOString(),
    vendor: "TechConf 2026",
  });
  console.log(`✓ Created expense with custom category '${exp2.category}': ${exp2.description} (ID: ${exp2.id})`);

  // 6. Verify expense listing
  const allExpenses = await getExpenses(founderAuth, { limit: 10 });
  console.log(`✓ Verified getExpenses returns ${allExpenses.total} total expenses.`);

  console.log("\n=== TEST PASSED SUCCESSFULLY ===");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
