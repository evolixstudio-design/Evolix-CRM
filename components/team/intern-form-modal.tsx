"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface InternFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  isLoading?: boolean;
}

export function InternFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: InternFormModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("Password123!");

  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPassword("Password123!");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      email,
      password: password || "Password123!",
      role: "INTERN",
      isActive: true,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Intern Account"
      description="Create a new intern user account with operational permissions."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        <Input
          label="Full Name *"
          placeholder="e.g. David Miller"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="david@evolix.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Initial Password *"
          type="password"
          placeholder="Password123!"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
          <p className="font-semibold text-slate-800">Role & Access Level:</p>
          <p className="mt-0.5">
            Role will be created as <strong>INTERN</strong>. Interns can view assigned tasks, assigned projects, and assigned clients. Financial pages and team management will be restricted.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Intern Account"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
