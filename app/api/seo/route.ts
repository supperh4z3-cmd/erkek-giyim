import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET — Tüm sayfa SEO ayarlarını getir
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_seo")
            .select("*")
            .order("page_key");

        if (error) throw error;

        // page_key'e göre map oluştur
        const seoMap: Record<string, { title: string; description: string }> = {};
        for (const row of (data || [])) {
            seoMap[row.page_key] = { title: row.title || "", description: row.description || "" };
        }

        return NextResponse.json(seoMap);
    } catch {
        return NextResponse.json({});
    }
}

// PUT — SEO ayarlarını kaydet
export async function PUT(req: Request) {
    try {
        const body = await req.json();

        // body: { "home": { title, description }, "store": { title, description }, ... }
        for (const [pageKey, values] of Object.entries(body)) {
            const { title, description } = values as { title: string; description: string };
            await supabaseAdmin
                .from("site_seo")
                .upsert(
                    { page_key: pageKey, title, description, updated_at: new Date().toISOString() },
                    { onConflict: "page_key" }
                );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("SEO kaydetme hatası:", err);
        return NextResponse.json({ error: "Kaydetme başarısız" }, { status: 500 });
    }
}
