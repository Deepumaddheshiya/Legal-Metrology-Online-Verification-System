import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET: string = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "lmovs-secure-mock-jwt-secret-for-frontend-prototype-2026";
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  stateId?: string;
  stateCode?: string;
  district?: string;
  businessId?: string;
  iat?: number;
  exp?: number;
  type?: "access" | "refresh";
}

// Base64URL encoding/decoding
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

// Sign JWT Token
export function signJWT(payload: JWTPayload, expiresInSeconds: number): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT Token
export function verifyJWT(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(dataToVerify)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return { valid: false, error: "Invalid signature" };
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || "Failed to parse token" };
  }
}

// Password Hashing with Salt (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Verify Password Hash
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  // Timing-safe comparison to prevent timing side-channel attacks
  if (hash.length !== originalHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

// Cookie Helper for Next.js Route Handlers & Server Components
export const AUTH_COOKIES = {
  ACCESS_TOKEN: "lmovs_access_token",
  REFRESH_TOKEN: "lmovs_refresh_token",
};

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: AUTH_COOKIES.ACCESS_TOKEN,
    value: tokens.accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
  });

  res.cookies.set({
    name: AUTH_COOKIES.REFRESH_TOKEN,
    value: tokens.refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
}

export function clearAuthCookies(res: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: AUTH_COOKIES.ACCESS_TOKEN,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set({
    name: AUTH_COOKIES.REFRESH_TOKEN,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Helper to get session from Request or Next.js Cookies
export function getSessionFromRequest(req: NextRequest): JWTPayload | null {
  const accessToken = req.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  const result = verifyJWT(accessToken);
  if (!result.valid || !result.payload) return null;

  return result.payload;
}

export async function getServerSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  const result = verifyJWT(accessToken);
  if (!result.valid || !result.payload) return null;

  return result.payload;
}
