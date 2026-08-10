import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  FinanceSummary,
  FinanceChartPoint,
  PaymentItem,
  ExpenseItem,
  PaymentFilterOptions,
  ExpenseFilterOptions,
  PaginatedPaymentsResponse,
  PaginatedExpensesResponse,
} from "@/types/finance";
import { ActivityAction, EntityType, PaymentStatus, NotificationType, Prisma } from "@prisma/client";

/**
 * Format raw Prisma Payment object to frontend PaymentItem
 */
function formatPayment(payment: any): PaymentItem {
  return {
    id: payment.id,
    clientId: payment.clientId,
    client: {
      id: payment.client.id,
      name: payment.client.name,
      companyName: payment.client.companyName,
    },
    projectId: payment.projectId,
    project: payment.project
      ? {
          id: payment.project.id,
          name: payment.project.name,
          serviceType: payment.project.serviceType,
        }
      : null,
    amount: Number(payment.amount),
    paymentDate: payment.paymentDate.toISOString(),
    method: payment.method,
    status: payment.status,
    reference: payment.reference,
    notes: payment.notes,
    recordedById: payment.recordedById,
    recordedBy: {
      id: payment.recordedBy.id,
      name: payment.recordedBy.name,
      email: payment.recordedBy.email,
    },
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

/**
 * Format raw Prisma Expense object to frontend ExpenseItem
 */
function formatExpense(expense: any): ExpenseItem {
  return {
    id: expense.id,
    description: expense.description,
    category: expense.category,
    amount: Number(expense.amount),
    expenseDate: expense.expenseDate.toISOString(),
    vendor: expense.vendor,
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
    projectId: expense.projectId,
    project: expense.project
      ? {
          id: expense.project.id,
          name: expense.project.name,
          serviceType: expense.project.serviceType,
        }
      : null,
    clientId: expense.clientId,
    client: expense.client
      ? {
          id: expense.client.id,
          name: expense.client.name,
          companyName: expense.client.companyName,
        }
      : null,
    recordedById: expense.recordedById,
    recordedBy: {
      id: expense.recordedBy.id,
      name: expense.recordedBy.name,
      email: expense.recordedBy.email,
    },
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

/**
 * Aggregate real-time financial metrics (Co-Founder only)
 */
export async function getFinanceSummary(user: AuthUser): Promise<FinanceSummary> {
  await requireCoFounder(user);

  const [paidAggregate, pendingAggregate, expenseAggregate] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.PAID },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.PENDING },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
  ]);

  const totalPaidRevenue = paidAggregate._sum.amount ? Number(paidAggregate._sum.amount) : 0;
  const totalPendingPayments = pendingAggregate._sum.amount ? Number(pendingAggregate._sum.amount) : 0;
  const totalExpenses = expenseAggregate._sum.amount ? Number(expenseAggregate._sum.amount) : 0;

  // PROFIT = PAID REVENUE - EXPENSES
  const netProfit = totalPaidRevenue - totalExpenses;

  return {
    totalPaidRevenue,
    totalExpenses,
    netProfit,
    totalPendingPayments,
  };
}

/**
 * Aggregate monthly time-series financial chart data (Co-Founder only)
 */
export async function getFinanceChartData(user: AuthUser): Promise<FinanceChartPoint[]> {
  await requireCoFounder(user);

  const [rawPayments, rawExpenses] = await Promise.all([
    prisma.payment.findMany({
      where: { status: PaymentStatus.PAID },
      select: { amount: true, paymentDate: true },
    }),
    prisma.expense.findMany({
      select: { amount: true, expenseDate: true },
    }),
  ]);

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

  // Group revenue by YYYY-MM
  rawPayments.forEach((p) => {
    const key = p.paymentDate.toISOString().slice(0, 7); // e.g. "2026-08"
    const current = monthlyMap.get(key) || { revenue: 0, expenses: 0 };
    current.revenue += Number(p.amount);
    monthlyMap.set(key, current);
  });

  // Group expenses by YYYY-MM
  rawExpenses.forEach((e) => {
    const key = e.expenseDate.toISOString().slice(0, 7);
    const current = monthlyMap.get(key) || { revenue: 0, expenses: 0 };
    current.expenses += Number(e.amount);
    monthlyMap.set(key, current);
  });

  const sortedKeys = Array.from(monthlyMap.keys()).sort();

  return sortedKeys.map((key) => {
    const data = monthlyMap.get(key)!;
    return {
      month: key,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    };
  });
}

/**
 * Fetch paginated payments (Co-Founder only)
 */
