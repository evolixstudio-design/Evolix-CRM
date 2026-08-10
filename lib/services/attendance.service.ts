import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  AttendanceItem,
  TodayAttendanceStatus,
  AttendanceFilterOptions,
  PaginatedAttendanceResponse,
  AttendanceStatusType,
} from "@/types/attendance";
import { AttendanceStatus, Prisma } from "@prisma/client";

/**
 * TIMEZONE HELPER: Asia/Kolkata (IST UTC+5:30)
 * Formats a Date object into YYYY-MM-DD string in Asia/Kolkata timezone
 */
export function getISTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * TIMEZONE HELPER: Asia/Kolkata
 * Returns a Date object representing 00:00:00.000 IST for a given date string (YYYY-MM-DD)
 */
export function getISTStartOfDay(dateStr?: string): Date {
  const targetDateStr = dateStr || getISTDateString(new Date());
  // IST is UTC+5:30. Midnight IST = Previous day 18:30:00 UTC
  const dateObj = new Date(`${targetDateStr}T00:00:00+05:30`);
  return dateObj;
}

/**
 * TIMEZONE HELPER: Asia/Kolkata
 * Formats Date into 12-hour HH:MM AM/PM string in IST
 */
export function formatISTTime(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format raw Prisma Attendance record into frontend AttendanceItem
 */
function formatAttendance(record: any): AttendanceItem {
  let durMins: number | null = null;
  if (record.checkIn && record.checkOut) {
    const diffMs = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
    durMins = Math.max(0, Math.floor(diffMs / 60000));
  }

  return {
    id: record.id,
    userId: record.userId,
    user: {
      id: record.user.id,
      name: record.user.name,
      email: record.user.email,
      role: record.user.role,
    },
    date: getISTDateString(record.date),
    checkIn: record.checkIn ? record.checkIn.toISOString() : null,
    checkOut: record.checkOut ? record.checkOut.toISOString() : null,
    status: record.status as AttendanceStatusType,
    notes: record.notes || null,
    durationMinutes: durMins,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * Get Current User's Today Attendance Status in Asia/Kolkata
 */
export async function getTodayStatus(user: AuthUser): Promise<TodayAttendanceStatus> {
  const todayStart = getISTStartOfDay();

  const record = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: todayStart,
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!record) {
    return {
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null,
      status: null,
      durationMinutes: null,
      record: null,
    };
  }

  const formatted = formatAttendance(record);

  return {
    hasCheckedIn: !!record.checkIn,
    hasCheckedOut: !!record.checkOut,
    checkInTime: record.checkIn ? formatISTTime(record.checkIn) : null,
    checkOutTime: record.checkOut ? formatISTTime(record.checkOut) : null,
    status: record.status as AttendanceStatusType,
    durationMinutes: formatted.durationMinutes,
    record: formatted,
  };
}

/**
 * User Check-In Action
 */
export async function checkInUser(user: AuthUser, notes?: string | null) {
  const todayStart = getISTStartOfDay();
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: todayStart,
      },
    },
  });

  if (existing && existing.checkIn) {
    throw new AppError("You have already checked in today.", 400, "BAD_REQUEST");
  }

  let record;
  if (existing) {
    record = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkIn: now,
        status: AttendanceStatus.PRESENT,
        notes: notes || existing.notes,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  } else {
    record = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: todayStart,
        checkIn: now,
        status: AttendanceStatus.PRESENT,
        notes: notes || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  return formatAttendance(record);
}

/**
 * User Check-Out Action
 */
export async function checkOutUser(user: AuthUser, notes?: string | null) {
  const todayStart = getISTStartOfDay();
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: todayStart,
      },
    },
  });

  if (!existing || !existing.checkIn) {
    throw new AppError("You must check in before checking out.", 400, "BAD_REQUEST");
  }

  if (existing.checkOut) {
    throw new AppError("You have already checked out today.", 400, "BAD_REQUEST");
  }

  // Calculate duration
  const diffMs = now.getTime() - new Date(existing.checkIn).getTime();
  const durationMins = Math.floor(diffMs / 60000);

  // If working duration is less than 4 hours (240 mins), set HALF_DAY status
  let newStatus: AttendanceStatus = existing.status;
  if (durationMins < 240 && existing.status === AttendanceStatus.PRESENT) {
    newStatus = AttendanceStatus.HALF_DAY;
  }

  const updated = await prisma.attendance.update({
    where: { id: existing.id },
    data: {
      checkOut: now,
      status: newStatus,
      notes: notes
        ? existing.notes
          ? `${existing.notes} | Checkout: ${notes}`
          : notes
        : existing.notes,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return formatAttendance(updated);
}

/**
 * Fetch Paginated Attendance Records with Strict Role Permissions
 * - INTERN: Can access ONLY their own attendance. Querying another user returns HTTP 403.
 * - CO_FOUNDER: Can access full team attendance with search and filters.
 */
export async function getAttendanceList(
  user: AuthUser,
  options: AttendanceFilterOptions
): Promise<PaginatedAttendanceResponse> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceWhereInput = {};

  // STRICT PERMISSION BOUNDARY FOR INTERNS
  if (user.role === "INTERN") {
    if (options.userId && options.userId !== user.id) {
      throw AppError.forbidden("Access restricted. Interns can view only their own attendance.");
    }
    where.userId = user.id;
  } else if (options.userId) {
    where.userId = options.userId;
  }

  if (options.status) {
    where.status = options.status as AttendanceStatus;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      where.date.gte = getISTStartOfDay(options.startDate);
    }
    if (options.endDate) {
      where.date.lte = getISTStartOfDay(options.endDate);
    }
  }

  const [total, rawRecords, stats] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    }),
  ]);

  const records = rawRecords.map((r) => formatAttendance(r));
  const totalPages = Math.ceil(total / limit) || 1;

  let presentCount = 0;
  let absentCount = 0;
  let halfDayCount = 0;
  let leaveCount = 0;

  stats.forEach((st) => {
    const c = st._count.status;
    if (st.status === AttendanceStatus.PRESENT) presentCount = c;
    else if (st.status === AttendanceStatus.ABSENT) absentCount = c;
    else if (st.status === AttendanceStatus.HALF_DAY) halfDayCount = c;
    else if (st.status === AttendanceStatus.LEAVE) leaveCount = c;
  });

  return {
    records,
    summary: {
      totalRecords: total,
      presentCount,
      absentCount,
      halfDayCount,
      leaveCount,
    },
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Co-Founder Edit/Update Attendance Record
 */
export async function updateAttendanceRecord(
  user: AuthUser,
  attendanceId: string,
  data: any
) {
  await requireCoFounder(user);

  const existing = await prisma.attendance.findUnique({
    where: { id: attendanceId },
  });

  if (!existing) {
    throw AppError.notFound("Attendance record not found.");
  }

  const updateData: any = {};
  if (data.status) updateData.status = data.status as AttendanceStatus;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.checkIn !== undefined) updateData.checkIn = data.checkIn ? new Date(data.checkIn) : null;
  if (data.checkOut !== undefined) updateData.checkOut = data.checkOut ? new Date(data.checkOut) : null;

  const updated = await prisma.attendance.update({
    where: { id: attendanceId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return formatAttendance(updated);
}
