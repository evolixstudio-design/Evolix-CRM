import { InvoiceStatus } from "@prisma/client";

export { InvoiceStatus };

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ClientSummary {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  serviceType?: string;
  contractValue?: number | null;
}

export interface InvoiceItemData {
  id?: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount?: number;
  order?: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  projectId: string | null;
  project: ProjectSummary | null;
  clientId: string;
  client: ClientSummary;
  createdById: string;
  createdBy: UserSummary;
  issueDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  currency: string;
  discountAmount: number;
  taxRate: number;
  subtotal: number;
  totalAmount: number;
  terms: string | null;
  notes: string | null;
  items: InvoiceItemData[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  projectId?: string;
  clientId?: string;
}

export interface PaginatedInvoicesResponse {
  invoices: InvoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
