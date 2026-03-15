import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/settings
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("settings")
        .select("key, value");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // key-value satırlarını tek bir objeye dönüştür
    const settings: Record<string, any> = {};
    for (const row of (data || [])) {
        settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const sections = ["announcement", "hero", "socialLinks", "general", "globalImages"];

        for (const key of sections) {
            if (body[key] !== undefined) {
                await supabaseAdmin
                    .from("settings")
                    .upsert({
                        key,
                        value: body[key],
                        updated_at: new Date().toISOString(),
                    });
            }
        }

        // Güncel ayarları dön
        const { data } = await supabaseAdmin.from("settings").select("key, value");
        const settings: Record<string, any> = {};
        for (const row of (data || [])) {
            settings[row.key] = row.value;
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Ayarlar güncellenemedi" }, { status: 400 });
    }
}
