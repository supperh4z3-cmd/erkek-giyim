import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendShippingNotification } from "@/lib/email";

interface OrderItemRow {
    product_id: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
}

interface OrderRow {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    address?: string;
    created_at: string;
    status: string;
    payment_status: string;
    total: number;
    tracking_number?: string;
    carrier?: string;
    note?: string;
    order_items?: OrderItemRow[];
}

function formatOrder(o: OrderRow) {
    return {
        id: o.order_number,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone || "",
        address: o.address || "",
        date: o.created_at,
        status: o.status,
        paymentStatus: o.payment_status,
        total: Number(o.total),
        trackingNumber: o.tracking_number || "",
        carrier: o.carrier || "",
        note: o.note || "",
        items: (o.order_items || []).map((item: OrderItemRow) => ({
            productId: item.product_id,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: Number(item.price),
            image: item.image,
        })),
        _dbId: o.id,
    };
}

// GET /api/orders/[id] — Tek sipariş detayı
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("order_number", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(formatOrder(data as OrderRow));
}

// PUT /api/orders/[id] — Sipariş güncelle (durum, kargo takip no vb.)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // order_number ile bul
        const { data: existing } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("order_number", id)
            .single();

        if (!existing) {
            return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
        }

        const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
        if (body.status !== undefined) updateData.status = body.status;
        if (body.paymentStatus !== undefined) updateData.payment_status = body.paymentStatus;
        if (body.trackingNumber !== undefined) updateData.tracking_number = body.trackingNumber;
        if (body.carrier !== undefined) updateData.carrier = body.carrier;
        if (body.address !== undefined) updateData.address = body.address;

        await supabaseAdmin
            .from("orders")
            .update(updateData)
            .eq("id", existing.id);

        // Güncel siparişi dön
        const { data: updated } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", existing.id)
            .single();

        // Kargo takip numarası eklendiyse bildirim gönder
        if (body.trackingNumber && updated?.customer_email) {
            sendShippingNotification({
                orderId: id,
                customerName: updated.customer_name || "",
                customerEmail: updated.customer_email,
                trackingNumber: body.trackingNumber,
                carrier: body.carrier || updated.carrier || "",
            }).catch(() => {});
        }

        // Sipariş "delivered" yapıldığında stok düş
        if (body.status === "delivered" && updated?.order_items?.length) {
            for (const item of updated.order_items) {
                if (item.product_id && item.size && item.quantity) {
                    const { data: sizeRow } = await supabaseAdmin
                        .from("product_sizes")
                        .select("id, stock")
                        .eq("product_id", item.product_id)
                        .eq("size", item.size)
                        .single();

                    if (sizeRow) {
                        const newStock = Math.max(0, (sizeRow.stock || 0) - item.quantity);
                        await supabaseAdmin
                            .from("product_sizes")
                            .update({ stock: newStock })
                            .eq("id", sizeRow.id);

                        await supabaseAdmin
                            .from("stock_history")
                            .insert({
                                product_id: item.product_id,
                                change_amount: -item.quantity,
                                reason: `Sipariş teslim edildi: ${id}`,
                                new_stock: newStock,
                            });
                    }
                }
            }
        }

        return NextResponse.json(formatOrder(updated as OrderRow));
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Güncelleme başarısız";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
