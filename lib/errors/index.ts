import { NextResponse } from "next/server";

export type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 500;

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: HttpStatusCode = 500,
    code: ErrorCode = "INTERNAL_SERVER_ERROR",
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action."): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Requested resource not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message = "Resource state conflict"): AppError {
    return new AppError(message, 409, "CONFLICT");
  }

  static unprocessableEntity(message = "Invalid input data", fields?: Record<string, string[]>): AppError {
    return new AppError(message, 422, "VALIDATION_ERROR", fields);
  }

  static internal(message = "An unexpected error occurred"): AppError {
    return new AppError(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Catch database / Prisma or unknown unexpected errors
  // Do NOT expose raw database queries, stack traces, or internal error objects to users
  console.error("Unhandled Server Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An internal error occurred. Please try again later.",
      },
    },
    { status: 500 }
  );
}
