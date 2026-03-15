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

// GET /api/customer/favorites — favorileri ürün bilgisiyle getir
export async function GET(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { data: favs } = await supabaseAdmin
        .from("customer_favorites")
        .select("id, product_id, created_at")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (!favs || favs.length === 0) return NextResponse.json([]);

    // Ürün detaylarını çek
    const productIds = favs.map(f => f.product_id);
    const { data: products } = await supabaseAdmin
        .from("products")
        .select("id, name, slug, category, price")
        .in("id", productIds);

    // İlk resmi çek
    const { data: images } = await supabaseAdmin
        .from("product_images")
        .select("product_id, url")
        .in("product_id", productIds)
        .eq("sort_order", 0);

    const imageMap = new Map((images || []).map(i => [i.product_id, i.url]));
    const productMap = new Map((products || []).map(p => [p.id, p]));

    const result = favs.map(f => {
        const product = productMap.get(f.product_id);
        return {
            id: f.id,
            productId: f.product_id,
            name: product?.name || "",
            slug: product?.slug || "",
            category: product?.category || "",
            price: product?.price || 0,
            image: imageMap.get(f.product_id) || "",
        };
    }).filter(f => f.name);

    return NextResponse.json(result);
}

// POST /api/customer/favorites — favoriye ekle
export async function POST(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "productId gerekli" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("customer_favorites")
        .upsert({ customer_id: customerId, product_id: productId },
            { onConflict: "customer_id,product_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// DELETE /api/customer/favorites — favoriden çıkar
export async function DELETE(req: NextRequest) {
    const customerId = await getCustomerId(req);
    if (!customerId) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return NextResponse.json({ error: "productId gerekli" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("customer_favorites")
        .delete()
        .eq("customer_id", customerId)
        .eq("product_id", productId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
