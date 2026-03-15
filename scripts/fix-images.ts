// Fix broken image URLs in the database
// Run with: npx tsx scripts/fix-images.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const IMAGE_FIXES: Record<string, string> = {
    "/category-tshirt.png": "/category-tshirts.png",
    "/product-1.png": "/product-hoodie.png",
    "/product-2.png": "/product-cargo.png",
};

async function fixImages() {
    console.log("🔧 Fixing broken image URLs in database...\n");

    // Fix product_images table
    for (const [oldUrl, newUrl] of Object.entries(IMAGE_FIXES)) {
        const { data, error } = await supabase
            .from("product_images")
            .update({ url: newUrl })
            .eq("url", oldUrl)
            .select();

        if (error) {
            console.error(`❌ Error fixing ${oldUrl}:`, error.message);
        } else {
            console.log(`✅ Fixed ${data?.length || 0} images: ${oldUrl} → ${newUrl}`);
        }
    }

    // Fix hover_image in products table
    for (const [oldUrl, newUrl] of Object.entries(IMAGE_FIXES)) {
        const { data, error } = await supabase
            .from("products")
            .update({ hover_image: newUrl })
            .eq("hover_image", oldUrl)
            .select("id, name");

        if (error) {
            console.error(`❌ Error fixing hover_image ${oldUrl}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ Fixed ${data.length} hover images: ${oldUrl} → ${newUrl}`);
        }
    }

    // Verify results
    console.log("\n📋 Verification — checking for remaining broken URLs...");
    for (const oldUrl of Object.keys(IMAGE_FIXES)) {
        const { data: remaining } = await supabase
            .from("product_images")
            .select("id")
            .eq("url", oldUrl);

        if (remaining && remaining.length > 0) {
            console.log(`⚠️  Still found ${remaining.length} broken refs: ${oldUrl}`);
        }
    }

    console.log("\n✅ Done! All broken image URLs have been fixed.");
}

fixImages().catch(console.error);
