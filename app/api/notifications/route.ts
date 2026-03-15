import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/notifications — Bildirimleri getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let query = supabaseAdmin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (unreadOnly) {
        query = query.eq("read", false);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ayrıca okunmamış sayısını getir
    const { count } = await supabaseAdmin
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);

    return NextResponse.json({
        notifications: data || [],
        unreadCount: count || 0,
    });
}

// PUT /api/notifications — Bildirimleri okundu işaretle
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.markAllRead) {
            // Tümünü okundu yap
            await supabaseAdmin
                .from("notifications")
                .update({ read: true })
                .eq("read", false);
        } else if (body.id) {
            // Tek bildirimi okundu yap
            await supabaseAdmin
                .from("notifications")
                .update({ read: true })
                .eq("id", body.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
