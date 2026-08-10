import { QuotationStatus } from "@prisma/client";

export { QuotationStatus };

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface LeadSummary {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ClientSummary {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface QuotationItemData {
  id?: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount?: number;
  order?: number;
}

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  leadId: string | null;
  lead: LeadSummary | null;
  clientId: string | null;
  client: ClientSummary | null;
  createdById: string;
  createdBy: UserSummary;
  contactName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  status: QuotationStatus;
  currency: string;
  discountAmount: number;
  taxRate: number;
  subtotal: number;
  totalAmount: number;
  validUntil: string | null;
  terms: string | null;
  notes: string | null;
  items: QuotationItemData[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  leadId?: string;
  clientId?: string;
}

export interface PaginatedQuotationsResponse {
  quotations: QuotationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
