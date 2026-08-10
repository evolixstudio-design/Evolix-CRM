import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  RecurringContractItem,
  RecurringBillingPeriodItem,
  RecurringFilterOptions,
  PaginatedRecurringContractsResponse,
} from "@/types/recurring";
import { generateInvoiceNumber } from "@/lib/services/invoice.service";
import { ActivityAction, EntityType, NotificationType, Prisma } from "@prisma/client";

/**
 * Format raw Prisma RecurringContract object into frontend RecurringContractItem
 */
function formatRecurringContract(contract: any): RecurringContractItem {
  const mAmount = Number(contract.monthlyAmount || 0);
  const dur = contract.durationMonths || 12;
  const totalVal = mAmount * dur;

  const periodsList: RecurringBillingPeriodItem[] = (contract.billingPeriods || []).map((p: any) => ({
    id: p.id,
    contractId: p.contractId,
    periodNumber: p.periodNumber,
    periodStartDate: p.periodStartDate.toISOString(),
    periodEndDate: p.periodEndDate.toISOString(),
    dueDate: p.dueDate.toISOString(),
    amount: Number(p.amount),
    invoiceId: p.invoiceId || null,
    invoiceNumber: p.invoice ? p.invoice.invoiceNumber : null,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const invoicesCount = periodsList.filter((p) => p.invoiceId !== null).length;

  return {
    id: contract.id,
    title: contract.title,
    clientId: contract.clientId,
    client: {
      id: contract.client.id,
      name: contract.client.name,
      companyName: contract.client.companyName,
      email: contract.client.email,
    },
    projectId: contract.projectId || null,
    project: contract.project
      ? {
          id: contract.project.id,
          name: contract.project.name,
          serviceType: contract.project.serviceType,
        }
      : null,
    createdById: contract.createdById,
    createdBy: contract.createdBy
      ? {
          id: contract.createdBy.id,
          name: contract.createdBy.name,
          email: contract.createdBy.email,
        }
      : undefined,
    startDate: contract.startDate.toISOString(),
    endDate: contract.endDate.toISOString(),
    durationMonths: dur,
    billingFrequency: contract.billingFrequency || "MONTHLY",
    monthlyAmount: mAmount,
    totalContractValue: totalVal,
    currency: contract.currency || "INR",
    status: contract.status || "ACTIVE",
    notes: contract.notes || null,
    billingPeriods: periodsList,
    generatedInvoicesCount: invoicesCount,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
  };
}

/**
 * Fetch paginated recurring contracts (Co-Founder only)
 */
export async function getRecurringContracts(
  user: AuthUser,
  options: RecurringFilterOptions
): Promise<PaginatedRecurringContractsResponse> {
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.RecurringContractWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.clientId) where.clientId = options.clientId;
  if (options.projectId) where.projectId = options.projectId;

  const [total, rawContracts] = await Promise.all([
    prisma.recurringContract.count({ where }),
    prisma.recurringContract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { id: true, name: true, companyName: true, email: true } },
        project: { select: { id: true, name: true, serviceType: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        billingPeriods: {
          orderBy: { periodNumber: "asc" },
          include: { invoice: { select: { id: true, invoiceNumber: true } } },
        },
      },
    }),
  ]);

  const contracts = rawContracts.map((c) => formatRecurringContract(c));
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    contracts,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get recurring contract by ID
 */
export async function getRecurringContractById(
  user: AuthUser,
  contractId: string
): Promise<RecurringContractItem> {
  await requireCoFounder(user);

  const contract = await prisma.recurringContract.findUnique({
    where: { id: contractId },
    include: {
      client: { select: { id: true, name: true, companyName: true, email: true } },
      project: { select: { id: true, name: true, serviceType: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      billingPeriods: {
        orderBy: { periodNumber: "asc" },
        include: { invoice: { select: { id: true, invoiceNumber: true } } },
      },
    },
  });

  if (!contract) {
    throw AppError.notFound("Recurring brand deal contract not found.");
  }

  return formatRecurringContract(contract);
}

/**
 * Create a new Recurring Brand Deal Contract with pre-generated unique billing periods
 */
export async function createRecurringContract(user: AuthUser, data: any) {
  await requireCoFounder(user);

  const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!clientExists) {
    throw AppError.notFound("Associated Client not found.");
  }

  if (data.projectId) {
    const projectExists = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!projectExists) {
      throw AppError.notFound("Associated Project not found.");
    }
  }

  const startDt = new Date(data.startDate);
  const durMonths = Number(data.durationMonths) || 12;

  // Calculate End Date: Start Date + durationMonths
  const endDt = data.endDate
    ? new Date(data.endDate)
    : new Date(startDt.getFullYear(), startDt.getMonth() + durMonths, startDt.getDate());

  const monthlyAmt = new Prisma.Decimal(data.monthlyAmount);

  // Pre-calculate 12 Billing Periods
  const periodsData = [];
  for (let i = 1; i <= durMonths; i++) {
    const pStartDate = new Date(startDt.getFullYear(), startDt.getMonth() + (i - 1), startDt.getDate());
    const pEndDate = new Date(startDt.getFullYear(), startDt.getMonth() + i, startDt.getDate() - 1);
    const pDueDate = new Date(pStartDate); // Due on start of period

    periodsData.push({
      periodNumber: i,
      periodStartDate: pStartDate,
      periodEndDate: pEndDate,
      dueDate: pDueDate,
      amount: monthlyAmt,
      status: "PENDING",
    });
  }

  // Create Contract and Period records atomically
  const newContract = await prisma.recurringContract.create({
    data: {
      title: data.title,
      clientId: data.clientId,
      projectId: data.projectId || null,
      createdById: user.id,
      startDate: startDt,
      endDate: endDt,
      durationMonths: durMonths,
      billingFrequency: data.billingFrequency || "MONTHLY",
      monthlyAmount: monthlyAmt,
      currency: data.currency || "INR",
      status: "ACTIVE",
      notes: data.notes || null,
      billingPeriods: {
        create: periodsData,
      },
    },
  });

  // Audit Log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.PROJECT_CREATED,
      entityType: EntityType.PROJECT,
      entityId: newContract.id,
      metadata: { title: data.title, monthlyAmount: data.monthlyAmount, durationMonths: durMonths },
    },
  });

  return getRecurringContractById(user, newContract.id);
}

