import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { InvoiceFilterOptions, PaginatedInvoicesResponse, InvoiceItem } from "@/types/invoice";
import { InvoiceStatus, Prisma } from "@prisma/client";

/**
 * Generate predictable sequential invoice number: INV-YYYY-XXXX
 */
export async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  let nextSequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastSeqStr = parts[parts.length - 1];
    const parsed = parseInt(lastSeqStr, 10);
    if (!isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

/**
 * Format raw Prisma Invoice object into clean InvoiceItem interface
 */
function formatInvoice(inv: any): InvoiceItem {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    projectId: inv.projectId || null,
    project: inv.project
      ? {
          id: inv.project.id,
          name: inv.project.name,
          serviceType: inv.project.serviceType,
          contractValue: inv.project.contractValue ? Number(inv.project.contractValue) : null,
        }
      : null,
    clientId: inv.clientId,
    client: {
      id: inv.client.id,
      name: inv.client.name,
      companyName: inv.client.companyName,
      email: inv.client.email,
      phone: inv.client.phone,
    },
    createdById: inv.createdById,
    createdBy: {
      id: inv.createdBy.id,
      name: inv.createdBy.name,
      email: inv.createdBy.email,
      avatarUrl: inv.createdBy.avatarUrl,
    },
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    status: inv.status,
    currency: inv.currency || "INR",
    discountAmount: inv.discountAmount ? Number(inv.discountAmount) : 0,
    taxRate: inv.taxRate ? Number(inv.taxRate) : 0,
    subtotal: inv.subtotal ? Number(inv.subtotal) : 0,
    totalAmount: inv.totalAmount ? Number(inv.totalAmount) : 0,
    terms: inv.terms || null,
    notes: inv.notes || null,
    items: (inv.items || []).map((it: any) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitRate: it.unitRate ? Number(it.unitRate) : 0,
      amount: it.amount ? Number(it.amount) : 0,
      order: it.order || 0,
    })),
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  };
}

/**
 * Fetch paginated invoices with search and filters (Co-Founder Only)
 */
export async function getInvoices(
  user: AuthUser,
  options: InvoiceFilterOptions
): Promise<PaginatedInvoicesResponse> {
  // FINANCIAL SECURITY REQUIREMENT: HTTP 403 Rejection for Interns
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.InvoiceWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { client: { companyName: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.projectId) where.projectId = options.projectId;
  if (options.clientId) where.clientId = options.clientId;

  const [total, rawInvoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        projectId: true,
        clientId: true,
        createdById: true,
        issueDate: true,
        dueDate: true,
        status: true,
        currency: true,
        discountAmount: true,
        taxRate: true,
        subtotal: true,
        totalAmount: true,
        terms: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { id: true, name: true, serviceType: true, contractValue: true } },
        client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        items: {
          orderBy: { order: "asc" },
          select: { id: true, description: true, quantity: true, unitRate: true, amount: true, order: true },
        },
      },
    }),
  ]);

  const invoices = rawInvoices.map(formatInvoice);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    invoices,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch Invoice details by ID (Co-Founder Only)
 */
export async function getInvoiceById(user: AuthUser, id: string): Promise<InvoiceItem> {
  // FINANCIAL SECURITY REQUIREMENT: HTTP 403 Rejection for Interns
  await requireCoFounder(user);

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      invoiceNumber: true,
      projectId: true,
      clientId: true,
      createdById: true,
      issueDate: true,
      dueDate: true,
      status: true,
      currency: true,
      discountAmount: true,
      taxRate: true,
      subtotal: true,
      totalAmount: true,
      terms: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      project: { select: { id: true, name: true, serviceType: true, contractValue: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      items: {
        orderBy: { order: "asc" },
        select: { id: true, description: true, quantity: true, unitRate: true, amount: true, order: true },
      },
    },
  });

  if (!invoice) {
    throw AppError.notFound("Invoice not found.");
  }

  return formatInvoice(invoice);
}

/**
 * Create a new Invoice (Co-Founder Only)
 */
export async function createInvoice(user: AuthUser, data: any) {
  // FINANCIAL SECURITY REQUIREMENT: HTTP 403 Rejection for Interns
  await requireCoFounder(user);

  if (!data.clientId) {
    throw AppError.unprocessableEntity("Client ID is required for invoice creation.");
  }

  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) {
    throw AppError.notFound("Client not found.");
  }

  if (data.projectId) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw AppError.notFound("Associated project not found.");
    }
  }

  // Financial calculations
  const items = data.items || [];
  let subtotalNum = 0;

  const itemCreateInputs = items.map((it: any, index: number) => {
    const qty = it.quantity || 1;
    const rate = Number(it.unitRate) || 0;
    const amount = qty * rate;
    subtotalNum += amount;

    return {
      description: it.description,
      quantity: qty,
      unitRate: new Prisma.Decimal(rate),
      amount: new Prisma.Decimal(amount),
      order: index,
    };
  });

  const discountNum = Number(data.discountAmount) || 0;
  const taxRateNum = Number(data.taxRate) || 0;
  const taxableSubtotal = Math.max(0, subtotalNum - discountNum);
  const taxAmountNum = taxableSubtotal * (taxRateNum / 100);
  const totalAmountNum = taxableSubtotal + taxAmountNum;

  const invoiceNumber = await generateInvoiceNumber();

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14); // Default 14 days payment terms

  const newInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      projectId: data.projectId || null,
      clientId: data.clientId,
      createdById: user.id,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : defaultDueDate,
      status: data.status || InvoiceStatus.DRAFT,
      currency: data.currency || "INR",
      discountAmount: new Prisma.Decimal(discountNum),
      taxRate: new Prisma.Decimal(taxRateNum),
      subtotal: new Prisma.Decimal(subtotalNum),
      totalAmount: new Prisma.Decimal(totalAmountNum),
      terms: data.terms || null,
      notes: data.notes || null,
      items: {
        createMany: {
          data: itemCreateInputs,
        },
      },
    },
    select: { id: true },
  });

  return getInvoiceById(user, newInvoice.id);
}

/**
 * Update Invoice status (Co-Founder Only)
 */
export async function updateInvoiceStatus(user: AuthUser, id: string, status: InvoiceStatus) {
  await requireCoFounder(user);

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound("Invoice not found.");
  }

  await prisma.invoice.update({
    where: { id },
    data: { status },
  });

  return getInvoiceById(user, id);
}

/**
 * Delete an Invoice (Co-Founder Only)
 */
export async function deleteInvoice(user: AuthUser, id: string) {
  await requireCoFounder(user);

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound("Invoice not found.");
  }

  await prisma.invoice.delete({ where: { id } });
  return { success: true, id };
}
