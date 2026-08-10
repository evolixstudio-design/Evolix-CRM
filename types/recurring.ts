export interface RecurringBillingPeriodItem {
  id: string;
  contractId: string;
  periodNumber: number;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  amount: number;
  invoiceId: string | null;
  invoiceNumber?: string | null;
  status: string; // "PENDING" | "INVOICED" | "PAID" | "OVERDUE"
  createdAt: string;
  updatedAt: string;
}

export interface RecurringContractItem {
  id: string;
  title: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    companyName?: string | null;
    email?: string | null;
  };
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    serviceType: string;
  } | null;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  durationMonths: number;
  billingFrequency: string; // "MONTHLY" | "QUARTERLY" | "ANNUALLY"
  monthlyAmount: number;
  totalContractValue: number;
  currency: string;
  status: string; // "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  notes?: string | null;
  billingPeriods: RecurringBillingPeriodItem[];
  generatedInvoicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  clientId?: string;
  projectId?: string;
}

export interface PaginatedRecurringContractsResponse {
  contracts: RecurringContractItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
