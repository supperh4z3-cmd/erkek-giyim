import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
        totalStock: (p.product_sizes || []).reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, s: any) => sum + (s.stock || 0), 0
        ),
    };
}

// GET /api/products/[id] — Tek ürün getir (id veya slug ile)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // UUID mi yoksa slug mı kontrol et
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id);

    const { data, error } = await supabaseAdmin
        .from("products")
        .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)")
        .eq(isUuid ? "id" : "slug", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(formatProduct(data));
}

// PUT /api/products/[id] — Ürün güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Ana ürünü güncelle
        const { error: updateError } = await supabaseAdmin
            .from("products")
            .update({
                name: body.name,
                slug: body.slug,
                category: body.category,
                price: body.price,
                old_price: body.oldPrice || null,
                description: body.description,
                hover_image: body.hoverImage || "",
                badge: body.badge || null,
                discount_percentage: body.discountPercentage || 0,
                is_new_season: body.isNewSeason ?? false,
                is_best_seller: body.isBestSeller ?? false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) throw updateError;

        // Alt tabloları sil ve yeniden oluştur (upsert yerine replace stratejisi)
        if (body.colors) {
            await supabaseAdmin.from("product_colors").delete().eq("product_id", id);
            if (body.colors.length) {
                await supabaseAdmin.from("product_colors").insert(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    body.colors.map((c: any, i: number) => ({
                        product_id: id, name: c.name, hex: c.hex, sort_order: i
                    }))
                );
            }
        }

        if (body.sizes) {
            await supabaseAdmin.from("product_sizes").delete().eq("product_id", id);
            if (body.sizes.length) {
                await supabaseAdmin.from("product_sizes").insert(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    body.sizes.map((s: any, i: number) => ({
                        product_id: id, size: s.size, stock: s.stock || 0, sort_order: i
                    }))
                );
            }
        }

        if (body.images) {
            await supabaseAdmin.from("product_images").delete().eq("product_id", id);
            if (body.images.length) {
                await supabaseAdmin.from("product_images").insert(
                    body.images.map((url: string, i: number) => ({
                        product_id: id, url, sort_order: i
                    }))
                );
            }
        }

        if (body.features) {
            await supabaseAdmin.from("product_features").delete().eq("product_id", id);
            if (body.features.length) {
                await supabaseAdmin.from("product_features").insert(
                    body.features.map((f: string, i: number) => ({
                        product_id: id, feature: f, sort_order: i
                    }))
                );
            }
        }

        // Güncel ürünü dön
        const { data: full } = await supabaseAdmin
            .from("products")
            .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)")
            .eq("id", id)
            .single();

        return NextResponse.json(formatProduct(full));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Güncelleme başarısız" }, { status: 400 });
    }
}

// DELETE /api/products/[id] — Ürün sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: "Ürün silinemedi" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Ürün silindi" });
}
