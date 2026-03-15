import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/policies
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("policies")
        .select("*");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // slug bazlı objeye dönüştür
    const result: Record<string, any> = {};
    for (const row of (data || [])) {
        if (row.slug === "faq") {
            result.faq = row.faq || [];
        } else {
            // Content'i parse et (JSON string olarak saklandıysa)
            try {
                result[row.slug] = typeof row.content === "string"
                    ? JSON.parse(row.content)
                    : row.content;
            } catch {
                result[row.slug] = { title: row.title, content: row.content };
            }
        }
    }

    return NextResponse.json(result);
}

// PUT /api/policies
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const slugs = ["shipping", "returns", "privacy", "terms"];

        for (const slug of slugs) {
            if (body[slug] !== undefined) {
                const content = typeof body[slug] === "string"
                    ? body[slug]
                    : JSON.stringify(body[slug]);

                await supabaseAdmin
                    .from("policies")
                    .upsert({
                        slug,
                        title: body[slug]?.title || slug,
                        content,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: "slug" });
            }
        }

        if (body.faq !== undefined) {
            await supabaseAdmin
                .from("policies")
                .upsert({
                    slug: "faq",
                    title: "Sıkça Sorulan Sorular",
                    content: "",
                    faq: body.faq,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "slug" });
        }

        if (body.sizeGuide !== undefined) {
            const content = typeof body.sizeGuide === "string"
                ? body.sizeGuide
                : JSON.stringify(body.sizeGuide);

            await supabaseAdmin
                .from("policies")
                .upsert({
                    slug: "sizeGuide",
                    title: body.sizeGuide?.title || "Beden Tablosu",
                    content,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "slug" });
        }

        // Güncel veriyi dön
        const { data } = await supabaseAdmin.from("policies").select("*");
        const result: Record<string, any> = {};
        for (const row of (data || [])) {
            if (row.slug === "faq") {
                result.faq = row.faq || [];
            } else {
                try {
                    result[row.slug] = typeof row.content === "string"
                        ? JSON.parse(row.content)
                        : row.content;
                } catch {
                    result[row.slug] = { title: row.title, content: row.content };
                }
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Politikalar güncellenemedi" }, { status: 400 });
    }
}
