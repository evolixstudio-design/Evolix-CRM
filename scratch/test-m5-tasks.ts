import { prisma } from "../lib/db/prisma";
import { createClient } from "../lib/services/client.service";
import { createProject } from "../lib/services/project.service";
import {
  createTask,
  getTaskById,
  acceptTask,
  declineTask,
  updateTask,
  addTaskComment,
  getWorkboardData,
} from "../lib/services/task.service";
import { ProjectServiceType, TaskStatus, TaskPriority } from "@prisma/client";

async function runM5TasksTest() {
  console.log("=== TESTING MAJOR MODULE M5: TASK MANAGEMENT ===");

  // 1. Get Team Leaders (Saifuddin, Taikhum, Qusai)
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

  const founderAuth = {
    id: teamLeaders[0].id,
    name: teamLeaders[0].name,
    email: teamLeaders[0].email,
    role: teamLeaders[0].role as "CO_FOUNDER",
    isActive: true,
  };

  const taikhumAuth = {
    id: teamLeaders[1].id,
    name: teamLeaders[1].name,
    email: teamLeaders[1].email,
    role: teamLeaders[1].role as "CO_FOUNDER",
    isActive: true,
  };

  console.log(`✓ 1. Verified Co-Founder Team Leaders: ${teamLeaders.map((t) => t.name).join(", ")}`);

  // 2. Create Client & Project
  const testClient = await createClient(founderAuth, {
    name: `Enterprise Client ${Date.now()}`,
    companyName: "Acme Corp Global",
    email: "info@acmeglobal.com",
    phone: "+919876543210",
  });

  const testProject = await createProject(founderAuth, {
    clientId: testClient.id,
    name: "Acme Mobile & Cloud Platform",
    serviceType: ProjectServiceType.SOFTWARE,
    ownerId: taikhumAuth.id,
  });

  console.log(`✓ 2. Created Client '${testClient.name}' and Project '${testProject.name}'`);

  // 3. Create Task & Assign Leader (Taikhum)
  const task1 = await createTask(founderAuth, {
    title: "Backend API Auth & RBAC Middleware",
    description: "Implement JWT authentication and role-based permissions.",
    clientId: testClient.id,
    projectId: testProject.id,
    assignedToId: taikhumAuth.id,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
  });

  console.log(`\n✓ 3. Created Task 1: '${task1.title}' (Status: ${task1.status})`);
  if (task1.status !== TaskStatus.ASSIGNED) {
    throw new Error(`FAIL: Expected status ASSIGNED, got ${task1.status}`);
  }

  // Verify notification was sent to Taikhum
  const assignNotification = await prisma.notification.findFirst({
    where: { userId: taikhumAuth.id, type: "TASK_ASSIGNED", entityId: task1.id },
  });
  if (!assignNotification) {
    throw new Error("FAIL: TASK_ASSIGNED notification not found for assigned leader!");
  }
  console.log(`✓ 4. Verified TASK_ASSIGNED notification sent to ${taikhumAuth.name}`);

  // 4. Accept Task (Taikhum accepts)
  const acceptedTask1 = await acceptTask(taikhumAuth, task1.id);
  console.log(`✓ 5. Team Leader ${taikhumAuth.name} ACCEPTED Task 1 (Status: ${acceptedTask1.status})`);
  if (acceptedTask1.status !== TaskStatus.ACCEPTED) {
    throw new Error(`FAIL: Expected status ACCEPTED, got ${acceptedTask1.status}`);
  }

  // 5. Decline Task Flow
  const task2 = await createTask(founderAuth, {
    title: "Legacy Database Data Migration Script",
    description: "Migrate legacy MySQL DB tables into PostgreSQL.",
    clientId: testClient.id,
    projectId: testProject.id,
    assignedToId: taikhumAuth.id,
    priority: TaskPriority.URGENT,
  });

  const declineReason = "Current sprint capacity fully committed to Core API deliverables.";
  const declinedTask2 = await declineTask(taikhumAuth, task2.id, declineReason);

  console.log(`\n✓ 6. Team Leader ${taikhumAuth.name} DECLINED Task 2 (Status: ${declinedTask2.status})`);
  console.log(`Decline Reason Saved: "${declinedTask2.declineReason}"`);

  if (declinedTask2.status !== TaskStatus.DECLINED || declinedTask2.declineReason !== declineReason) {
    throw new Error("FAIL: Decline flow failed to set status DECLINED or record reason!");
  }

  // 6. Transition Status Flow (ACCEPTED -> IN_PROGRESS -> SUBMITTED)
  const inProgressTask1 = await updateTask(taikhumAuth, task1.id, { status: TaskStatus.IN_PROGRESS });
  console.log(`\n✓ 7. Status transition: Task 1 -> ${inProgressTask1.status}`);

  const submittedTask1 = await updateTask(taikhumAuth, task1.id, { status: TaskStatus.SUBMITTED });
  console.log(`✓ 8. Status transition: Task 1 -> ${submittedTask1.status}`);

  // Add Comment
  const commentedTask1 = await addTaskComment(taikhumAuth, task1.id, "Submitted pull request #42 for code review.");
  console.log(`✓ 9. Added comment to Task 1: "${commentedTask1.comments?.[0]?.content}"`);

  // 7. Verify Workboard Data Preparation
  const workboardData = await getWorkboardData(founderAuth);
  console.log("\n✓ 10. Prepared Workboard Data Summary:");
  console.table(workboardData.summary);

  if (workboardData.summary.acceptedCount < 0 || workboardData.summary.declinedCount < 1) {
    throw new Error("FAIL: Workboard summary data counts invalid!");
  }

  console.log("\n=== MAJOR MODULE M5 TEST PASSED SUCCESSFULLY ===");
}

runM5TasksTest()
  .catch((e) => {
    console.error("M5 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
