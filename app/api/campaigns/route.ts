import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// DB rows → frontend response shape
async function getCampaignsResponse() {
    const { data } = await supabaseAdmin
        .from("campaigns")
        .select("*")
        .order("sort_order", { ascending: true });

    const result: Record<string, any> = {};
    for (const row of (data || [])) {
        if (row.section === "marquee") {
            // marquee section stores the text directly
            result.marqueeText = row.data;
        } else {
            result[row.section] = row.data;
        }
    }
    return result;
}

// GET /api/campaigns
export async function GET() {
    const result = await getCampaignsResponse();
    return NextResponse.json(result);
}

// PUT /api/campaigns
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Map admin page fields to DB sections
        const sectionMap: Record<string, { key: string; data: any }> = {};

        if (body.hero !== undefined) {
            sectionMap.hero = { key: "hero", data: body.hero };
        }
        if (body.marqueeText !== undefined) {
            sectionMap.marquee = { key: "marquee", data: body.marqueeText };
        }
        if (body.marquee !== undefined) {
            sectionMap.marquee = { key: "marquee", data: body.marquee };
        }
        if (body.lookbook !== undefined) {
            sectionMap.lookbook = { key: "lookbook", data: body.lookbook };
        }

        const sectionOrder: Record<string, number> = { hero: 0, marquee: 1, lookbook: 2 };

        for (const [, val] of Object.entries(sectionMap)) {
            const { data: existing } = await supabaseAdmin
                .from("campaigns")
                .select("id")
                .eq("section", val.key)
                .single();

            if (existing) {
                await supabaseAdmin
                    .from("campaigns")
                    .update({ data: val.data, updated_at: new Date().toISOString() })
                    .eq("id", existing.id);
            } else {
                await supabaseAdmin.from("campaigns").insert({
                    section: val.key, data: val.data, sort_order: sectionOrder[val.key] ?? 0,
                });
            }
        }

        const result = await getCampaignsResponse();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Kampanya güncellenemedi" }, { status: 400 });
    }
}

