import { prisma } from "../lib/db/prisma";
import {
  getTeamMembers,
  getTeamMemberById,
  updateTeamMemberInfo,
} from "../lib/services/team.service";
import { UserRole } from "@prisma/client";

async function runM13Test() {
  console.log("=== MAJOR MODULE M13: USER MANAGEMENT TEST ===");

  // 1. Get or create Co-Founder user
  let cofounder = await prisma.user.findFirst({
    where: { role: UserRole.CO_FOUNDER },
  });

  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Qusai",
        email: "qusai@evolix.io",
        role: UserRole.CO_FOUNDER,
        isActive: true,
      },
    });
  }

  const cofounderAuth = {
    id: cofounder.id,
    name: cofounder.name,
    email: cofounder.email,
    role: cofounder.role,
    isActive: true,
  };

  // 2. Get or create Intern user
  let intern = await prisma.user.findFirst({
    where: { role: UserRole.INTERN },
  });

  if (!intern) {
    intern = await prisma.user.create({
      data: {
        name: "Test Intern M13",
        email: "m13_intern@evolix.io",
        role: UserRole.INTERN,
        isActive: true,
      },
    });
  }

  const internAuth = {
    id: intern.id,
    name: intern.name,
    email: intern.email,
    role: intern.role,
    isActive: true,
  };

  // Ensure Saifuddin, Taikhum, Qusai exist with default responsibilities
  const defaultFounders = [
    { name: "Saifuddin", email: "saifuddin@evolix.io", expectedDept: "Digital Marketing, Design" },
    { name: "Taikhum", email: "taikhum@evolix.io", expectedDept: "Software, Website" },
    { name: "Qusai", email: "qusai@evolix.io", expectedDept: "Operations, Finance, Client Onboarding, Consulting" },
  ];

  for (const f of defaultFounders) {
    const ex = await prisma.user.findFirst({
      where: { OR: [{ email: f.email }, { name: { contains: f.name, mode: "insensitive" } }] },
    });
    if (!ex) {
      await prisma.user.create({
        data: {
          name: f.name,
          email: f.email,
          role: UserRole.CO_FOUNDER,
          department: f.expectedDept,
          isActive: true,
        },
      });
    }
  }

  // 3. Test View Users (Co-Founder Access)
  console.log("\n1. Fetching Team User Directory (Co-Founder View)...");
  const members = await getTeamMembers(cofounderAuth);
  console.log(`✓ Retrived ${members.length} team members`);

  members.forEach((m) => {
    console.log(`   - User: ${m.name} | Email: ${m.email} | Phone: ${m.phone || 'N/A'} | Role: ${m.role} | Dept: ${m.department || 'N/A'} | Status: ${m.isActive ? 'Active' : 'Inactive'} | Joined: ${m.createdAt.split('T')[0]} | Last Activity: ${m.lastActivityAt ? m.lastActivityAt.split('T')[0] : 'N/A'}`);
    console.log(`     Workload -> Proj: ${m.workload.activeProjectsCount} | Active Tasks: ${m.workload.activeTasksCount} | Overdue: ${m.workload.overdueTasksCount}`);

    // Verify Password Hash Security
    if ((m as any).passwordHash || (m as any).password) {
      throw new Error(`SECURITY FAILURE: Password hash exposed for user ${m.email}`);
    }
  });

  console.log("✓ Password masking security verified: NO password hashes returned.");

  // 4. Test Edit Allowed Information
  console.log("\n2. Editing Allowed Profile Information for User...");
  const targetUser = members.find((m) => m.role === UserRole.INTERN) || members[0];
  const updatedUser = await updateTeamMemberInfo(cofounderAuth, targetUser.id, {
    name: `${targetUser.name} (Updated)`,
    phone: "+91 9988776655",
    department: "Quality Assurance & Testing",
    isActive: true,
  });

  console.log(`✓ Updated User Profile: Name = '${updatedUser.name}' | Phone = '${updatedUser.phone}' | Department = '${updatedUser.department}'`);
  if (updatedUser.phone !== "+91 9988776655" || updatedUser.department !== "Quality Assurance & Testing") {
    throw new Error("ASSERTION FAILED: Profile update failed to save phone/department!");
  }

  // Revert test name
  await updateTeamMemberInfo(cofounderAuth, targetUser.id, { name: targetUser.name });

  // 5. Test Intern Access Boundary
  console.log("\n3. Testing Security Permission Boundary (Intern attempting user management access)...");
  try {
    await getTeamMembers(internAuth);
    throw new Error("ASSERTION FAILED: Intern was able to access team user management!");
  } catch (err: any) {
    if (err.statusCode === 403 || err.message?.includes("Access restricted")) {
      console.log(`✓ Security Protection Confirmed: Intern rejected with HTTP 403 (${err.message})`);
    } else {
      throw err;
    }
  }

  console.log("\n=== MAJOR MODULE M13 TEST PASSED SUCCESSFULLY ===");
}

runM13Test()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
