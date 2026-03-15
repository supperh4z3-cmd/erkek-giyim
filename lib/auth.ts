import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || "chase-chain-admin-secret-key-2026"
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * Admin şifresini doğrula
 */
export function verifyPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}

/**
 * JWT token oluştur (24 saat geçerli)
 */
export async function signToken(): Promise<string> {
    return new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET);
}

/**
 * JWT token doğrula
 */
export async function verifyToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

/**
 * Request'ten token çıkar ve doğrula
 */
export async function getTokenFromRequest(req: NextRequest): Promise<boolean> {
    // Cookie'den oku
    const cookieToken = req.cookies.get("admin_token")?.value;
    if (cookieToken) {
        return verifyToken(cookieToken);
    }

    // Authorization header'dan oku
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return verifyToken(authHeader.slice(7));
    }

    return false;
}

/**
 * API route middleware — admin doğrulaması
 * Kullanım: const authError = await withAuth(req); if (authError) return authError;
 */
export async function withAuth(req: NextRequest): Promise<NextResponse | null> {
    const isAuthenticated = await getTokenFromRequest(req);
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    return null;
}