/**
 * AUTO INVOICE GENERATION ENGINE (IDEMPOTENT / ANTI-DUPLICATION)
 * Generates monthly invoice records for due/scheduled billing periods.
 * Strictly guarantees NO DUPLICATE INVOICES are generated.
 */
export async function generateScheduledInvoices(user: AuthUser, contractId?: string) {
  await requireCoFounder(user);

  const whereClause: Prisma.RecurringBillingPeriodWhereInput = {
    invoiceId: null, // Only periods without an invoice
  };

  if (contractId) {
    whereClause.contractId = contractId;
  }

  const pendingPeriods = await prisma.recurringBillingPeriod.findMany({
    where: whereClause,
    include: {
      contract: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { periodNumber: "asc" },
  });

  const generatedInvoices = [];

  for (const period of pendingPeriods) {
    // ANTI-DUPLICATION GUARANTEE: Double check if invoice already created for period
    if (period.invoiceId) continue;

    const existingInvoice = await prisma.invoice.findFirst({
      where: { recurringBillingPeriodId: period.id },
    });

    if (existingInvoice) {
      // Link period to existing invoice if previously unlinked
      await prisma.recurringBillingPeriod.update({
        where: { id: period.id },
        data: { invoiceId: existingInvoice.id, status: "INVOICED" },
      });
      continue;
    }

    // Generate unique sequential invoice number (INV-YYYY-XXXX)
    const invNumber = await generateInvoiceNumber();

    const monthlyAmtNum = Number(period.amount);

    // Create unique Invoice record
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invNumber,
        projectId: period.contract.projectId || null,
        clientId: period.contract.clientId,
        createdById: user.id,
        issueDate: period.periodStartDate,
        dueDate: period.dueDate,
        status: "SENT",
        currency: period.contract.currency || "INR",
        subtotal: period.amount,
        discountAmount: new Prisma.Decimal(0),
        taxRate: new Prisma.Decimal(0),
        totalAmount: period.amount,
        recurringContractId: period.contract.id,
        recurringBillingPeriodId: period.id,
        notes: `Recurring Brand Deal: ${period.contract.title} (Period #${period.periodNumber})`,
        items: {
          create: [
            {
              description: `${period.contract.title} - Billing Period #${period.periodNumber} (${period.periodStartDate.toISOString().split("T")[0]} to ${period.periodEndDate.toISOString().split("T")[0]})`,
              quantity: 1,
              unitRate: period.amount,
              amount: period.amount,
              order: 0,
            },
          ],
        },
      },
    });

    // Update period with invoiceId and status INVOICED
    await prisma.recurringBillingPeriod.update({
      where: { id: period.id },
      data: {
        invoiceId: invoice.id,
        status: "INVOICED",
      },
    });

    generatedInvoices.push({
      contractId: period.contractId,
      periodNumber: period.periodNumber,
      invoiceId: invoice.id,
      invoiceNumber: invNumber,
      amount: monthlyAmtNum,
    });
  }

  return {
    success: true,
    generatedCount: generatedInvoices.length,
    invoices: generatedInvoices,
  };
}