export async function getPayments(
  user: AuthUser,
  options: PaymentFilterOptions
): Promise<PaginatedPaymentsResponse> {
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { project: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.method) where.method = options.method;
  if (options.clientId) where.clientId = options.clientId;
  if (options.projectId) where.projectId = options.projectId;

  const [total, rawPayments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paymentDate: "desc" },
      select: {
        id: true,
        clientId: true,
        projectId: true,
        amount: true,
        paymentDate: true,
        method: true,
        status: true,
        reference: true,
        notes: true,
        recordedById: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, name: true, companyName: true } },
        project: { select: { id: true, name: true, serviceType: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const payments = rawPayments.map(formatPayment);
  const totalPages = Math.ceil(total / limit) || 1;

  return { payments, total, page, limit, totalPages };
}

/**
 * Fetch payment by ID (Co-Founder only)
 */
export async function getPaymentById(user: AuthUser, paymentId: string): Promise<PaymentItem> {
  await requireCoFounder(user);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      clientId: true,
      projectId: true,
      amount: true,
      paymentDate: true,
      method: true,
      status: true,
      reference: true,
      notes: true,
      recordedById: true,
      createdAt: true,
      updatedAt: true,
      client: { select: { id: true, name: true, companyName: true } },
      project: { select: { id: true, name: true, serviceType: true } },
      recordedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!payment) {
    throw AppError.notFound("Payment record not found.");
  }

  return formatPayment(payment);
}

/**
 * Create payment record (Co-Founder only)
 */
export async function createPayment(user: AuthUser, data: any) {
  await requireCoFounder(user);

  const newPayment = await prisma.payment.create({
    data: {
      clientId: data.clientId,
      projectId: data.projectId || null,
      phaseId: data.phaseId || null,
      invoiceId: data.invoiceId || null,
      amount: new Prisma.Decimal(data.amount),
      paymentDate: new Date(data.paymentDate),
      method: data.method,
      status: data.status || PaymentStatus.PAID,
      reference: data.reference || null,
      notes: data.notes || null,
      recordedById: user.id,
    },
    select: { id: true, amount: true, clientId: true, projectId: true, phaseId: true, status: true },
  });

  // If linked to a milestone phase, recalculate phase payment status & received date
  if (data.phaseId && (data.status === PaymentStatus.PAID || data.status === PaymentStatus.PARTIAL || !data.status)) {
    const phase = await prisma.projectPhase.findUnique({
      where: { id: data.phaseId },
      include: { payments: true },
    });

    if (phase) {
      const totalPaidNum = (phase.payments || [])
        .filter((p) => p.status === PaymentStatus.PAID || p.status === PaymentStatus.PARTIAL)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const phAmountNum = Number(phase.amount);

      let newStatus: PaymentStatus = PaymentStatus.UNPAID;
      let recDate: Date | null = phase.paymentReceivedDate;

      if (totalPaidNum >= phAmountNum && phAmountNum > 0) {
        newStatus = PaymentStatus.PAID;
        recDate = new Date();
      } else if (totalPaidNum > 0) {
        newStatus = PaymentStatus.PARTIAL;
      }

      await prisma.projectPhase.update({
        where: { id: data.phaseId },
        data: {
          paymentStatus: newStatus,
          paymentReceivedDate: recDate,
        },
      });
    }
  }

  // Audit Log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.PAYMENT_CREATED,
      entityType: EntityType.PAYMENT,
      entityId: newPayment.id,
      metadata: { amount: data.amount, clientId: data.clientId, phaseId: data.phaseId },
    },
  });

  // Notification for Co-Founders
  const cofounders = await prisma.user.findMany({ where: { role: "CO_FOUNDER" }, select: { id: true } });
  for (const cf of cofounders) {
    await prisma.notification.create({
      data: {
        userId: cf.id,
        type: NotificationType.PAYMENT_RECEIVED,
        title: "💳 Payment Recorded",
        message: `Payment of ₹${data.amount} recorded.`,
        entityType: EntityType.PAYMENT,
        entityId: newPayment.id,
      },
    });
  }

  return getPaymentById(user, newPayment.id);
}

/**
 * Update payment record (Co-Founder only)
 */
export async function updatePayment(user: AuthUser, paymentId: string, data: any) {
  await requireCoFounder(user);

  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!existing) throw AppError.notFound("Payment record not found.");

  const updatePayload: Prisma.PaymentUpdateInput = {};

  if (data.clientId) updatePayload.client = { connect: { id: data.clientId } };
  if (data.projectId !== undefined) {
    updatePayload.project = data.projectId ? { connect: { id: data.projectId } } : { disconnect: true };
  }
  if (data.amount !== undefined) updatePayload.amount = new Prisma.Decimal(data.amount);
  if (data.paymentDate !== undefined) updatePayload.paymentDate = new Date(data.paymentDate);
  if (data.method !== undefined) updatePayload.method = data.method;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.reference !== undefined) updatePayload.reference = data.reference;
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  await prisma.payment.update({
    where: { id: paymentId },
    data: updatePayload,
  });

  // Audit Log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.PAYMENT_UPDATED,
      entityType: EntityType.PAYMENT,
      entityId: paymentId,
      metadata: { changes: Object.keys(updatePayload) },
    },
  });

  return getPaymentById(user, paymentId);
}

/**
 * Fetch paginated expenses (Co-Founder only)
 */
