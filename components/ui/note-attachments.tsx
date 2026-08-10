"use client";

import * as React from "react";
import {
  Paperclip,
  Upload,
  Trash2,
  FileText,
  ImageIcon,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteAttachmentItem } from "@/types/attachment";
import {
  formatFileSize,
  isImageFile,
  isPdfFile,
  ALLOWED_EXTENSIONS,
} from "@/lib/attachment-utils";

export interface NoteAttachmentsProps {
  entityType: string;
  entityId: string;
  /** Optional: compact mode hides header and reduces spacing */
  compact?: boolean;
}

/**
 * Self-contained attachment panel. Fetches, adds, and deletes attachments
 * for any entity type. Drop this into any detail/modal view.
 */
export function NoteAttachments({
  entityType,
  entityId,
  compact = false,
}: NoteAttachmentsProps) {
  const [attachments, setAttachments] = React.useState<NoteAttachmentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");
  const [fileType, setFileType] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch attachments on mount / entityId change
  const fetchAttachments = React.useCallback(async () => {
    if (!entityId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        entityType,
        entityId,
      });
      const res = await fetch(`/api/attachments/by-entity?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setAttachments(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch attachments:", e);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  React.useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          fileName: fileName.trim(),
          fileUrl: fileUrl.trim(),
          fileType: fileType.trim() || null,
          fileSize: null,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to add attachment.");
        return;
      }

      // Append new attachment and reset form
      setAttachments((prev) => [json.data, ...prev]);
      setFileName("");
      setFileUrl("");
      setFileType("");
      setShowForm(false);
    } catch (e) {
      setError("Network error adding attachment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch (e) {
      console.error("Failed to delete attachment:", e);
    }
  };

  const getFileIcon = (att: NoteAttachmentItem) => {
    if (isImageFile(att.fileName)) {
      return <ImageIcon className="h-3.5 w-3.5 text-violet-500" />;
    }
    if (isPdfFile(att.fileName)) {
      return <FileText className="h-3.5 w-3.5 text-rose-500" />;
    }
    return <Paperclip className="h-3.5 w-3.5 text-slate-400" />;
  };

  return (
    <div className={`space-y-3 ${compact ? "" : "border-t border-slate-100 pt-4"}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="h-4 w-4 text-teal-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attachments {!isLoading && `(${attachments.length})`}
          </h4>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="text-xs"
        >
          {showForm ? (
            <>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 mr-1" />
              Attach File
            </>
          )}
        </Button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100"
        >
          <Input
            label="File Name"
            placeholder="e.g. Brand_Guidelines_v2.pdf"
            value={fileName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)}
            required
            className="bg-white text-xs h-8"
          />
          <Input
            label="File URL / Cloud Link"
            placeholder="https://drive.google.com/file/d/..."
            value={fileUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileUrl(e.target.value)}
            required
            className="bg-white text-xs h-8"
          />
          <Input
            label="MIME Type (optional)"
            placeholder="e.g. image/png, application/pdf"
            value={fileType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileType(e.target.value)}
            className="bg-white text-xs h-8"
          />

          <p className="text-[10px] text-slate-400">
            Supported: {ALLOWED_EXTENSIONS.join(", ")} — Max 10 MB
          </p>

          {error && (
            <p className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Add Attachment"}
            </Button>
          </div>
        </form>
      )}

      {/* Attachments List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-slate-400 italic py-2">Loading attachments...</p>
        ) : attachments.length > 0 ? (
          attachments.map((att) => (
            <div
              key={att.id}
              className="group flex items-center justify-between rounded-lg border border-slate-100 p-2.5 bg-white text-xs hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                {/* File Icon */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                  {getFileIcon(att)}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-teal-600 hover:underline truncate"
                    >
                      {att.fileName}
                    </a>
                    <ExternalLink className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                    {att.fileSize && <span>{formatFileSize(att.fileSize)}</span>}
                    <span>by {att.uploadedBy.name}</span>
                    <span>
                      {new Date(att.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview + Delete */}
              <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isImageFile(att.fileName) && (
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-violet-500 hover:text-violet-700 font-medium px-1.5 py-0.5 rounded bg-violet-50 border border-violet-100"
                  >
                    Preview
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(att.id)}
                  className="h-6 w-6 text-slate-400 hover:text-rose-600"
                  title="Delete attachment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic py-2">
            No attachments uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
