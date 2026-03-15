import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/coupons — Tüm kuponları listele
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

// POST /api/coupons — Yeni kupon oluştur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Kupon kodunu büyük harfe çevir ve boşlukları temizle
        const code = (body.code || "").toUpperCase().trim().replace(/\s+/g, "");

        if (!code) {
            return NextResponse.json({ error: "Kupon kodu zorunludur" }, { status: 400 });
        }

        if (!body.discountType || !["percentage", "fixed"].includes(body.discountType)) {
            return NextResponse.json({ error: "İndirim tipi 'percentage' veya 'fixed' olmalıdır" }, { status: 400 });
        }

        if (!body.discountValue || Number(body.discountValue) <= 0) {
            return NextResponse.json({ error: "İndirim değeri 0'dan büyük olmalıdır" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("coupons")
            .insert({
                code,
                discount_type: body.discountType,
                discount_value: Number(body.discountValue),
                min_order_amount: Number(body.minOrderAmount) || 0,
                max_uses: body.maxUses ? Number(body.maxUses) : null,
                expiry_date: body.expiryDate || null,
                is_active: body.isActive !== false,
            })
            .select()
            .single();

        if (error) {
            if (error.message.includes("duplicate") || error.message.includes("unique")) {
                return NextResponse.json({ error: "Bu kupon kodu zaten mevcut" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Kupon oluşturulamadı" }, { status: 400 });
    }
}
