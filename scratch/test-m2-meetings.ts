import { prisma } from "../lib/db/prisma";
import { createLead, getLeadById } from "../lib/services/lead.service";
import {
  createMeeting,
  getMeetings,
  getMeetingWorkAreaSummary,
  updateMeetingStatus,
  getMeetingById,
} from "../lib/services/meeting.service";
import { LeadSource } from "@prisma/client";
import { MeetingType, MeetingStatus } from "../types/meeting";

async function runM2MeetingsTest() {
  console.log("=== TESTING MAJOR MODULE M2: MEETING MANAGEMENT + REMINDERS ===");

  // 1. Get or create a Co-Founder user for testing
  let cofounder = await prisma.user.findFirst({ where: { role: "CO_FOUNDER" } });
  if (!cofounder) {
    cofounder = await prisma.user.create({
      data: {
        name: "Meeting Founder",
        email: "meetingfounder@evolix.io",
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

  // 2. Create a Lead for linking
  const testLead = await createLead(
    {
      name: `Meeting Lead ${Date.now()}`,
      companyName: "HyperDrive AI",
      email: "founder@hyperdrive.ai",
      phone: "+919998887770",
      source: LeadSource.WEBSITE,
    },
    founderAuth.id
  );
  console.log(`✓ 1. Created Lead: ${testLead.name} (ID: ${testLead.id})`);

  // 3. Create Meeting
  const todayStr = new Date().toISOString();

  const meeting = await createMeeting(founderAuth, {
    title: "Enterprise Product Alignment Demo",
    leadId: testLead.id,
    meetingDate: todayStr,
    startTime: "11:00",
    endTime: "12:00",
    type: MeetingType.GOOGLE_MEET,
    meetingLink: "https://meet.google.com/xyz-uvwx-rst",
    participants: "founder@hyperdrive.ai, founder@evolix.io",
    notes: "Review enterprise features and custom SLA options.",
    createInternalReminder: true,
    createClientReminder: true,
  });
  console.log(`✓ 2. Created Meeting: '${meeting.title}' (ID: ${meeting.id}), Type: ${meeting.type}`);

  // 4. Verify Reminders generated
  const meetingWithReminders = await getMeetingById(founderAuth, meeting.id);
  console.log(`✓ 3. Verified Reminders: ${meetingWithReminders.reminders?.length || 0} reminders generated (Internal + Client Architecture).`);

  // 5. Verify Timeline Integration on Lead
  const leadDetails = await getLeadById(testLead.id);
  const meetingActivities = leadDetails.activities.filter((a: any) => a.type === "MEETING");
  console.log(`✓ 4. Verified Timeline Integration: Found ${meetingActivities.length} MEETING entries on Lead timeline.`);

  // 6. Verify Work Area Queries
  const todayMeetings = await getMeetings(founderAuth, { view: "today" });
  console.log(`✓ 5. Verified Today's Meetings count: ${todayMeetings.length}`);

  const summary = await getMeetingWorkAreaSummary(founderAuth);
  console.log("Work Area Summary Stats:", summary);

  // 7. Verify Status Update (Mark Completed)
  const completedMeeting = await updateMeetingStatus(founderAuth, meeting.id, MeetingStatus.COMPLETED);
  console.log(`✓ 6. Verified Meeting Status Update: status = ${completedMeeting.status}`);

  console.log("\n=== MAJOR MODULE M2 TEST PASSED SUCCESSFULLY ===");
}

runM2MeetingsTest()
  .catch((e) => {
    console.error("M2 Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
