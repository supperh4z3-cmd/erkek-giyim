import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/products/import — CSV'den toplu ürün ekle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const rows: string[][] = body.rows;

        if (!rows?.length) {
            return NextResponse.json({ error: "Veri bulunamadı" }, { status: 400 });
        }

        const results = { success: 0, errors: [] as string[] };

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const [
                    name, slug, category, priceStr, oldPriceStr, discountStr,
                    badge, isNewSeasonStr, isBestSellerStr, description,
                    colorsStr, sizesStr, imagesStr, featuresStr
                ] = row;

                if (!name || !category || !priceStr) {
                    results.errors.push(`Satır ${i + 1}: İsim, kategori veya fiyat eksik`);
                    continue;
                }

                const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();

                // Ürünü oluştur veya güncelle
                const { data: existing } = await supabaseAdmin
                    .from("products")
                    .select("id")
                    .eq("slug", productSlug)
                    .single();

                const productData = {
                    slug: productSlug,
                    name: name.trim(),
                    category: category.trim(),
                    price: parseFloat(priceStr) || 0,
                    old_price: oldPriceStr ? parseFloat(oldPriceStr) : null,
                    discount_percentage: parseInt(discountStr) || 0,
                    badge: badge || null,
                    is_new_season: isNewSeasonStr?.toLowerCase() === "evet",
                    is_best_seller: isBestSellerStr?.toLowerCase() === "evet",
                    description: description || "",
                };

                let productId: string;

                if (existing) {
                    // Güncelle
                    await supabaseAdmin.from("products").update(productData).eq("id", existing.id);
                    productId = existing.id;

                    // Eski alt verileri temizle
                    await supabaseAdmin.from("product_colors").delete().eq("product_id", productId);
                    await supabaseAdmin.from("product_sizes").delete().eq("product_id", productId);
                    await supabaseAdmin.from("product_images").delete().eq("product_id", productId);
                    await supabaseAdmin.from("product_features").delete().eq("product_id", productId);
                } else {
                    // Yeni oluştur
                    const { data: newProd, error } = await supabaseAdmin
                        .from("products")
                        .insert(productData)
                        .select()
                        .single();
                    if (error) throw error;
                    productId = newProd.id;
                }

                // Renkler: "Siyah:#000|Beyaz:#fff"
                if (colorsStr) {
                    const colors = colorsStr.split("|").filter(Boolean).map((c, idx) => {
                        const [colorName, hex] = c.split(":");
                        return { product_id: productId, name: colorName?.trim(), hex: hex?.trim() || "#000", sort_order: idx };
                    });
                    if (colors.length) await supabaseAdmin.from("product_colors").insert(colors);
                }

                // Bedenler: "S:10|M:15|L:8"
                if (sizesStr) {
                    const sizes = sizesStr.split("|").filter(Boolean).map((s, idx) => {
                        const [size, stock] = s.split(":");
                        return { product_id: productId, size: size?.trim(), stock: parseInt(stock) || 0, sort_order: idx };
                    });
                    if (sizes.length) await supabaseAdmin.from("product_sizes").insert(sizes);
                }

                // Görseller: "url1|url2|url3"
                if (imagesStr) {
                    const images = imagesStr.split("|").filter(Boolean).map((url, idx) => ({
                        product_id: productId, url: url.trim(), sort_order: idx,
                    }));
                    if (images.length) await supabaseAdmin.from("product_images").insert(images);
                }

                // Özellikler: "feature1|feature2"
                if (featuresStr) {
                    const features = featuresStr.split("|").filter(Boolean).map((f, idx) => ({
                        product_id: productId, feature: f.trim(), sort_order: idx,
                    }));
                    if (features.length) await supabaseAdmin.from("product_features").insert(features);
                }

                results.success++;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
                results.errors.push(`Satır ${i + 1}: ${msg}`);
            }
        }

        return NextResponse.json(results);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "İçe aktarma hatası";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
