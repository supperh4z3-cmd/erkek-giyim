import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/returns — Admin: tüm iade taleplerini listele
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, approved, rejected, completed

    let query = supabaseAdmin
        .from("return_requests")
        .select("*, return_items(*)")
        .order("created_at", { ascending: false });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Müşteri ve sipariş bilgilerini ekle
    const enriched = await Promise.all(
        (data || []).map(async (r) => {
            const [customerRes, orderRes] = await Promise.all([
                r.customer_id ? supabaseAdmin.from("customers").select("name, email, phone").eq("id", r.customer_id).single() : null,
                r.order_id ? supabaseAdmin.from("orders").select("order_number, total, status").eq("id", r.order_id).single() : null,
            ]);
            return {
                ...r,
                customer: customerRes?.data || null,
                order: orderRes?.data || null,
            };
        })
    );

    return NextResponse.json(enriched);
}

// POST /api/returns — Müşteri: yeni iade talebi oluştur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, customerId, reason, items } = body;

        if (!orderId || !customerId || !reason || !items?.length) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
        }

        // Aynı sipariş için zaten iade talebi var mı kontrol et
        const { data: existing } = await supabaseAdmin
            .from("return_requests")
            .select("id")
            .eq("order_id", orderId)
            .in("status", ["pending", "approved"]);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: "Bu sipariş için zaten aktif bir iade talebi var." }, { status: 400 });
        }

        // İade tutarını hesapla
        const refundAmount = items.reduce((sum: number, item: { price: number; quantity: number }) =>
            sum + (item.price * item.quantity), 0
        );

        // İade talebi oluştur
        const { data: returnReq, error: returnErr } = await supabaseAdmin
            .from("return_requests")
            .insert({
                order_id: orderId,
                customer_id: customerId,
                reason,
                status: "pending",
                refund_amount: refundAmount,
            })
            .select()
            .single();

        if (returnErr) throw returnErr;

        // İade kalemlerini ekle
        const returnItems = items.map((item: { orderItemId?: string; productName: string; size?: string; color?: string; quantity: number; price: number; image?: string }) => ({
            return_id: returnReq.id,
            order_item_id: item.orderItemId || null,
            product_name: item.productName,
            size: item.size || "",
            color: item.color || "",
            quantity: item.quantity,
            price: item.price,
            image: item.image || "",
        }));

        await supabaseAdmin.from("return_items").insert(returnItems);

        return NextResponse.json({ success: true, returnId: returnReq.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "İade talebi oluşturulamadı";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

// PATCH /api/returns — Admin: iade durumunu güncelle
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { returnId, status, adminNote } = body;

        if (!returnId || !status) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
        }

        // İade talebini ve kalemlerini getir
        const { data: returnReq } = await supabaseAdmin
            .from("return_requests")
            .select("*, return_items(*)")
            .eq("id", returnId)
            .single();

        if (!returnReq) {
            return NextResponse.json({ error: "İade talebi bulunamadı" }, { status: 404 });
        }

        // Durumu güncelle
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString(),
        };
        if (adminNote !== undefined) updateData.admin_note = adminNote;

        await supabaseAdmin
            .from("return_requests")
            .update(updateData)
            .eq("id", returnId);

        // Eğer onaylandıysa → stok geri ekle
        if (status === "approved" && returnReq.return_items) {
            for (const item of returnReq.return_items) {
                if (item.size && item.order_item_id) {
                    // order_items'dan product_id'yi al
                    const { data: orderItem } = await supabaseAdmin
                        .from("order_items")
                        .select("product_id")
                        .eq("id", item.order_item_id)
                        .single();

                    if (orderItem?.product_id) {
                        // Mevcut stoğu oku
                        const { data: sizeRow } = await supabaseAdmin
                            .from("product_sizes")
                            .select("stock")
                            .eq("product_id", orderItem.product_id)
                            .eq("size", item.size)
                            .single();

                        if (sizeRow) {
                            // Stoğu artır
                            await supabaseAdmin
                                .from("product_sizes")
                                .update({ stock: (sizeRow.stock || 0) + item.quantity })
                                .eq("product_id", orderItem.product_id)
                                .eq("size", item.size);
                        }
                    }
                }
            }
        }

        // Eğer tamamlandıysa → sipariş durumunu güncelle
        if (status === "completed") {
            await supabaseAdmin
                .from("orders")
                .update({ status: "returned", updated_at: new Date().toISOString() })
                .eq("id", returnReq.order_id);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "İade güncellenemedi";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
