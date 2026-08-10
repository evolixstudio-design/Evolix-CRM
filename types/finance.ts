import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface ExpenseCategoryItem {
  id: string;
  name: string;
  isPredefined: boolean;
  createdAt: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  companyName?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  serviceType: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface PaymentItem {
  id: string;
  clientId: string;
  client: ClientSummary;
  projectId: string | null;
  project: ProjectSummary | null;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  recordedById: string;
  recordedBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  vendor: string | null;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  projectId: string | null;
  project: ProjectSummary | null;
  clientId: string | null;
  client: ClientSummary | null;
  recordedById: string;
  recordedBy: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  totalPaidRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalPendingPayments: number;
}

export interface FinanceChartPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface PaymentFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  clientId?: string;
  projectId?: string;
}

export interface ExpenseFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  clientId?: string;
  projectId?: string;
}

export interface PaginatedPaymentsResponse {
  payments: PaymentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedExpensesResponse {
  expenses: ExpenseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
