/**
 * Supabase SQL Migration Runner
 * Usage: npx tsx scripts/run-migration.ts
 *
 * .env.local dosyasındaki değişkenleri kullanır.
 */
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// .env.local dosyasını yükle
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function runMigration() {
    console.log("🚀 Supabase SQL migration başlıyor...\n");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error("❌ Ortam değişkenleri eksik!");
        console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
        console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_KEY ? "✅" : "❌");
        process.exit(1);
    }

    const sqlPath = path.join(__dirname, "migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log(`📄 SQL dosyası okundu (${sql.length} karakter)\n`);

    // Supabase REST SQL endpoint
    const url = `${SUPABASE_URL}/rest/v1/rpc/`;

    // Use the pg_net extension or direct SQL via Supabase Management API
    // Actually, let's use the Supabase SQL endpoint directly
    const response = await fetch(`${SUPABASE_URL}/pg`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "apikey": SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
        // Fallback: try the /sql endpoint
        console.log("⚠️  /pg endpoint bulunamadı, alternatif deneniyor...\n");

        // Split into individual statements and try via rpc
        const statements = sql
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith("--"));

        console.log(`📋 ${statements.length} SQL statement bulundu\n`);
        console.log("⚠️  Bu scripti çalıştırmak yerine, SQL dosyasını Supabase Dashboard üzerinden çalıştırmanız gerekiyor:");
        console.log("   1. https://supabase.com/dashboard adresine gidin");
        console.log("   2. Projenizi seçin");
        console.log("   3. Sol menüden 'SQL Editor' tıklayın");
        console.log("   4. 'New query' butonuna tıklayın");
        console.log("   5. scripts/migration.sql dosyasının içeriğini yapıştırın");
        console.log("   6. 'Run' butonuna basın\n");
        console.log("📁 SQL dosya yolu: scripts/migration.sql");
    } else {
        const result = await response.json();
        console.log("✅ Migration başarıyla tamamlandı!", result);
    }
}

runMigration().catch(console.error);
