import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/coupons/validate — Kupon kodunu doğrula
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const code = (body.code || "").toUpperCase().trim();
        const cartTotal = Number(body.cartTotal) || 0;

        if (!code) {
            return NextResponse.json({ valid: false, error: "Kupon kodu giriniz" }, { status: 400 });
        }

        // Kuponu bul
        const { data: coupon, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("code", code)
            .single();

        if (error || !coupon) {
            return NextResponse.json({ valid: false, error: "Geçersiz kupon kodu" });
        }

        // Aktiflik kontrolü
        if (!coupon.is_active) {
            return NextResponse.json({ valid: false, error: "Bu kupon artık geçerli değil" });
        }

        // Süre dolmuş mu kontrolü
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return NextResponse.json({ valid: false, error: "Bu kuponun süresi dolmuş" });
        }

        // Kullanım limiti kontrolü
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return NextResponse.json({ valid: false, error: "Bu kupon kullanım limitine ulaşmış" });
        }

        // Minimum sipariş tutarı kontrolü
        if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
            return NextResponse.json({
                valid: false,
                error: `Bu kupon minimum ₺${Number(coupon.min_order_amount).toLocaleString("tr-TR")} sipariş tutarı gerektiriyor`
            });
        }

        // İndirim hesapla
        let discountAmount = 0;
        if (coupon.discount_type === "percentage") {
            discountAmount = Math.round(cartTotal * (coupon.discount_value / 100) * 100) / 100;
        } else {
            discountAmount = Math.min(Number(coupon.discount_value), cartTotal);
        }

        return NextResponse.json({
            valid: true,
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discount_type,
            discountValue: Number(coupon.discount_value),
            discountAmount,
            discountFormatted: `₺${discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ valid: false, error: error.message || "Doğrulama hatası" }, { status: 500 });
    }
}
