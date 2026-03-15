import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

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
    note?: string;
    order_items?: OrderItemRow[];
}

interface OrderBody {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    address?: string;
    total: number;
    paymentStatus?: string;
    note?: string;
    items?: { productId: string; name: string; size?: string; color?: string; quantity: number; price: number; image?: string }[];
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

// GET /api/orders — Tüm siparişleri listele
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }
    if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map((o) => formatOrder(o as OrderRow)));
}

// POST /api/orders — Yeni sipariş oluştur
export async function POST(request: NextRequest) {
    try {
        const body: OrderBody = await request.json();

        // Sipariş numarası oluştur
        const { data: lastOrder } = await supabaseAdmin
            .from("orders")
            .select("order_number")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        let nextNum = 1;
        if (lastOrder?.order_number) {
            const num = parseInt(lastOrder.order_number.replace("ord-", ""), 10);
            if (!isNaN(num)) nextNum = num + 1;
        }
        const orderNumber = `ord-${String(nextNum).padStart(3, "0")}`;

        // Müşteriyi bul veya oluştur
        let customerId: string | null = null;
        if (body.customerEmail) {
            const { data: existing } = await supabaseAdmin
                .from("customers")
                .select("id")
                .eq("email", body.customerEmail)
                .single();

            if (existing) {
                customerId = existing.id;
                const { data: custData } = await supabaseAdmin
                    .from("customers")
                    .select("total_orders, total_spent")
                    .eq("id", existing.id)
                    .single();
                if (custData) {
                    await supabaseAdmin
                        .from("customers")
                        .update({
                            total_orders: (custData.total_orders || 0) + 1,
                            total_spent: Number(custData.total_spent || 0) + Number(body.total),
                            address: body.address || undefined,
                            phone: body.customerPhone || undefined,
                            name: body.customerName || undefined,
                        })
                        .eq("id", existing.id);
                }
            } else {
                const { data: newCust } = await supabaseAdmin
                    .from("customers")
                    .insert({
                        name: body.customerName,
                        email: body.customerEmail,
                        phone: body.customerPhone || "",
                        address: body.address || "",
                        total_orders: 1,
                        total_spent: body.total,
                    })
                    .select()
                    .single();
                customerId = newCust?.id || null;

                createNotification({
                    type: "new_customer",
                    title: "Yeni Müşteri Kaydı",
                    message: `${body.customerName} (${body.customerEmail}) siteye üye oldu.`,
                    link: "/admin/customers",
                }).catch(() => {});
            }
        }

        // Siparişi oluştur
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .insert({
                order_number: orderNumber,
                customer_id: customerId,
                customer_name: body.customerName,
                customer_email: body.customerEmail,
                customer_phone: body.customerPhone || "",
                address: body.address || "",
                status: "pending",
                payment_status: body.paymentStatus || "unpaid",
                total: body.total,
                tracking_number: "",
                note: body.note || "",
            })
            .select()
            .single();

        if (error) throw error;

        createNotification({
            type: "new_order",
            title: "Yeni Sipariş Geldi!",
            message: `${body.customerName} - ${orderNumber} — ₺${Number(body.total).toLocaleString("tr-TR")}`,
            link: "/admin/orders",
        }).catch(() => {});

        // Sipariş kalemlerini ekle
        if (body.items?.length) {
            await supabaseAdmin.from("order_items").insert(
                body.items.map((item) => ({
                    order_id: order.id,
                    product_id: item.productId,
                    name: item.name,
                    size: item.size || "",
                    color: item.color || "",
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image || "",
                }))
            );
        }

        // Tam siparişi dön
        const { data: full } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", order.id)
            .single();

        // E-posta gönder
        if (full?.customer_email) {
            sendOrderConfirmation({
                orderId: orderNumber,
                customerName: full.customer_name || body.customerName,
                customerEmail: full.customer_email,
                items: (full.order_items || []).map((i: OrderItemRow) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: Number(i.price),
                    size: i.size,
                    color: i.color,
                })),
                total: Number(full.total),
                shippingAddress: full.address,
            }).catch(() => {});
        }

        return NextResponse.json(formatOrder(full as OrderRow), { status: 201 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Sipariş oluşturulamadı";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
