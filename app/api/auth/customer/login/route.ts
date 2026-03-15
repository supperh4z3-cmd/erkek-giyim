import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "chase-chain-customer-secret-key-2026");

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
        }

        // Müşteriyi bul
        const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("*")
            .eq("email", email)
            .single();

        if (!customer || !customer.password_hash) {
            return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
        }

        // Şifre doğrula
        const valid = await bcrypt.compare(password, customer.password_hash);
        if (!valid) {
            return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
        }

        // JWT token
        const token = await new SignJWT({ customerId: customer.id, email: customer.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("30d")
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
        });

        response.cookies.set("customer_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
