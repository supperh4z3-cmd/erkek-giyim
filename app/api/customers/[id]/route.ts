import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/customers/[id] — Tek müşteri detayı (siparişleri, adresleri ile)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Müşteri bilgisi
    const { data: customer, error } = await supabaseAdmin
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !customer) {
        return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
    }

    // Adresleri
    const { data: addresses } = await supabaseAdmin
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", id)
        .order("is_default", { ascending: false });

    // Siparişleri (email ile)
    const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("order_number, total, status, created_at, order_items(name, quantity, price, size, color, image)")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false });

    // Favorileri
    const { data: favorites } = await supabaseAdmin
        .from("customer_favorites")
        .select("product_id, products(name, slug, price)")
        .eq("customer_id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedOrders = (orders || []).map((o: any) => ({
        id: o.order_number,
        total: Number(o.total),
        status: o.status,
        date: o.created_at,
        itemCount: o.order_items?.length || 0,
    }));

    const totalSpent = formattedOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);

    return NextResponse.json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        memberSince: customer.created_at,
        orderCount: formattedOrders.length,
        totalSpent,
        addresses: (addresses || []).map((a: { id: string; label: string; full_name: string; line1: string; district: string; city: string; postal_code: string; is_default: boolean }) => ({
            id: a.id,
            label: a.label,
            fullName: a.full_name,
            line1: a.line1,
            district: a.district,
            city: a.city,
            postalCode: a.postal_code,
            isDefault: a.is_default,
        })),
        orders: formattedOrders,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        favorites: (favorites || []).map((f: any) => ({
            productId: f.product_id,
            name: f.products?.name || "",
            slug: f.products?.slug || "",
            price: Number(f.products?.price) || 0,
        })),
    });
}

// DELETE /api/customers/[id] — Müşteriyi sil (cascade)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Müşteriyi kontrol et
        const { data: customer, error: findError } = await supabaseAdmin
            .from("customers")
            .select("id, email")
            .eq("id", id)
            .single();

        if (findError || !customer) {
            return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
        }

        // Cascade: ilişkili verileri sil
        await supabaseAdmin.from("customer_addresses").delete().eq("customer_id", id);
        await supabaseAdmin.from("customer_favorites").delete().eq("customer_id", id);
        await supabaseAdmin.from("customer_notes").delete().eq("customer_id", id);

        // Ana müşteri kaydını sil
        const { error: deleteError } = await supabaseAdmin
            .from("customers")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Müşteri silindi" });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
