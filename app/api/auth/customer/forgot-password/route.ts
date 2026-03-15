import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const RESET_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "chase-chain-reset-secret-2026");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://erkek-giyim.vercel.app";

// POST /api/auth/customer/forgot-password — Şifre sıfırlama e-postası gönder
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "E-posta adresi zorunludur" }, { status: 400 });
        }

        // Müşteriyi bul
        const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("id, name, email")
            .eq("email", email.trim().toLowerCase())
            .single();

        // Güvenlik: müşteri bulunamasa bile aynı yanıtı ver
        if (!customer) {
            return NextResponse.json({ success: true, message: "Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi." });
        }

        // 1 saat geçerli reset token oluştur
        const resetToken = await new SignJWT({ customerId: customer.id, email: customer.email, purpose: "password_reset" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(RESET_SECRET);

        const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`;

        // E-posta gönder
        const { sendPasswordResetEmail } = await import("@/lib/email");
        await sendPasswordResetEmail({
            customerName: customer.name,
            customerEmail: customer.email,
            resetUrl,
        });

        return NextResponse.json({ success: true, message: "Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi." });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// PUT /api/auth/customer/forgot-password — Yeni şifreyi ayarla
export async function PUT(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token ve yeni şifre zorunludur" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır" }, { status: 400 });
        }

        // Token doğrula
        let payload;
        try {
            const result = await jwtVerify(token, RESET_SECRET);
            payload = result.payload;
        } catch {
            return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar deneyin." }, { status: 400 });
        }

        if (payload.purpose !== "password_reset" || !payload.customerId) {
            return NextResponse.json({ error: "Geçersiz token" }, { status: 400 });
        }

        // Şifreyi hashle ve güncelle
        const passwordHash = await bcrypt.hash(newPassword, 12);

        const { error } = await supabaseAdmin
            .from("customers")
            .update({ password_hash: passwordHash })
            .eq("id", payload.customerId);

        if (error) {
            return NextResponse.json({ error: "Şifre güncellenemedi" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Şifreniz başarıyla güncellendi!" });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
