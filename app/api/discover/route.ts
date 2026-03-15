import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/discover
export async function GET() {
    const [slidesRes, editorRes] = await Promise.all([
        supabaseAdmin.from("discover_slides").select("*").eq("is_active", true).order("sort_order"),
        supabaseAdmin.from("discover_editor_products").select("*").order("sort_order"),
    ]);

    const slides = (slidesRes.data || []).map(s => ({
        id: s.id,
        video: s.video,
        title: s.title,
        subtitle: s.subtitle || "",
        theme: s.theme || "",
        productName: s.product_name || "",
        productPrice: s.product_price || "",
        productImage: s.product_image || "",
        productLink: s.product_link || "",
        textEffect: s.text_effect || "",
    }));

    const editorProducts = (editorRes.data || []).map(ep => ({
        id: ep.id,
        image: ep.image,
        title: ep.title,
        price: ep.price,
        link: ep.link || "",
        isLarge: ep.is_large || false,
    }));

    return NextResponse.json({ slides, editorProducts });
}

// PUT /api/discover
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.slides) {
            await supabaseAdmin.from("discover_slides").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            if (body.slides.length) {
                await supabaseAdmin.from("discover_slides").insert(
                    body.slides.map((s: any, i: number) => ({
                        video: s.video, title: s.title, subtitle: s.subtitle || "",
                        theme: s.theme || "", product_name: s.productName || "",
                        product_price: s.productPrice || "", product_image: s.productImage || "",
                        product_link: s.productLink || "", text_effect: s.textEffect || "",
                        sort_order: i, is_active: true,
                    }))
                );
            }
        }

        if (body.editorProducts) {
            await supabaseAdmin.from("discover_editor_products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            if (body.editorProducts.length) {
                await supabaseAdmin.from("discover_editor_products").insert(
                    body.editorProducts.map((ep: any, i: number) => ({
                        image: ep.image, title: ep.title, price: ep.price,
                        link: ep.link || "", is_large: ep.isLarge || false, sort_order: i,
                    }))
                );
            }
        }

        // GET ile aynı şekilde dön
        const [slidesRes, editorRes] = await Promise.all([
            supabaseAdmin.from("discover_slides").select("*").eq("is_active", true).order("sort_order"),
            supabaseAdmin.from("discover_editor_products").select("*").order("sort_order"),
        ]);

        return NextResponse.json({
            slides: (slidesRes.data || []).map(s => ({
                id: s.id, video: s.video, title: s.title, subtitle: s.subtitle,
                theme: s.theme, productName: s.product_name, productPrice: s.product_price,
                productImage: s.product_image, productLink: s.product_link, textEffect: s.text_effect,
            })),
            editorProducts: (editorRes.data || []).map(ep => ({
                id: ep.id, image: ep.image, title: ep.title, price: ep.price, link: ep.link || "", isLarge: ep.is_large,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Discover güncellenemedi" }, { status: 400 });
    }
}
