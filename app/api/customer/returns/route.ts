import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/customer/returns?customerId=xxx — Müşterinin kendi iade taleplerini getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
        return NextResponse.json({ error: "customerId gerekli" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("return_requests")
        .select("*, return_items(*)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Sipariş bilgilerini ekle
    const enriched = await Promise.all(
        (data || []).map(async (r) => {
            const { data: order } = await supabaseAdmin
                .from("orders")
                .select("order_number, total")
                .eq("id", r.order_id)
                .single();
            return { ...r, order };
        })
    );

    return NextResponse.json(enriched);
}
