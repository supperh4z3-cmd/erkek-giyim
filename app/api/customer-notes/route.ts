import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/customer-notes?customer_id=xxx — Müşteri notlarını getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");

    if (!customerId) {
        return NextResponse.json({ error: "customer_id zorunludur" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        // Tablo yoksa boş dizi döndür
        return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
}

// POST /api/customer-notes — Yeni not ekle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customer_id, note, author } = body;

        if (!customer_id || !note) {
            return NextResponse.json({ error: "customer_id ve note zorunludur" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("customer_notes")
            .insert({
                customer_id,
                note,
                author: author || "Admin",
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

// DELETE /api/customer-notes?id=xxx — Not sil
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
        return NextResponse.json({ error: "id zorunludur" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("customer_notes")
        .delete()
        .eq("id", noteId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
