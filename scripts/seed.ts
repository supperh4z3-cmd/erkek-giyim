/**
 * Supabase Seed Script — JSON dosyalarındaki mevcut verileri Supabase'e aktarır.
 * Usage: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const dataDir = path.join(__dirname, "..", "lib", "data");

function readData<T>(filename: string): T {
    const raw = fs.readFileSync(path.join(dataDir, filename), "utf-8");
    return JSON.parse(raw) as T;
}

async function seedProducts() {
    console.log("\n📦 Ürünler aktarılıyor...");
    const products = readData<any[]>("products.json");

    for (const p of products) {
        const { data: product, error } = await supabase
            .from("products")
            .insert({
                slug: p.slug,
                name: p.name,
                category: p.category,
                price: p.price,
                description: p.description || "",
                hover_image: p.hoverImage || "",
                badge: p.badge || null,
                discount_percentage: p.discountPercentage || 0,
                is_new_season: p.isNewSeason || false,
                is_best_seller: p.isBestSeller || false,
            })
            .select()
            .single();

        if (error) { console.error(`  ❌ ${p.name}:`, error.message); continue; }
        console.log(`  ✅ ${p.name}`);

        const productId = product.id;

        // Colors
        if (p.colors?.length) {
            const { error: ce } = await supabase.from("product_colors").insert(
                p.colors.map((c: any, i: number) => ({
                    product_id: productId, name: c.name, hex: c.hex, sort_order: i
                }))
            );
            if (ce) console.error(`    ❌ Colors:`, ce.message);
        }

        // Sizes
        if (p.sizes?.length) {
            const { error: se } = await supabase.from("product_sizes").insert(
                p.sizes.map((s: any, i: number) => ({
                    product_id: productId, size: s.size, stock: s.stock, sort_order: i
                }))
            );
            if (se) console.error(`    ❌ Sizes:`, se.message);
        }

        // Images
        if (p.images?.length) {
            const { error: ie } = await supabase.from("product_images").insert(
                p.images.map((url: string, i: number) => ({
                    product_id: productId, url, sort_order: i
                }))
            );
            if (ie) console.error(`    ❌ Images:`, ie.message);
        }

        // Features
        if (p.features?.length) {
            const { error: fe } = await supabase.from("product_features").insert(
                p.features.map((f: string, i: number) => ({
                    product_id: productId, feature: f, sort_order: i
                }))
            );
            if (fe) console.error(`    ❌ Features:`, fe.message);
        }
    }
}

async function seedCustomers() {
    console.log("\n👥 Müşteriler aktarılıyor...");
    const customers = readData<any[]>("customers.json");

    for (const c of customers) {
        const { error } = await supabase.from("customers").insert({
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            total_orders: c.totalOrders || 0,
            total_spent: c.totalSpent || 0,
            created_at: c.createdAt || new Date().toISOString(),
        });
        if (error) console.error(`  ❌ ${c.name}:`, error.message);
        else console.log(`  ✅ ${c.name}`);
    }
}

async function seedOrders() {
    console.log("\n📋 Siparişler aktarılıyor...");
    const orders = readData<any[]>("orders.json");

    for (const o of orders) {
        // Find customer by email
        const { data: customer } = await supabase
            .from("customers")
            .select("id")
            .eq("email", o.customerEmail)
            .single();

        const { data: order, error } = await supabase
            .from("orders")
            .insert({
                order_number: o.id,
                customer_id: customer?.id || null,
                customer_name: o.customerName,
                customer_email: o.customerEmail,
                customer_phone: o.customerPhone,
                address: o.address,
                status: o.status,
                payment_status: o.paymentStatus,
                total: o.total,
                tracking_number: o.trackingNumber || "",
                note: o.note || "",
                created_at: o.date,
            })
            .select()
            .single();

        if (error) { console.error(`  ❌ ${o.id}:`, error.message); continue; }
        console.log(`  ✅ ${o.id}`);

        // Order items
        if (o.items?.length) {
            const { error: ie } = await supabase.from("order_items").insert(
                o.items.map((item: any) => ({
                    order_id: order.id,
                    product_id: item.productId,
                    name: item.name,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                }))
            );
            if (ie) console.error(`    ❌ Items:`, ie.message);
        }
    }
}

async function seedCategories() {
    console.log("\n🏷️ Kategoriler aktarılıyor...");
    const cats = readData<any>("categories.json");

    // Homepage categories
    for (let i = 0; i < (cats.homepage?.length || 0); i++) {
        const c = cats.homepage[i];
        const { error } = await supabase.from("categories").insert({
            title: c.title, subtitle: c.subtitle, image: c.image, link: c.link,
            label: c.title, section: "homepage", sort_order: i,
        });
        if (error) console.error(`  ❌ ${c.title}:`, error.message);
        else console.log(`  ✅ ${c.title} (homepage)`);
    }

    // Dropdown categories
    for (let i = 0; i < (cats.dropdown?.length || 0); i++) {
        const c = cats.dropdown[i];
        const { error } = await supabase.from("categories").insert({
            title: c.label, label: c.label, link: c.link,
            section: "dropdown", sort_order: i,
        });
        if (error) console.error(`  ❌ ${c.label}:`, error.message);
        else console.log(`  ✅ ${c.label} (dropdown)`);
    }

    // Extra links
    for (let i = 0; i < (cats.extraLinks?.length || 0); i++) {
        const c = cats.extraLinks[i];
        const { error } = await supabase.from("categories").insert({
            title: c.label, label: c.label, link: c.link,
            section: "extra", sort_order: i,
        });
        if (error) console.error(`  ❌ ${c.label}:`, error.message);
        else console.log(`  ✅ ${c.label} (extra)`);
    }
}

async function seedSettings() {
    console.log("\n⚙️ Ayarlar aktarılıyor...");
    const settings = readData<any>("settings.json");

    const sections = ["announcement", "hero", "socialLinks", "general", "globalImages"];
    for (const key of sections) {
        if (settings[key]) {
            const { error } = await supabase.from("settings").upsert({
                key, value: settings[key], updated_at: new Date().toISOString(),
            });
            if (error) console.error(`  ❌ ${key}:`, error.message);
            else console.log(`  ✅ ${key}`);
        }
    }
}

async function seedCampaigns() {
    console.log("\n🎯 Kampanyalar aktarılıyor...");
    const campaigns = readData<any>("campaigns.json");

    const sections = ["hero", "lookbook"];
    for (let i = 0; i < sections.length; i++) {
        const key = sections[i];
        if (campaigns[key]) {
            const { error } = await supabase.from("campaigns").insert({
                section: key, data: campaigns[key], sort_order: i,
            });
            if (error) console.error(`  ❌ ${key}:`, error.message);
            else console.log(`  ✅ ${key}`);
        }
    }

    // marqueeText → marquee section
    if (campaigns.marqueeText) {
        const { error } = await supabase.from("campaigns").insert({
            section: "marquee", data: campaigns.marqueeText, sort_order: 1,
        });
        if (error) console.error(`  ❌ marquee:`, error.message);
        else console.log(`  ✅ marquee`);
    }
}

async function seedDiscover() {
    console.log("\n🔍 Discover aktarılıyor...");
    const discover = readData<any>("discover.json");

    // Slides
    if (discover.slides?.length) {
        for (let i = 0; i < discover.slides.length; i++) {
            const s = discover.slides[i];
            const { error } = await supabase.from("discover_slides").insert({
                video: s.video, title: s.title, subtitle: s.subtitle,
                theme: s.theme, product_name: s.productName,
                product_price: s.productPrice, product_image: s.productImage,
                product_link: s.productLink, text_effect: s.textEffect,
                sort_order: i, is_active: true,
            });
            if (error) console.error(`  ❌ Slide ${s.title}:`, error.message);
            else console.log(`  ✅ Slide: ${s.title}`);
        }
    }

    // Editor products
    if (discover.editorProducts?.length) {
        for (let i = 0; i < discover.editorProducts.length; i++) {
            const ep = discover.editorProducts[i];
            const { error } = await supabase.from("discover_editor_products").insert({
                image: ep.image, title: ep.title, price: ep.price,
                is_large: ep.isLarge || false, sort_order: i,
            });
            if (error) console.error(`  ❌ EP ${ep.title}:`, error.message);
            else console.log(`  ✅ Editor: ${ep.title}`);
        }
    }
}

async function seedPolicies() {
    console.log("\n📜 Politikalar aktarılıyor...");
    const policies = readData<any>("policies.json");

    const slugs = ["shipping", "returns", "privacy", "terms"];
    for (const slug of slugs) {
        if (policies[slug]) {
            const { error } = await supabase.from("policies").insert({
                slug,
                title: policies[slug].title || slug,
                content: JSON.stringify(policies[slug]),
            });
            if (error) console.error(`  ❌ ${slug}:`, error.message);
            else console.log(`  ✅ ${slug}`);
        }
    }

    // FAQ
    if (policies.faq) {
        const { error } = await supabase.from("policies").insert({
            slug: "faq",
            title: policies.faq.title || "Sıkça Sorulan Sorular",
            content: "",
            faq: policies.faq.items || policies.faq,
        });
        if (error) console.error(`  ❌ faq:`, error.message);
        else console.log(`  ✅ faq`);
    }
}

async function main() {
    console.log("🌱 Supabase Seed Script Başlıyor...\n");
    console.log(`📡 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`🔑 Service Key: ...${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-10)}\n`);

    await seedProducts();
    await seedCustomers();
    await seedOrders();
    await seedCategories();
    await seedSettings();
    await seedCampaigns();
    await seedDiscover();
    await seedPolicies();

    console.log("\n🎉 Seed tamamlandı!");
}

main().catch(console.error);
