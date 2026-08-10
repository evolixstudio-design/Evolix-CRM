"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TeamMemberItem } from "@/types/team";

export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberItem | null;
  onSuccess: () => void;
}

export function UserEditModal({
  isOpen,
  onClose,
  member,
  onSuccess,
}: UserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [role, setRole] = React.useState<"CO_FOUNDER" | "INTERN">("INTERN");

  React.useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone || "");
      setDepartment(member.department || "");
      setIsActive(member.isActive);
      setRole(member.role);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          department: department || null,
          isActive,
          role,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update user profile.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Edit User Information</h3>
          <p className="text-xs text-slate-500">
            Update allowed profile fields for {member.name} ({member.email})
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <PhoneInput
            label="Phone Number"
            placeholder="98765 43210"
            value={phone}
            onChange={(val) => setPhone(val)}
          />

          <Input
            label="Department / Responsibilities"
            placeholder="e.g. Software, Website or Digital Marketing"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Account Role"
              value={role}
              onChange={(e) => setRole(e.target.value as "CO_FOUNDER" | "INTERN")}
              options={[
                { label: "CO-FOUNDER", value: "CO_FOUNDER" },
                { label: "INTERN", value: "INTERN" },
              ]}
            />

            <Select
              label="Account Status"
              value={isActive ? "ACTIVE" : "INACTIVE"}
              onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
