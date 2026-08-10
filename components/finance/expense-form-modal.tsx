"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExpenseItem, ExpenseCategoryItem } from "@/types/finance";
import { PaymentMethod } from "@prisma/client";
import { Plus, Check, X } from "lucide-react";

export interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  expense?: ExpenseItem | null;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  isLoading?: boolean;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  expense,
  clients,
  projects,
  isLoading = false,
}: ExpenseFormModalProps) {
  const isEditing = Boolean(expense);

  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Software");
  const [amount, setAmount] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState("");
  const [vendor, setVendor] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [projectId, setProjectId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Categories list & custom category state
  const [categories, setCategories] = React.useState<ExpenseCategoryItem[]>([]);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
  const [categoryError, setCategoryError] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/finance/expense-categories");
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch expense categories:", e);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setIsAddingCategory(false);
      setNewCategoryName("");
      setCategoryError(null);
    }
  }, [isOpen, fetchCategories]);

  React.useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      setCategory(expense.category || "Software");
      setAmount(expense.amount !== undefined ? String(expense.amount) : "");
      setExpenseDate(expense.expenseDate ? expense.expenseDate.split("T")[0] : "");
      setVendor(expense.vendor || "");
      setPaymentMethod(expense.paymentMethod || "");
      setProjectId(expense.projectId || "");
      setClientId(expense.clientId || "");
      setNotes(expense.notes || "");
    } else {
      setDescription("");
      setCategory("Software");
      setAmount("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setVendor("");
      setPaymentMethod("");
      setProjectId("");
      setClientId("");
      setNotes("");
    }
  }, [expense, isOpen]);

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "ADD_NEW_CATEGORY") {
      setIsAddingCategory(true);
      setCategoryError(null);
    } else {
      setCategory(val);
    }
  };

  const handleCreateCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setIsCreatingCategory(true);
    setCategoryError(null);

    try {
      const res = await fetch("/api/finance/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setCategoryError(json.error?.message || "Failed to create category");
        return;
      }

      const createdCat = json.data;
      setCategories((prev) => [...prev, createdCat]);
      setCategory(createdCat.name);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      setCategoryError("Network error creating category.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description,
      category,
      amount: parseFloat(amount),
      expenseDate: new Date(expenseDate).toISOString(),
      vendor: vendor || null,
      paymentMethod: paymentMethod || null,
      projectId: projectId || null,
      clientId: clientId || null,
      notes: notes || null,
    };
    await onSubmit(payload);
  };

  // Build category options for Select
  const selectCategoryOptions = [
    ...categories.map((c) => ({ label: c.name, value: c.name })),
    { label: "+ Add Category", value: "ADD_NEW_CATEGORY" },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Expense Record" : "Record New Expense"}
      description={
        isEditing
          ? "Update expense description, category, or vendor info."
          : "Log an operational or project expense transaction."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Expense Description *"
          placeholder="e.g. AWS Cloud Hosting / Figma Pro License"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Select
              label="Category *"
              value={isAddingCategory ? "ADD_NEW_CATEGORY" : category}
              onChange={handleCategorySelectChange}
              options={selectCategoryOptions}
            />

            {isAddingCategory && (
              <div className="mt-2 space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Create Custom Category</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Input
                    placeholder="Category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleCreateCategory}
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    className="h-8 px-2.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {categoryError && (
                  <p className="text-[11px] text-rose-600 font-medium">{categoryError}</p>
                )}
              </div>
            )}
          </div>

          <Input
            label="Amount (INR ₹) *"
            type="number"
            placeholder="120"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Expense Date *"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />

          <Input
            label="Vendor / Payee"
            placeholder="e.g. Amazon Web Services"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="Select Method"
            options={[
              { label: "Bank Transfer", value: PaymentMethod.BANK_TRANSFER },
              { label: "UPI", value: PaymentMethod.UPI },
              { label: "Cash", value: PaymentMethod.CASH },
              { label: "Card", value: PaymentMethod.CARD },
              { label: "Other", value: PaymentMethod.OTHER },
            ]}
          />

          <Select
            label="Associated Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="No Project"
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
          />
        </div>

        <Select
          label="Associated Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="No Client"
          options={clients.map((c) => ({ label: c.name, value: c.id }))}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Notes</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Receipt notes or invoice details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Expense" : "Record Expense"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
