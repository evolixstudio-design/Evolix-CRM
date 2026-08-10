"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { DollarSign, CreditCard, Plus, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Toast } from "@/components/ui/toast";
import { FinanceStatCards } from "@/components/finance/finance-stat-cards";
import { FinanceChart } from "@/components/finance/finance-chart";
import { PaymentListTable } from "@/components/finance/payment-list-table";
import { PaymentFormModal } from "@/components/finance/payment-form-modal";
import { ExpenseListTable } from "@/components/finance/expense-list-table";
import { ExpenseFormModal } from "@/components/finance/expense-form-modal";
import {
  FinanceSummary,
  FinanceChartPoint,
  PaymentItem,
  ExpenseItem,
} from "@/types/finance";

export default function FinancePage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "payments" | "expenses">("overview");

  // Financial summary & chart data
  const [summary, setSummary] = React.useState<FinanceSummary | null>(null);
  const [chartData, setChartData] = React.useState<FinanceChartPoint[]>([]);

  // Ledger lists
  const [payments, setPayments] = React.useState<PaymentItem[]>([]);
  const [expenses, setExpenses] = React.useState<ExpenseItem[]>([]);

  // Selection dropdowns
  const [clients, setClients] = React.useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = React.useState<{ id: string; name: string }[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [editingPayment, setEditingPayment] = React.useState<PaymentItem | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseItem | null>(null);

  const fetchFinanceData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [sumRes, chartRes, payRes, expRes, clientRes, projRes] = await Promise.all([
        fetch("/api/finance/summary"),
        fetch("/api/finance/chart"),
        fetch("/api/finance/payments?limit=50"),
        fetch("/api/finance/expenses?limit=50"),
        fetch("/api/clients?limit=100"),
        fetch("/api/projects?limit=100"),
      ]);

      if (sumRes.status === 403) {
        setErrorMsg("Access Denied: Financial data and reporting are strictly restricted to Co-Founders.");
        setIsLoading(false);
        return;
      }

      const [sumJson, chartJson, payJson, expJson, clientJson, projJson] = await Promise.all([
        sumRes.json(),
        chartRes.json(),
        payRes.json(),
        expRes.json(),
        clientRes.json(),
        projRes.json(),
      ]);

      if (sumJson.success) setSummary(sumJson.data);
      if (chartJson.success) setChartData(chartJson.data);
      if (payJson.success) setPayments(payJson.data.payments);
      if (expJson.success) setExpenses(expJson.data.expenses);

      if (clientJson.success && clientJson.data?.clients) {
        setClients(clientJson.data.clients.map((c: any) => ({ id: c.id, name: c.name })));
      }
      if (projJson.success && projJson.data?.projects) {
        setProjects(projJson.data.projects.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (e) {
      setErrorMsg("Network error fetching financial metrics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handlePaymentSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingPayment);
      const url = isEditing ? `/api/finance/payments/${editingPayment!.id}` : "/api/finance/payments";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Save Failed", message: json.error?.message || "Failed to record payment." });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Payment Updated" : "Payment Recorded",
        message: `Successfully saved payment record.`,
      });
      setIsPaymentModalOpen(false);
      fetchFinanceData();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving payment." });
    }
  };

  const handleExpenseSubmit = async (formData: any) => {
    try {
      const isEditing = Boolean(editingExpense);
      const url = isEditing ? `/api/finance/expenses/${editingExpense!.id}` : "/api/finance/expenses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToast({ type: "error", title: "Save Failed", message: json.error?.message || "Failed to record expense." });
        return;
      }

      setToast({
        type: "success",
        title: isEditing ? "Expense Updated" : "Expense Recorded",
        message: `Successfully saved expense record for '${json.data.description}'.`,
      });
      setIsExpenseModalOpen(false);
      fetchFinanceData();
    } catch (e) {
      setToast({ type: "error", title: "Error", message: "Network error saving expense." });
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">Financial Ledger</h1>
            <Badge variant="default">CO_FOUNDER Access Only</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue, expense logs, profit balances, and cash flow trends.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchFinanceData} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          >
            <CreditCard className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingPayment(null);
              setIsPaymentModalOpen(true);
            }}
          >
            <DollarSign className="h-4 w-4 mr-1.5" />
            Add Payment
          </Button>
        </div>
      </div>

      {errorMsg ? (
        <ErrorState title="Access Restricted" message={errorMsg} onRetry={fetchFinanceData} />
      ) : isLoading ? (
        <LoadingState label="Loading financial ledger and chart trends..." />
      ) : (
        <>
          {/* Stat Cards */}
          {summary && <FinanceStatCards summary={summary} />}

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Financial Overview & Trends</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                activeTab === "payments"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Payments Ledger ({payments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                activeTab === "expenses"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Expenses Ledger ({expenses.length})</span>
            </button>
          </div>

          {/* Tab 1: Financial Overview & Trends */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <FinanceChart chartData={chartData} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <Card className="p-4 border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Recent Payments</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("payments")} className="text-xs text-teal-600">
                      View All
                    </Button>
                  </div>
                  <PaymentListTable
                    payments={payments.slice(0, 5)}
                    onEditPayment={(p) => {
                      setEditingPayment(p);
                      setIsPaymentModalOpen(true);
                    }}
                  />
                </Card>

                {/* Recent Expenses */}
                <Card className="p-4 border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Recent Expenses</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("expenses")} className="text-xs text-rose-600">
                      View All
                    </Button>
                  </div>
                  <ExpenseListTable
                    expenses={expenses.slice(0, 5)}
                    onEditExpense={(e) => {
                      setEditingExpense(e);
                      setIsExpenseModalOpen(true);
                    }}
                  />
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Payments Ledger */}
          {activeTab === "payments" && (
            <Card className="p-0 border-slate-100 overflow-hidden">
              {payments.length === 0 ? (
                <EmptyState
                  title="No Payments Recorded"
                  description="No client payments have been logged into the revenue ledger yet."
                  actionLabel="Record Payment"
                  onAction={() => {
                    setEditingPayment(null);
                    setIsPaymentModalOpen(true);
                  }}
                  icon={<DollarSign className="h-6 w-6" />}
                />
              ) : (
                <PaymentListTable
                  payments={payments}
                  onEditPayment={(p) => {
                    setEditingPayment(p);
                    setIsPaymentModalOpen(true);
                  }}
                />
              )}
            </Card>
          )}

          {/* Tab 3: Expenses Ledger */}
          {activeTab === "expenses" && (
            <Card className="p-0 border-slate-100 overflow-hidden">
              {expenses.length === 0 ? (
                <EmptyState
                  title="No Expenses Recorded"
                  description="No operational or project expenses have been logged yet."
                  actionLabel="Record Expense"
                  onAction={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  icon={<CreditCard className="h-6 w-6" />}
                />
              ) : (
                <ExpenseListTable
                  expenses={expenses}
                  onEditExpense={(e) => {
                    setEditingExpense(e);
                    setIsExpenseModalOpen(true);
                  }}
                />
              )}
            </Card>
          )}
        </>
      )}

      {/* Payment Drawer */}
      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        payment={editingPayment}
        clients={clients}
        projects={projects}
      />

      {/* Expense Drawer */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleExpenseSubmit}
        expense={editingExpense}
        clients={clients}
        projects={projects}
      />
    </div>
  );
}
