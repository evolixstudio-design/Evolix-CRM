import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { handleApiError, AppError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid input format",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid email or password.");
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signSessionToken(sessionPayload);

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Record USER_LOGIN audit log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        entityType: "USER",
        entityId: user.id,
        metadata: { ip: req.headers.get("x-forwarded-for") || "local", userAgent: req.headers.get("user-agent") },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
