import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BRAND_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://erkek-giyim.vercel.app";

// GET /api/unsubscribe?token=xxx — Abonelikten çık
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(`${BRAND_URL}/unsubscribe?status=error`);
    }

    try {
        // Token ile kontrolü yap
        const { data: existing } = await supabaseAdmin
            .from("email_unsubscribes")
            .select("id")
            .eq("token", token)
            .single();

        if (existing) {
            // Zaten unsubscribe olmuş
            return NextResponse.redirect(`${BRAND_URL}/unsubscribe?status=already`);
        }

        // Token'dan e-posta çöz (token = base64(email))
        const email = Buffer.from(token, "base64").toString("utf-8");

        if (!email || !email.includes("@")) {
            return NextResponse.redirect(`${BRAND_URL}/unsubscribe?status=error`);
        }

        await supabaseAdmin
            .from("email_unsubscribes")
            .upsert({ email, token, unsubscribed_at: new Date().toISOString() }, { onConflict: "email" });

        return NextResponse.redirect(`${BRAND_URL}/unsubscribe?status=success&email=${encodeURIComponent(email)}`);
    } catch {
        return NextResponse.redirect(`${BRAND_URL}/unsubscribe?status=error`);
    }
}

// POST /api/unsubscribe — Yeniden abone ol
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
        }

        await supabaseAdmin
            .from("email_unsubscribes")
            .delete()
            .eq("email", email);

        return NextResponse.json({ success: true, message: "Yeniden abone oldunuz." });
    } catch {
        return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
    }
}
