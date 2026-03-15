// Create coupons table in Supabase
// Run with: npx tsx scripts/create-coupons-table.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
    console.log("🎟️  Creating coupons table...\n");

    // Use rpc to execute raw SQL
    const { error } = await supabase.rpc("exec_sql", {
        sql: `
            CREATE TABLE IF NOT EXISTS coupons (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                discount_value NUMERIC NOT NULL DEFAULT 0,
                min_order_amount NUMERIC DEFAULT 0,
                max_uses INTEGER DEFAULT NULL,
                used_count INTEGER NOT NULL DEFAULT 0,
                expiry_date TIMESTAMPTZ DEFAULT NULL,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now()
            );
        `
    });

    if (error) {
        // rpc might not exist, try direct table creation via insert test
        console.log("⚠️  RPC not available. Trying alternative approach...");
        console.log("ℹ️  Please create the table manually in Supabase SQL Editor:");
        console.log(`
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    expiry_date TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access" ON coupons
    FOR ALL USING (true) WITH CHECK (true);

-- Allow anonymous users to read active coupons (for validation)  
CREATE POLICY "Anyone can read active coupons" ON coupons
    FOR SELECT USING (is_active = true);
        `);

        // Try to check if table already exists by querying it
        const { error: checkError } = await supabase.from("coupons").select("id").limit(1);
        if (!checkError) {
            console.log("\n✅ Table 'coupons' already exists!");
        } else if (checkError.message.includes("does not exist")) {
            console.log("\n❌ Table does not exist. Please run the SQL above in Supabase dashboard.");
            console.log("   Go to: https://supabase.com/dashboard → SQL Editor → New Query → Paste & Run");
        } else {
            console.log("\n⚠️  Unexpected error:", checkError.message);
        }
    } else {
        console.log("✅ Coupons table created successfully!");
    }
}

createTable().catch(console.error);
