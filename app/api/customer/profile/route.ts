import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "chase-chain-customer-secret-key-2026");

async function getCustomerId(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get("customer_token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.customerId as string;
    } catch {
        return null;
    }
}

// GET /api/customer/profile
export async function GET(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { data } = await supabaseAdmin
        .from("customers")
        .select("id, name, email, phone, total_orders, total_spent, created_at")
        .eq("id", customerId)
        .single();

    if (!data) return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
    return NextResponse.json(data);
}

// PUT /api/customer/profile
export async function PUT(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const body = await req.json();
    const { name, phone } = body;

    const { error } = await supabaseAdmin
        .from("customers")
        .update({ name, phone })
        .eq("id", customerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
