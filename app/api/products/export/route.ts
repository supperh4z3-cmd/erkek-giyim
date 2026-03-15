import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/products/export — CSV olarak tüm ürünleri dışarı aktar
export async function GET() {
    const { data: products, error } = await supabaseAdmin
        .from("products")
        .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // CSV header
    const headers = [
        "İsim", "Slug", "Kategori", "Fiyat", "Eski Fiyat", "İndirim %",
        "Badge", "Yeni Sezon", "Çok Satan", "Açıklama",
        "Renkler", "Bedenler (Stok)", "Görseller", "Özellikler"
    ];

    // CSV rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (products || []).map((p: any) => {
        const colors = (p.product_colors || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((c: any) => `${c.name}:${c.hex}`)
            .join("|");

        const sizes = (p.product_sizes || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((s: any) => `${s.size}:${s.stock}`)
            .join("|");

        const images = (p.product_images || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((i: any) => i.url)
            .join("|");

        const features = (p.product_features || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((f: any) => f.feature)
            .join("|");

        return [
            p.name,
            p.slug,
            p.category,
            p.price,
            p.old_price || "",
            p.discount_percentage || 0,
            p.badge || "",
            p.is_new_season ? "Evet" : "Hayır",
            p.is_best_seller ? "Evet" : "Hayır",
            p.description || "",
            colors,
            sizes,
            images,
            features,
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="urunler_${new Date().toISOString().split("T")[0]}.csv"`,
        },
    });
}
