import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAction } from "@/lib/auditLog";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProduct(p: any) {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        priceFormatted: `₺${Number(p.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        oldPriceFormatted: p.old_price ? `₺${Number(p.old_price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` : undefined,
        description: p.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colors: (p.product_colors || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((c: any) => ({ name: c.name, hex: c.hex })),
        sizes: (p.product_sizes || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((s: any) => ({ size: s.size, stock: s.stock })),
        images: (p.product_images || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((i: any) => i.url),
        hoverImage: p.hover_image || "",
        badge: p.badge || undefined,
        discountPercentage: p.discount_percentage || 0,
        features: (p.product_features || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((f: any) => f.feature),
        isNewSeason: p.is_new_season || false,
        isBestSeller: p.is_best_seller || false,
        // Computed fields
        totalStock: (p.product_sizes || []).reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, s: any) => sum + (s.stock || 0), 0
        ),
    };
}

// GET /api/products — Tüm ürünleri listele
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const newSeason = searchParams.get("newSeason");
    const bestSeller = searchParams.get("bestSeller");

    let query = supabaseAdmin
        .from("products")
        .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)");

    if (category && category !== "all") {
        query = query.eq("category", category);
    }
    if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }
    if (newSeason === "true") {
        query = query.eq("is_new_season", true);
    }
    if (bestSeller === "true") {
        query = query.eq("is_best_seller", true);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(formatProduct));
}

// POST /api/products — Yeni ürün oluştur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        // Ana ürünü oluştur
        const { data: product, error } = await supabaseAdmin
            .from("products")
            .insert({
                slug,
                name: body.name,
                category: body.category,
                price: body.price,
                old_price: body.oldPrice || null,
                description: body.description || "",
                hover_image: body.hoverImage || "",
                badge: body.badge || null,
                discount_percentage: body.discountPercentage || 0,
                is_new_season: body.isNewSeason || false,
                is_best_seller: body.isBestSeller || false,
            })
            .select()
            .single();

        if (error) throw error;

        const productId = product.id;

        // Alt tabloları ekle
        if (body.colors?.length) {
            await supabaseAdmin.from("product_colors").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.colors.map((c: any, i: number) => ({
                    product_id: productId, name: c.name, hex: c.hex, sort_order: i
                }))
            );
        }

        if (body.sizes?.length) {
            await supabaseAdmin.from("product_sizes").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.sizes.map((s: any, i: number) => ({
                    product_id: productId, size: s.size, stock: s.stock, sort_order: i
                }))
            );
        }

        if (body.images?.length) {
            await supabaseAdmin.from("product_images").insert(
                body.images.map((url: string, i: number) => ({
                    product_id: productId, url, sort_order: i
                }))
            );
        }

        if (body.features?.length) {
            await supabaseAdmin.from("product_features").insert(
                body.features.map((f: string, i: number) => ({
                    product_id: productId, feature: f, sort_order: i
                }))
            );
        }

        // Tam ürünü geri dön
        const { data: full } = await supabaseAdmin
            .from("products")
            .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)")
            .eq("id", productId)
            .single();

        logAction({ action: "create", entityType: "product", entityId: productId, details: `Ürün oluşturuldu: ${body.name}` }).catch(() => {});

        return NextResponse.json(formatProduct(full), { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Ürün oluşturulamadı" }, { status: 400 });
    }
}
