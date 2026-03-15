import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/audit-log — Etkinlik loglarını getir
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const entityType = searchParams.get("entityType");
    const action = searchParams.get("action");

    let query = supabaseAdmin
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (entityType) {
        query = query.eq("entity_type", entityType);
    }
    if (action) {
        query = query.eq("action", action);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}