export async function getExpenses(
  user: AuthUser,
  options: ExpenseFilterOptions
): Promise<PaginatedExpensesResponse> {
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ExpenseWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { vendor: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { project: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.category) {
    where.category = { equals: options.category, mode: "insensitive" };
  }
  if (options.paymentMethod) where.paymentMethod = options.paymentMethod;
  if (options.clientId) where.clientId = options.clientId;
  if (options.projectId) where.projectId = options.projectId;

  const [total, rawExpenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { expenseDate: "desc" },
      select: {
        id: true,
        description: true,
        category: true,
        amount: true,
        expenseDate: true,
        vendor: true,
        paymentMethod: true,
        notes: true,
        projectId: true,
        clientId: true,
        recordedById: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { id: true, name: true, serviceType: true } },
        client: { select: { id: true, name: true, companyName: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const expenses = rawExpenses.map(formatExpense);
  const totalPages = Math.ceil(total / limit) || 1;

  return { expenses, total, page, limit, totalPages };
}

/**
 * Fetch expense by ID (Co-Founder only)
 */
export async function getExpenseById(user: AuthUser, expenseId: string): Promise<ExpenseItem> {
  await requireCoFounder(user);

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: {
      id: true,
      description: true,
      category: true,
      amount: true,
      expenseDate: true,
      vendor: true,
      paymentMethod: true,
      notes: true,
      projectId: true,
      clientId: true,
      recordedById: true,
      createdAt: true,
      updatedAt: true,
      project: { select: { id: true, name: true, serviceType: true } },
      client: { select: { id: true, name: true, companyName: true } },
      recordedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!expense) {
    throw AppError.notFound("Expense record not found.");
  }

  return formatExpense(expense);
}

/**
 * Create expense record (Co-Founder only)
 */
export async function createExpense(user: AuthUser, data: any) {
  await requireCoFounder(user);

  const newExpense = await prisma.expense.create({
    data: {
      description: data.description,
      category: data.category,
      amount: new Prisma.Decimal(data.amount),
      expenseDate: new Date(data.expenseDate),
      vendor: data.vendor || null,
      paymentMethod: data.paymentMethod || null,
      notes: data.notes || null,
      projectId: data.projectId || null,
      clientId: data.clientId || null,
      recordedById: user.id,
    },
    select: { id: true },
  });

  // Audit Log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.EXPENSE_CREATED,
      entityType: EntityType.EXPENSE,
      entityId: newExpense.id,
      metadata: { description: data.description, amount: data.amount },
    },
  });

  return getExpenseById(user, newExpense.id);
}

/**
 * Update expense record (Co-Founder only)
 */
export async function updateExpense(user: AuthUser, expenseId: string, data: any) {
  await requireCoFounder(user);

  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!existing) throw AppError.notFound("Expense record not found.");

  const updatePayload: Prisma.ExpenseUpdateInput = {};

  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.amount !== undefined) updatePayload.amount = new Prisma.Decimal(data.amount);
  if (data.expenseDate !== undefined) updatePayload.expenseDate = new Date(data.expenseDate);
  if (data.vendor !== undefined) updatePayload.vendor = data.vendor;
  if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.projectId !== undefined) {
    updatePayload.project = data.projectId ? { connect: { id: data.projectId } } : { disconnect: true };
  }
  if (data.clientId !== undefined) {
    updatePayload.client = data.clientId ? { connect: { id: data.clientId } } : { disconnect: true };
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: updatePayload,
  });

  // Audit Log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.EXPENSE_UPDATED,
      entityType: EntityType.EXPENSE,
      entityId: expenseId,
      metadata: { changes: Object.keys(updatePayload) },
    },
  });

  return getExpenseById(user, expenseId);
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Software",
  "Marketing",
  "Travel",
  "Office",
  "Salary",
  "Equipment",
  "Client Expense",
  "Hosting",
  "Advertising",
  "Freelancer",
  "Intern Stipend",
  "Tools",
  "Other",
];

/**
 * Fetch all expense categories (predefined + custom).
 * Auto-seeds default predefined categories if none exist.
 */
export async function getExpenseCategories() {
  let categories = await prisma.expenseCategory.findMany({
    orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
  });

  if (categories.length === 0) {
    // Seed default categories
    await prisma.expenseCategory.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
        name,
        isPredefined: true,
      })),
      skipDuplicates: true,
    });

    categories = await prisma.expenseCategory.findMany({
      orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
    });
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    isPredefined: c.isPredefined,
    createdAt: c.createdAt.toISOString(),
  }));
}

/**
 * Create a new custom expense category (Co-Founder only).
 */
export async function createExpenseCategory(user: AuthUser, name: string) {
  await requireCoFounder(user);

  const cleanName = name.trim();
  if (!cleanName) {
    throw AppError.unprocessableEntity("Category name cannot be empty.");
  }

  const existing = await prisma.expenseCategory.findFirst({
    where: { name: { equals: cleanName, mode: "insensitive" } },
  });

  if (existing) {
    throw AppError.conflict(`Expense category "${existing.name}" already exists.`);
  }

  const newCategory = await prisma.expenseCategory.create({
    data: {
      name: cleanName,
      isPredefined: false,
    },
  });

  return {
    id: newCategory.id,
    name: newCategory.name,
    isPredefined: newCategory.isPredefined,
    createdAt: newCategory.createdAt.toISOString(),
  };
}

