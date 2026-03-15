import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });
        }

        if (!verifyPassword(password)) {
            return NextResponse.json({ error: "Yanlış şifre" }, { status: 401 });
        }

        const token = await signToken();

        const response = NextResponse.json({ success: true });

        // Token'ı httpOnly cookie olarak set et
        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 saat
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
