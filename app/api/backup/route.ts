import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BACKUP_TABLES = [
    "products",
    "product_colors",
    "product_sizes",
    "product_images",
    "product_features",
    "categories",
    "orders",
    "order_items",
    "customers",
    "coupons",
    "site_settings",
    "seo_settings",
    "discover_items",
    "campaigns",
    "announcements",
    "policies",
    "notifications",
    "audit_logs",
    "customer_notes",
    "stock_history",
];

// GET /api/backup — Tüm tabloları JSON olarak dışa aktar
export async function GET() {
    try {
        const backup: Record<string, unknown[]> = {};
        const errors: string[] = [];

        for (const table of BACKUP_TABLES) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select("*")
                .limit(10000);

            if (error) {
                errors.push(`${table}: ${error.message}`);
                backup[table] = [];
            } else {
                backup[table] = data || [];
            }
        }

        const result = {
            version: "1.0",
            created_at: new Date().toISOString(),
            tables: backup,
            table_counts: Object.fromEntries(
                Object.entries(backup).map(([k, v]) => [k, v.length])
            ),
            errors: errors.length > 0 ? errors : undefined,
        };

        const json = JSON.stringify(result, null, 2);

        return new NextResponse(json, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="chase-chain-backup-${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
