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

// GET /api/customer/addresses
export async function GET(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { data } = await supabaseAdmin
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    return NextResponse.json(data || []);
}

// POST /api/customer/addresses
export async function POST(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const body = await req.json();

    // Eğer varsayılan yapılıyorsa, diğerlerini kaldır
    if (body.is_default) {
        await supabaseAdmin
            .from("customer_addresses")
            .update({ is_default: false })
            .eq("customer_id", customerId);
    }

    const { data, error } = await supabaseAdmin
        .from("customer_addresses")
        .insert({
            customer_id: customerId,
            label: body.label || "Adresim",
            full_name: body.full_name,
            line1: body.line1,
            city: body.city,
            district: body.district,
            postal_code: body.postal_code || "",
            is_default: body.is_default || false,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// PUT /api/customer/addresses
export async function PUT(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (updates.is_default) {
        await supabaseAdmin
            .from("customer_addresses")
            .update({ is_default: false })
            .eq("customer_id", customerId);
    }

    const { error } = await supabaseAdmin
        .from("customer_addresses")
        .update(updates)
        .eq("id", id)
        .eq("customer_id", customerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// DELETE /api/customer/addresses
export async function DELETE(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("customer_addresses")
        .delete()
        .eq("id", id)
        .eq("customer_id", customerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
