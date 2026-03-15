import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Geri yüklenebilir tablolar (sıralama önemli — bağımlılıklar önce)
const RESTORE_ORDER = [
    "categories",
    "products",
    "product_colors",
    "product_sizes",
    "product_images",
    "product_features",
    "customers",
    "customer_notes",
    "orders",
    "order_items",
    "coupons",
    "site_settings",
    "seo_settings",
    "discover_items",
    "campaigns",
    "announcements",
    "policies",
    "notifications",
    "audit_logs",
    "stock_history",
];

// POST /api/backup/restore — JSON backup dosyasından geri yükle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.version || !body.tables) {
            return NextResponse.json({ error: "Geçersiz yedek dosyası formatı" }, { status: 400 });
        }

        const results: { table: string; inserted: number; error?: string }[] = [];

        for (const table of RESTORE_ORDER) {
            const rows = body.tables[table];
            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                results.push({ table, inserted: 0 });
                continue;
            }

            // Tabloyu temizle
            const { error: deleteError } = await supabaseAdmin
                .from(table)
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000"); // Tüm satırları sil

            if (deleteError) {
                results.push({ table, inserted: 0, error: `Temizleme: ${deleteError.message}` });
                continue;
            }

            // Verileri ekle (batch)
            const batchSize = 500;
            let totalInserted = 0;
            let insertError: string | undefined;

            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                const { error } = await supabaseAdmin
                    .from(table)
                    .insert(batch);

                if (error) {
                    insertError = error.message;
                    break;
                }
                totalInserted += batch.length;
            }

            results.push({ table, inserted: totalInserted, error: insertError });
        }

        const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
        const errors = results.filter(r => r.error);

        return NextResponse.json({
            success: true,
            totalInserted,
            tables: results,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
