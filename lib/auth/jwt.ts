import { SignJWT, jwtVerify } from "jose";

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET || "evolix-os-super-secret-development-key-32-chars";
  if (process.env.NODE_ENV === "production" && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
    throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be set to a secret of at least 32 characters in production.");
  }
  return new TextEncoder().encode(secret);
};

export interface SessionPayload {
  userId: string;
  email: string;
  role: "CO_FOUNDER" | "INTERN";
  name: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}
