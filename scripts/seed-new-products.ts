// Seed 6 new products with images
// Run with: npx tsx scripts/seed-new-products.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEW_PRODUCTS = [
    {
        slug: "oversized-bomber-jacket",
        name: "Oversized Bomber Jacket",
        category: "Outwear",
        price: 2499,
        description: "Klasik MA-1 siluetinden ilham alan oversize bomber ceket. Askeri estetiği sokak kültürüyle harmanlar. Su itici kumaş, ribana yaka ve manşetler, pilot kol cebi detayı.",
        hover_image: "/product-zipup.png",
        badge: "new",
        is_new_season: true,
        is_best_seller: true,
        colors: [
            { name: "Jet Black", hex: "#0a0a0a" },
            { name: "Military Olive", hex: "#4a5d3a" },
        ],
        sizes: [
            { size: "S", stock: 8 },
            { size: "M", stock: 12 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 6 },
        ],
        images: ["/product-bomber.png", "/category-outwear.png"],
        features: ["Su İtici Kumaş", "Oversize Kalıp", "Pilot Kol Cebi", "Ribana Yaka & Manşet", "Türkiye'de Üretilmiştir"],
    },
    {
        slug: "rebellion-graphic-tee",
        name: "Rebellion Graphic Tee",
        category: "T-Shirts",
        price: 599,
        old_price: 799,
        description: "Soyut grunge baskılı oversize tişört. 280gsm ağır gramaj %100 pamuk kumaştan üretilmiştir. Düşük omuz kesim, farklı tarz arayanlar için.",
        hover_image: "/category-tshirts.png",
        badge: "sale",
        discount_percentage: 25,
        is_new_season: true,
        is_best_seller: false,
        colors: [
            { name: "Off White", hex: "#f5f5f0" },
            { name: "Washed Black", hex: "#1f2937" },
        ],
        sizes: [
            { size: "S", stock: 20 },
            { size: "M", stock: 25 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 10 },
        ],
        images: ["/product-graphic-tee.png", "/category-tshirts.png"],
        features: ["280gsm %100 Pamuk", "Soyut Grunge Baskı", "Oversize Kalıp", "Düşük Omuz Kesim", "Türkiye'de Üretilmiştir"],
    },
    {
        slug: "premium-jogger-pants",
        name: "Premium Jogger Pants",
        category: "Bottoms",
        price: 1199,
        description: "Premium pamuk karışımlı jogger pantolon. Slim fit kesim, elastik bel ve paça manşetleri ile hem konfor hem stil sunar. Fermuarlı cep detayları.",
        hover_image: "/category-bottoms.png",
        badge: "new",
        is_new_season: true,
        is_best_seller: false,
        colors: [
            { name: "Black", hex: "#0a0a0a" },
            { name: "Grey Melange", hex: "#9ca3af" },
        ],
        sizes: [
            { size: "28/S", stock: 10 },
            { size: "30/M", stock: 15 },
            { size: "32/L", stock: 18 },
            { size: "34/XL", stock: 8 },
        ],
        images: ["/product-jogger.png", "/category-bottoms.png"],
        features: ["Premium Pamuk Karışım", "Slim Fit Jogger", "Fermuarlı Cepler", "Elastik Bel & Paça", "Türkiye'de Üretilmiştir"],
    },
    {
        slug: "vintage-leather-biker-jacket",
        name: "Vintage Leather Biker Jacket",
        category: "Outwear",
        price: 4999,
        old_price: 5999,
        description: "Gerçek deri biker ceket. El yapımı yıpratma (distress) efekti ile her parça benzersizdir. Asimetrik fermuar, kapitone omuz detayları.",
        hover_image: "/category-outwear.png",
        badge: "sale",
        discount_percentage: 17,
        is_new_season: true,
        is_best_seller: true,
        colors: [
            { name: "Aged Brown", hex: "#4a3728" },
            { name: "Jet Black", hex: "#0a0a0a" },
        ],
        sizes: [
            { size: "S", stock: 3 },
            { size: "M", stock: 5 },
            { size: "L", stock: 7 },
            { size: "XL", stock: 2 },
        ],
        images: ["/product-leather-jacket.png", "/category-outwear.png"],
        features: ["Gerçek Deri", "El Yapımı Distress", "Asimetrik Fermuar", "Kapitone Omuzlar", "İtalya'da Üretilmiştir"],
    },
    {
        slug: "tech-fleece-hoodie",
        name: "Tech Fleece Hoodie",
        category: "Knitwear",
        price: 1699,
        description: "Teknik kumaş yapısıyla sıcaklığı hapseden, nefes alabilir fleece hoodie. Modern fit kesim, kanguru cep. Neopren benzeri doku.",
        hover_image: "/product-hoodie.png",
        badge: "new",
        is_new_season: true,
        is_best_seller: true,
        colors: [
            { name: "Navy", hex: "#1e3a5f" },
            { name: "Charcoal", hex: "#333333" },
        ],
        sizes: [
            { size: "S", stock: 12 },
            { size: "M", stock: 18 },
            { size: "L", stock: 22 },
            { size: "XL", stock: 8 },
        ],
        images: ["/product-tech-hoodie.png", "/product-hoodie.png"],
        features: ["Tech Fleece Kumaş", "Modern Fit", "Kanguru Cep", "Nefes Alabilir Yapı", "Türkiye'de Üretilmiştir"],
    },
    {
        slug: "cuban-link-bracelet",
        name: "Cuban Link Bracelet",
        category: "Accessories",
        price: 1299,
        description: "Kalın Cuban link zincir bileklik. 316L paslanmaz çelik gövde üzerine premium gümüş kaplama. Ağır ve dikkat çekici tasarım.",
        hover_image: "/category-accessories.png",
        is_new_season: false,
        is_best_seller: true,
        colors: [
            { name: "Silver", hex: "#c0c0c0" },
            { name: "Gold", hex: "#d4af37" },
        ],
        sizes: [
            { size: "20cm", stock: 15 },
            { size: "22cm", stock: 20 },
        ],
        images: ["/product-chain-bracelet.png", "/category-accessories.png"],
        features: ["316L Paslanmaz Çelik", "Premium Gümüş Kaplama", "Cuban Link Tasarım", "Anti-alerji Malzeme"],
    },
];

async function seedProducts() {
    console.log("🌱 Seeding 6 new products...\n");

    for (const product of NEW_PRODUCTS) {
        const { colors, sizes, images, features, ...productData } = product;

        // Insert main product
        const { data: created, error } = await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

        if (error) {
            console.error(`❌ Error creating "${product.name}":`, error.message);
            continue;
        }

        const pid = created.id;

        // Insert colors
        if (colors.length) {
            await supabase.from("product_colors").insert(
                colors.map((c, i) => ({ product_id: pid, name: c.name, hex: c.hex, sort_order: i }))
            );
        }

        // Insert sizes
        if (sizes.length) {
            await supabase.from("product_sizes").insert(
                sizes.map((s, i) => ({ product_id: pid, size: s.size, stock: s.stock, sort_order: i }))
            );
        }

        // Insert images
        if (images.length) {
            await supabase.from("product_images").insert(
                images.map((url, i) => ({ product_id: pid, url, sort_order: i }))
            );
        }

        // Insert features
        if (features.length) {
            await supabase.from("product_features").insert(
                features.map((f, i) => ({ product_id: pid, feature: f, sort_order: i }))
            );
        }

        console.log(`✅ Created: ${product.name} (${pid})`);
    }

    console.log("\n🎉 All 6 products seeded successfully!");
}

seedProducts().catch(console.error);
