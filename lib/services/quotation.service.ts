import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { QuotationFilterOptions, PaginatedQuotationsResponse, QuotationItem } from "@/types/quotation";
import { QuotationStatus, EntityType, ActivityAction, Prisma } from "@prisma/client";

/**
 * Generate sequential quotation number: QUO-YYYY-XXXX
 */
export async function generateQuotationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `QUO-${currentYear}-`;

  const lastQuotation = await prisma.quotation.findFirst({
    where: { quotationNumber: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { quotationNumber: true },
  });

  let nextSequence = 1;
  if (lastQuotation && lastQuotation.quotationNumber) {
    const parts = lastQuotation.quotationNumber.split("-");
    const lastSeqStr = parts[parts.length - 1];
    const parsed = parseInt(lastSeqStr, 10);
    if (!isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

/**
 * Format raw Prisma Quotation object into clean QuotationItem interface
 */
function formatQuotation(q: any): QuotationItem {
  return {
    id: q.id,
    quotationNumber: q.quotationNumber,
    leadId: q.leadId || null,
    lead: q.lead ? { id: q.lead.id, name: q.lead.name, companyName: q.lead.companyName, email: q.lead.email, phone: q.lead.phone } : null,
    clientId: q.clientId || null,
    client: q.client ? { id: q.client.id, name: q.client.name, companyName: q.client.companyName, email: q.client.email, phone: q.client.phone } : null,
    createdById: q.createdById,
    createdBy: {
      id: q.createdBy.id,
      name: q.createdBy.name,
      email: q.createdBy.email,
      avatarUrl: q.createdBy.avatarUrl,
    },
    contactName: q.contactName,
    companyName: q.companyName || null,
    email: q.email || null,
    phone: q.phone || null,
    status: q.status,
    currency: q.currency || "INR",
    discountAmount: q.discountAmount ? Number(q.discountAmount) : 0,
    taxRate: q.taxRate ? Number(q.taxRate) : 0,
    subtotal: q.subtotal ? Number(q.subtotal) : 0,
    totalAmount: q.totalAmount ? Number(q.totalAmount) : 0,
    validUntil: q.validUntil ? q.validUntil.toISOString() : null,
    terms: q.terms || null,
    notes: q.notes || null,
    items: (q.items || []).map((it: any) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitRate: it.unitRate ? Number(it.unitRate) : 0,
      amount: it.amount ? Number(it.amount) : 0,
      order: it.order || 0,
    })),
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

/**
 * Fetch paginated quotations with search and filters
 */
export async function getQuotations(
  user: AuthUser,
  options: QuotationFilterOptions
): Promise<PaginatedQuotationsResponse> {
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.QuotationWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { quotationNumber: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.leadId) where.leadId = options.leadId;
  if (options.clientId) where.clientId = options.clientId;

  const [total, rawQuotations] = await Promise.all([
    prisma.quotation.count({ where }),
    prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        quotationNumber: true,
        leadId: true,
        clientId: true,
        createdById: true,
        contactName: true,
        companyName: true,
        email: true,
        phone: true,
        status: true,
        currency: true,
        discountAmount: true,
        taxRate: true,
        subtotal: true,
        totalAmount: true,
        validUntil: true,
        terms: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
        client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        items: {
          orderBy: { order: "asc" },
          select: { id: true, description: true, quantity: true, unitRate: true, amount: true, order: true },
        },
      },
    }),
  ]);

  const quotations = rawQuotations.map(formatQuotation);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    quotations,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch quotation by ID
 */
export async function getQuotationById(user: AuthUser, id: string): Promise<QuotationItem> {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    select: {
      id: true,
      quotationNumber: true,
      leadId: true,
      clientId: true,
      createdById: true,
      contactName: true,
      companyName: true,
      email: true,
      phone: true,
      status: true,
      currency: true,
      discountAmount: true,
      taxRate: true,
      subtotal: true,
      totalAmount: true,
      validUntil: true,
      terms: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      items: {
        orderBy: { order: "asc" },
        select: { id: true, description: true, quantity: true, unitRate: true, amount: true, order: true },
      },
    },
  });

  if (!quotation) {
    throw AppError.notFound("Quotation not found.");
  }

  return formatQuotation(quotation);
}

/**
 * Create a new Quotation
 * Auto-populates Lead info if leadId is provided.
 */
export async function createQuotation(user: AuthUser, data: any) {
  await requireCoFounder(user);

  let contactName = data.contactName;
  let companyName = data.companyName;
  let email = data.email;
  let phone = data.phone;

  // Auto-populate from Lead if leadId is provided and contact details not explicitly filled
  if (data.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (lead) {
      if (!contactName) contactName = lead.name;
      if (!companyName) companyName = lead.companyName || undefined;
      if (!email) email = lead.email || undefined;
      if (!phone) phone = lead.phone || undefined;
    }
  }

  if (!contactName) {
    throw AppError.unprocessableEntity("Contact name is required.");
  }

  // Calculate items amounts & subtotal
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

  const quotationNumber = await generateQuotationNumber();

  const newQuotation = await prisma.quotation.create({
    data: {
      quotationNumber,
      leadId: data.leadId || null,
      clientId: data.clientId || null,
      createdById: user.id,
      contactName,
      companyName: companyName || null,
      email: email || null,
      phone: phone || null,
      status: data.status || QuotationStatus.DRAFT,
      currency: data.currency || "INR",
      discountAmount: new Prisma.Decimal(discountNum),
      taxRate: new Prisma.Decimal(taxRateNum),
      subtotal: new Prisma.Decimal(subtotalNum),
      totalAmount: new Prisma.Decimal(totalAmountNum),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
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

  return getQuotationById(user, newQuotation.id);
}

/**
 * Update Quotation status
 */
export async function updateQuotationStatus(user: AuthUser, id: string, status: QuotationStatus) {
  await requireCoFounder(user);

  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound("Quotation not found.");
  }

  await prisma.quotation.update({
    where: { id },
    data: { status },
  });

  return getQuotationById(user, id);
}

/**
 * Convert Accepted Quotation to Project Data payload
 */
export async function convertQuotationToProjectData(user: AuthUser, id: string) {
  await requireCoFounder(user);

  const quotation = await getQuotationById(user, id);

  if (quotation.status !== "ACCEPTED" && quotation.status !== "CONVERTED") {
    throw AppError.unprocessableEntity("Only ACCEPTED quotations can be converted into Project data.");
  }

  // Update status to CONVERTED
  await prisma.quotation.update({
    where: { id },
    data: { status: QuotationStatus.CONVERTED },
  });

  // Return formatted Project creation payload for front-end or project initialization
  return {
    quotationId: quotation.id,
    quotationNumber: quotation.quotationNumber,
    clientId: quotation.clientId || null,
    leadId: quotation.leadId || null,
    projectName: `${quotation.companyName || quotation.contactName} - Deliverable Project`,
    contractValue: quotation.totalAmount,
    currency: quotation.currency || "INR",
    contractType: "FIXED_PRICE",
    notes: `Converted from Quotation #${quotation.quotationNumber}. Scope: ${quotation.items.map((i) => i.description).join(", ")}`,
  };
}

/**
 * Delete a Quotation (Co-Founder only)
 */
export async function deleteQuotation(user: AuthUser, id: string) {
  await requireCoFounder(user);

  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound("Quotation not found.");
  }

  await prisma.quotation.delete({ where: { id } });
  return { success: true, id };
}
