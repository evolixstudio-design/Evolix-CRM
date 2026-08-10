import { prisma } from "../lib/db/prisma";
import { createClient } from "../lib/services/client.service";
import {
  createProject,
  getProjectById,
  createProjectPhase,
  updateProjectPhase,
} from "../lib/services/project.service";
import { ProjectServiceType, ProjectStatus, ProjectPriority, PhaseStatus, PaymentStatus } from "@prisma/client";

async function runM4ProjectsTest() {
  console.log("=== TESTING MAJOR MODULE M4: PROJECTS + PHASES + PROGRESS ===");

  // 1. Get or create Team Leaders (Saifuddin, Taikhum, Qusai)
  const leaderNames = ["Saifuddin", "Taikhum", "Qusai"];
  const teamLeaders: any[] = [];

  for (const name of leaderNames) {
    let leader = await prisma.user.findFirst({ where: { name } });
    if (!leader) {
      leader = await prisma.user.create({
        data: {
          name,
          email: `${name.toLowerCase()}@evolix.io`,
          role: "CO_FOUNDER",
        },
      });
    }
    teamLeaders.push(leader);
  }
  console.log(`✓ 1. Verified Co-Founder Team Leaders: ${teamLeaders.map((t) => t.name).join(", ")}`);

  const founderAuth = {
    id: teamLeaders[0].id,
    name: teamLeaders[0].name,
    email: teamLeaders[0].email,
    role: teamLeaders[0].role as "CO_FOUNDER",
    isActive: true,
  };

  // 2. Create a Client for project
  const testClient = await createClient(founderAuth, {
    name: `Enterprise Client ${Date.now()}`,
    companyName: "Nexus Digital Global",
    email: "contact@nexusdigital.com",
    phone: "+919123456789",
  });
  console.log(`✓ 2. Created Client: '${testClient.name}' (ID: ${testClient.id})`);

  // 3. Create Project with Team Leader (Taikhum for Software/Website)
  const taikhumLeader = teamLeaders.find((t) => t.name === "Taikhum") || teamLeaders[0];
  const today = new Date();
  const nextMonth = new Date(Date.now() + 60 * 86400 * 1000);

  const project = await createProject(founderAuth, {
    clientId: testClient.id,
    name: "Enterprise Custom ERP & Portal",
    description: "Full-stack Next.js + PostgreSQL CRM & Portal solution.",
    serviceType: ProjectServiceType.SOFTWARE,
    status: ProjectStatus.IN_PROGRESS,
    priority: ProjectPriority.HIGH,
    startDate: today.toISOString(),
    deadline: nextMonth.toISOString(),
    contractValue: 450000.00,
    currency: "INR",
    paymentStatus: PaymentStatus.PARTIAL,
    contractType: "MILESTONE",
    duration: "2 Months",
    ownerId: taikhumLeader.id,
    notes: "Client requires custom RBAC and PDF invoice generation.",
  });

  console.log(`\n✓ 3. Created Project: '${project.name}' (ID: ${project.id})`);
  console.log(`Team Leader: ${project.owner?.name}`);
  console.log(`Currency & Value: ${project.currency} ₹${project.contractValue?.toLocaleString("en-IN")}`);
  console.log(`Payment Status: ${project.paymentStatus}`);
  console.log(`Contract Type: ${project.contractType}`);
  console.log(`Duration: ${project.duration}`);

  if (project.currency !== "INR") {
    throw new Error("FAIL: Default currency is not INR!");
  }

  // 4. Add Project Phases (Strategy, Design, Development, Review, Delivery)
  console.log("\nAdding Project Phases...");
  const phaseNames = ["Strategy", "Design", "Development", "Review", "Delivery"];
  for (let i = 0; i < phaseNames.length; i++) {
    await createProjectPhase(founderAuth, project.id, {
      name: phaseNames[i],
      description: `Phase ${i + 1} deliverables for ${phaseNames[i]}`,
      order: i,
      status: i === 0 ? PhaseStatus.COMPLETED : PhaseStatus.NOT_STARTED,
      progress: i === 0 ? 100 : 0,
    });
  }

  const projectWithPhases = await getProjectById(founderAuth, project.id);
  console.log(`✓ 4. Added ${projectWithPhases.phases?.length || 0} Project Phases.`);

  // 5. Update Phase (e.g. Design phase -> IN_PROGRESS, 75% progress)
  const designPhase = projectWithPhases.phases?.find((p) => p.name === "Design");
  if (!designPhase) {
    throw new Error("FAIL: Design phase not found!");
  }

  console.log(`\nUpdating '${designPhase.name}' Phase Progress to 75%...`);
  const updatedProject = await updateProjectPhase(founderAuth, designPhase.id, {
    status: PhaseStatus.IN_PROGRESS,
    progress: 75,
  });

  // 6. Verify Progress Engine
  const updatedDesignPhase = updatedProject.phases?.find((p) => p.id === designPhase.id);
  console.log(`✓ 5. Verified Phase Update: '${updatedDesignPhase?.name}' status = ${updatedDesignPhase?.status}, progress = ${updatedDesignPhase?.progress}%`);

  // Expected overall progress calculation: (100 [Strategy] + 75 [Design] + 0 + 0 + 0) / 5 = 35%
  console.log(`✓ 6. Verified Overall Project Progress: ${updatedProject.overallProgress}% (Expected: 35%)`);

  if (updatedProject.overallProgress !== 35) {
    throw new Error(`FAIL: Expected overall progress 35%, got ${updatedProject.overallProgress}%`);
  }

  console.log("\n=== MAJOR MODULE M4 TEST PASSED SUCCESSFULLY ===");
}

runM4ProjectsTest()
  .catch((e) => {
    console.error("M4 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
