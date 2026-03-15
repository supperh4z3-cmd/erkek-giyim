import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHomepage(c: any) {
    return { id: c.id, title: c.title, subtitle: c.subtitle || "", image: c.image || "", link: c.link || "" };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLink(c: any) {
    return { id: c.id, label: c.label || c.title, link: c.link || "" };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisual(c: any) {
    return {
        id: c.id,
        type: c.subtitle === "large" ? "large" : "small",
        title: c.title || "",
        subtitle: c.label || "",
        image: c.image || "",
        link: c.link || "",
    };
}

// GET /api/categories
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const homepage = (data || []).filter(c => c.section === "homepage").map(mapHomepage);
    const dropdown = (data || []).filter(c => c.section === "dropdown").map(mapLink);
    const extraLinks = (data || []).filter(c => c.section === "extra").map(mapLink);
    const dropdownVisuals = (data || []).filter(c => c.section === "dropdown_visual").map(mapVisual);

    return NextResponse.json({ homepage, dropdown, extraLinks, dropdownVisuals });
}

// PUT /api/categories
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Homepage blokları
        if (body.homepage) {
            await supabaseAdmin.from("categories").delete().eq("section", "homepage");
            await supabaseAdmin.from("categories").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.homepage.map((c: any, i: number) => ({
                    title: c.title, subtitle: c.subtitle || "", image: c.image || "",
                    link: c.link || "", label: c.title, section: "homepage", sort_order: i,
                }))
            );
        }

        // Dropdown kategori linkleri
        if (body.dropdown) {
            await supabaseAdmin.from("categories").delete().eq("section", "dropdown");
            await supabaseAdmin.from("categories").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.dropdown.map((c: any, i: number) => ({
                    title: c.label || c.title, label: c.label || c.title,
                    link: c.link || "", section: "dropdown", sort_order: i,
                }))
            );
        }

        // Ekstra linkler
        if (body.extraLinks) {
            await supabaseAdmin.from("categories").delete().eq("section", "extra");
            await supabaseAdmin.from("categories").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.extraLinks.map((c: any, i: number) => ({
                    title: c.label || c.title, label: c.label || c.title,
                    link: c.link || "", section: "extra", sort_order: i,
                }))
            );
        }

        // Dropdown görsel blokları
        if (body.dropdownVisuals) {
            await supabaseAdmin.from("categories").delete().eq("section", "dropdown_visual");
            await supabaseAdmin.from("categories").insert(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body.dropdownVisuals.map((c: any, i: number) => ({
                    title: c.title || "",
                    subtitle: c.type || "small",   // large/small type stored in subtitle
                    label: c.subtitle || "",        // visual subtitle stored in label
                    image: c.image || "",
                    link: c.link || "",
                    section: "dropdown_visual",
                    sort_order: i,
                }))
            );
        }

        // Güncel veriyi dön
        const { data } = await supabaseAdmin
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });

        const homepage = (data || []).filter(c => c.section === "homepage").map(mapHomepage);
        const dropdown = (data || []).filter(c => c.section === "dropdown").map(mapLink);
        const extraLinks = (data || []).filter(c => c.section === "extra").map(mapLink);
        const dropdownVisuals = (data || []).filter(c => c.section === "dropdown_visual").map(mapVisual);

        return NextResponse.json({ homepage, dropdown, extraLinks, dropdownVisuals });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Kategoriler güncellenemedi" }, { status: 400 });
    }
}
