import { prisma } from "../lib/db/prisma";
import {
  checkInUser,
  checkOutUser,
  getTodayStatus,
  getAttendanceList,
} from "../lib/services/attendance.service";
import { UserRole } from "@prisma/client";

async function runM12Test() {
  console.log("=== MAJOR MODULE M12: ATTENDANCE TEST ===");

  // 1. Get or create Co-Founder user
  let cofounder = await prisma.user.findFirst({
    where: { role: UserRole.CO_FOUNDER },
  });

  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Test Co-Founder M12",
        email: "m12_cofounder@evolix.io",
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
        name: "Test Intern M12",
        email: "m12_intern@evolix.io",
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

  // Clear today's test attendance records if any
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  await prisma.attendance.deleteMany({
    where: {
      userId: { in: [cofounder.id, intern.id] },
    },
  });

  // 3. Test Check-In Action
  console.log("\n1. Testing User Check-In Action (Asia/Kolkata IST)...");
  const checkInRec = await checkInUser(internAuth, "Started morning work at 09:30 AM");
  console.log(`✓ Checked In: User ${checkInRec.user.name} | Date: ${checkInRec.date} | Status: ${checkInRec.status}`);
  console.log(`   Check-In ISO: ${checkInRec.checkIn}`);

  const todayStatus1 = await getTodayStatus(internAuth);
  console.log(`✓ Today Status Check: Has Checked In = ${todayStatus1.hasCheckedIn} | Time = ${todayStatus1.checkInTime}`);
  if (!todayStatus1.hasCheckedIn) {
    throw new Error("ASSERTION FAILED: Expected hasCheckedIn to be true after check-in");
  }

  // 4. Test Check-Out Action
  console.log("\n2. Testing User Check-Out Action...");
  const checkOutRec = await checkOutUser(internAuth, "Completed daily tasks");
  console.log(`✓ Checked Out: User ${checkOutRec.user.name} | Status: ${checkOutRec.status}`);
  console.log(`   Check-Out ISO: ${checkOutRec.checkOut} | Duration: ${checkOutRec.durationMinutes} mins`);

  const todayStatus2 = await getTodayStatus(internAuth);
  console.log(`✓ Today Status Check: Has Checked Out = ${todayStatus2.hasCheckedOut} | Time = ${todayStatus2.checkOutTime}`);
  if (!todayStatus2.hasCheckedOut) {
    throw new Error("ASSERTION FAILED: Expected hasCheckedOut to be true after check-out");
  }

  // Also check-in Co-founder to have multiple team records
  await checkInUser(cofounderAuth, "Co-Founder morning check-in");

  // 5. Test View Attendance as Co-Founder (Team View)
  console.log("\n3. Testing View Attendance as Co-Founder (Full Team View)...");
  const teamAttendance = await getAttendanceList(cofounderAuth, { page: 1, limit: 10 });
  console.log(`✓ Co-Founder Team View Success: Found ${teamAttendance.total} records across team`);
  teamAttendance.records.forEach((r) => {
    console.log(`   - Record ID ${r.id}: Member ${r.user.name} (${r.user.role}) | Status: ${r.status} | CheckIn: ${r.checkIn ? r.checkIn.substring(11, 16) : 'N/A'}`);
  });

  // 6. Test View Attendance as Intern (Own View)
  console.log("\n4. Testing View Attendance as Intern (Own History View)...");
  const internAttendance = await getAttendanceList(internAuth, { page: 1, limit: 10 });
  console.log(`✓ Intern Own View Success: Found ${internAttendance.total} record(s) for intern`);
  if (internAttendance.records.some((r) => r.userId !== intern.id)) {
    throw new Error("ASSERTION FAILED: Intern view contained records from another user!");
  }

  // 7. Test Permission Boundary (Intern querying another user's attendance)
  console.log("\n5. Testing Permission Boundary (Intern attempting to view Co-Founder attendance)...");
  try {
    await getAttendanceList(internAuth, { userId: cofounder.id });
    throw new Error("ASSERTION FAILED: Intern was able to query another user's attendance!");
  } catch (err: any) {
    if (err.statusCode === 403 || err.message?.includes("Access restricted")) {
      console.log(`✓ Security Protection Confirmed: Intern blocked with HTTP 403 (${err.message})`);
    } else {
      throw err;
    }
  }

  console.log("\n=== MAJOR MODULE M12 TEST PASSED SUCCESSFULLY ===");
}

runM12Test()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
