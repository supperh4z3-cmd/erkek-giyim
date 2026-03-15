import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { sendWelcomeEmail } from "@/lib/email";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "chase-chain-customer-secret-key-2026");

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Ad, e-posta ve şifre zorunludur" }, { status: 400 });
        }

        // E-posta kontrolü
        const { data: existing } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 409 });
        }

        // Şifre hash
        const passwordHash = await bcrypt.hash(password, 12);

        // Müşteriyi oluştur
        const { data: customer, error } = await supabaseAdmin
            .from("customers")
            .insert({
                name,
                email,
                phone: phone || "",
                password_hash: passwordHash,
                total_orders: 0,
                total_spent: 0,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
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

        // Hoş geldiniz e-postası gönder
        sendWelcomeEmail({
            customerName: customer.name,
            customerEmail: customer.email,
        }).catch((err) => console.error("Welcome email error:", err));

        response.cookies.set("customer_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 gün
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
