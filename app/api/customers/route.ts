import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/customers — tüm müşterileri getir (admin panel için)
export async function GET() {
    const { data: customers, error } = await supabaseAdmin
        .from("customers")
        .select("id, name, email, phone, address, total_orders, total_spent, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Her müşterinin sipariş bilgilerini çek
    const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("customer_email, total, status, created_at")
        .order("created_at", { ascending: false });

    // Kayıtlı adresleri çek (varsayılan adresi öncelikli)
    const customerIds = (customers || []).map(c => c.id);
    const { data: addresses } = await supabaseAdmin
        .from("customer_addresses")
        .select("customer_id, label, line1, district, city")
        .in("customer_id", customerIds)
        .order("is_default", { ascending: false });

    // Müşteri bazlı ilk (varsayılan) adres
    const addressMap = new Map<string, string>();
    for (const addr of (addresses || [])) {
        if (!addressMap.has(addr.customer_id)) {
            addressMap.set(addr.customer_id, `${addr.line1}, ${addr.district}/${addr.city}`);
        }
    }

    // E-posta bazlı sipariş istatistikleri
    const orderStats = new Map<string, { count: number; spent: number; lastDate: string }>();
    for (const o of (orders || [])) {
        const key = o.customer_email;
        const existing = orderStats.get(key);
        if (existing) {
            existing.count++;
            existing.spent += Number(o.total) || 0;
        } else {
            orderStats.set(key, {
                count: 1,
                spent: Number(o.total) || 0,
                lastDate: o.created_at,
            });
        }
    }

    const result = (customers || []).map(c => {
        const stats = orderStats.get(c.email);
        // Adres önceliği: customers.address > customer_addresses > "-"
        const displayAddress = c.address || addressMap.get(c.id) || "-";
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || "-",
            address: displayAddress,
            orderCount: stats?.count || c.total_orders || 0,
            totalSpent: stats?.spent || Number(c.total_spent) || 0,
            lastOrder: stats?.lastDate || c.created_at,
            memberSince: c.created_at,
        };
    });

    return NextResponse.json(result);
}
