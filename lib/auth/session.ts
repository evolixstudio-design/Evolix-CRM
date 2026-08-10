import { cookies } from "next/headers";
import { AuthUser } from "@/types";
import { verifySessionToken } from "./jwt";
import { prisma } from "@/lib/db/prisma";

export const SESSION_COOKIE_NAME = "evolix_session";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const payload = await verifySessionToken(sessionToken);
    if (!payload || !payload.userId) {
      return null;
    }

    // Fetch user from DB to ensure status isActive and latest role
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      isActive: dbUser.isActive,
    };
  } catch (error) {
    console.error("Error reading current user session:", error);
    return null;
  }
}
