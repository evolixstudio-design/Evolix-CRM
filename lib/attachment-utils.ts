/**
 * Attachment validation, sanitization, and display utilities.
 * Shared across all entity attachment features.
 */

// ─── Allowed File Types ─────────────────────────────────────────────────────

export const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".pdf",
] as const;

export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

/** Dangerous extensions that must always be rejected */
const BLOCKED_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1",
  ".sh", ".bash", ".csh", ".ksh", ".dll", ".sys", ".drv",
  ".inf", ".reg", ".lnk", ".hta", ".cpl", ".msc",
];

/** 10 MB — matches existing TaskAttachment limit */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// ─── Validation ─────────────────────────────────────────────────────────────

export interface AttachmentValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file's metadata before storing the attachment record.
 * Checks extension, optional MIME type, file size, and blocks executables.
 */
export function validateAttachmentFile(
  fileName: string,
  fileType?: string | null,
  fileSize?: number | null,
): AttachmentValidationResult {
  // 1. Extract and validate extension
  const ext = getFileExtension(fileName);
  if (!ext) {
    return { valid: false, error: "File name must have an extension." };
  }

  // 2. Block executables
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Executable file type "${ext}" is not allowed.` };
  }

  // 3. Check allowed extensions
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return {
      valid: false,
      error: `File type "${ext}" is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // 4. Validate MIME type if provided
  if (fileType) {
    const normalizedMime = fileType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(normalizedMime as any)) {
      return {
        valid: false,
        error: `MIME type "${fileType}" is not supported. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      };
    }

    // Cross-check MIME vs extension consistency
    if (!isMimeExtensionConsistent(ext, normalizedMime)) {
      return {
        valid: false,
        error: `MIME type "${fileType}" does not match file extension "${ext}".`,
      };
    }
  }

  // 5. Validate file size
  if (fileSize !== undefined && fileSize !== null) {
    if (fileSize <= 0) {
      return { valid: false, error: "File size must be greater than 0." };
    }
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size (${formatFileSize(fileSize)}) exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`,
      };
    }
  }

  return { valid: true };
}

// ─── Sanitization ───────────────────────────────────────────────────────────

/**
 * Sanitize a file name to prevent directory traversal, injection, and encoding issues.
 * Returns a safe filename preserving the original extension.
 */
export function sanitizeFileName(fileName: string): string {
  // Strip directory path components
  let name = fileName.replace(/^.*[\\/]/, "");

  // Remove null bytes
  name = name.replace(/\0/g, "");

  // Replace dangerous characters with underscores
  name = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

  // Collapse multiple consecutive underscores/spaces
  name = name.replace(/[_\s]+/g, "_");

  // Trim leading/trailing dots and underscores
  name = name.replace(/^[._]+|[._]+$/g, "");

  // Ensure the name isn't empty after sanitization
  if (!name || name.length === 0) {
    name = "attachment";
  }

  // Truncate very long names (keep extension)
  const ext = getFileExtension(name);
  const baseName = ext ? name.slice(0, -(ext.length)) : name;
  const truncatedBase = baseName.length > 200 ? baseName.slice(0, 200) : baseName;

  return ext ? `${truncatedBase}${ext}` : truncatedBase;
}

// ─── Display Helpers ────────────────────────────────────────────────────────

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes <= 0) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Check if a file is a previewable image type.
 */
export function isImageFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return [".png", ".jpg", ".jpeg", ".webp"].includes(ext || "");
}

/**
 * Check if a file is a PDF.
 */
export function isPdfFile(fileName: string): boolean {
  return getFileExtension(fileName) === ".pdf";
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function getFileExtension(fileName: string): string | null {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === fileName.length - 1) return null;
  return fileName.slice(lastDot).toLowerCase();
}

function isMimeExtensionConsistent(ext: string, mime: string): boolean {
  const mimeToExt: Record<string, string[]> = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
  };

  const allowedExts = mimeToExt[mime];
  if (!allowedExts) return false;
  return allowedExts.includes(ext);
}
