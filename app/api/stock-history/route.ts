import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/stock-history — Stok geçmişi getir (product_id zorunlu)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!productId) {
        return NextResponse.json({ error: "product_id zorunludur" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("stock_history")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

// POST /api/stock-history — Manuel stok değişikliği kaydet
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { product_id, variant, change, reason } = body;

        if (!product_id || change === undefined) {
            return NextResponse.json({ error: "product_id ve change zorunludur" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("stock_history")
            .insert({
                product_id,
                variant: variant || null,
                change: Number(change),
                reason: reason || "Manuel düzenleme",
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