/**
 * REMINDERS ENGINE
 * Creates internal reminders and notifications for:
 * - Upcoming billing (due within 3 days)
 * - Due Today billing
 * - Overdue billing
 */
export async function checkAndTriggerReminders(user: AuthUser) {
  await requireCoFounder(user);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const allPeriods = await prisma.recurringBillingPeriod.findMany({
    include: {
      contract: {
        include: { client: true },
      },
      invoice: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const upcoming: any[] = [];
  const dueToday: any[] = [];
  const overdue: any[] = [];

  const cofounders = await prisma.user.findMany({ where: { role: "CO_FOUNDER" }, select: { id: true } });

  for (const period of allPeriods) {
    const dueStr = period.dueDate.toISOString().split("T")[0];
    const isPaid = period.invoice?.status === "PAID" || period.status === "PAID";

    if (isPaid) continue;

    const info = {
      periodId: period.id,
      contractTitle: period.contract.title,
      clientName: period.contract.client.name,
      periodNumber: period.periodNumber,
      amount: Number(period.amount),
      dueDate: dueStr,
      invoiceNumber: period.invoice?.invoiceNumber || null,
    };

    if (dueStr < todayStr) {
      overdue.push(info);
      // Update period status to OVERDUE if not paid
      if (period.status !== "OVERDUE") {
        await prisma.recurringBillingPeriod.update({
          where: { id: period.id },
          data: { status: "OVERDUE" },
        });
      }
    } else if (dueStr === todayStr) {
      dueToday.push(info);
    } else if (period.dueDate <= threeDaysFromNow) {
      upcoming.push(info);
    }
  }

  // Generate internal notifications for Co-Founders for Overdue & Due Today
  for (const item of overdue) {
    for (const cf of cofounders) {
      await prisma.notification.create({
        data: {
          userId: cf.id,
          type: NotificationType.PAYMENT_OVERDUE,
          title: "⚠️ Overdue Recurring Brand Deal Invoice",
          message: `Period #${item.periodNumber} for '${item.contractTitle}' (₹${item.amount.toLocaleString("en-IN")}) is OVERDUE (Due: ${item.dueDate}).`,
          entityType: EntityType.PAYMENT,
          entityId: item.periodId,
        },
      });
    }
  }

  for (const item of dueToday) {
    for (const cf of cofounders) {
      await prisma.notification.create({
        data: {
          userId: cf.id,
          type: NotificationType.PAYMENT_OVERDUE,
          title: "🔔 Recurring Brand Deal Payment Due Today",
          message: `Period #${item.periodNumber} for '${item.contractTitle}' (₹${item.amount.toLocaleString("en-IN")}) is DUE TODAY.`,
          entityType: EntityType.PAYMENT,
          entityId: item.periodId,
        },
      });
    }
  }

  return {
    summary: {
      upcomingCount: upcoming.length,
      dueTodayCount: dueToday.length,
      overdueCount: overdue.length,
    },
    upcoming,
    dueToday,
    overdue,
  };
}

/**
 * Update recurring contract status
 */
export async function updateRecurringContractStatus(
  user: AuthUser,
  contractId: string,
  status: string
) {
  await requireCoFounder(user);

  const updated = await prisma.recurringContract.update({
    where: { id: contractId },
    data: { status },
  });

  return getRecurringContractById(user, updated.id);
}

/**
 * Delete recurring contract
 */
export async function deleteRecurringContract(user: AuthUser, contractId: string) {
  await requireCoFounder(user);

  await prisma.recurringContract.delete({
    where: { id: contractId },
  });

  return { success: true };
}
