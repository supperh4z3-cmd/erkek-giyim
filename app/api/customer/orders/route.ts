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

// GET /api/customer/orders
export async function GET(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    // Müşterinin e-postasını çek
    const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("email")
        .eq("id", customerId)
        .single();

    if (!customer) return NextResponse.json([]);

    // Siparişlerini çek
    const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false });

    if (!orders || orders.length === 0) return NextResponse.json([]);

    // Order items'ları çek
    const orderIds = orders.map(o => o.id);
    const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

    const itemsMap = new Map<string, typeof items>();
    for (const item of (items || [])) {
        const list = itemsMap.get(item.order_id) || [];
        list.push(item);
        itemsMap.set(item.order_id, list);
    }

    // İade taleplerini de çek
    const { data: returns } = await supabaseAdmin
        .from("return_requests")
        .select("order_id, status")
        .eq("customer_id", customerId);

    const returnsMap = new Map<string, string>();
    for (const r of (returns || [])) {
        returnsMap.set(r.order_id, r.status);
    }

    const result = orders.map(o => ({
        id: o.order_number,
        orderId: o.id,
        date: o.created_at,
        status: o.status,
        paymentStatus: o.payment_status,
        total: o.total,
        trackingNumber: o.tracking_number || "",
        carrier: o.carrier || "",
        address: o.address || "",
        returnStatus: returnsMap.get(o.id) || null,
        items: (itemsMap.get(o.id) || []).map((i: Record<string, string | number>) => ({
            id: i.id,
            productId: i.product_id,
            name: i.name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
        })),
    }));

    return NextResponse.json(result);
}
