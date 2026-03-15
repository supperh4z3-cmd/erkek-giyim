import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chaseandchain.com";

    // Sabit sayfalar
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/new`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${baseUrl}/campaigns`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
        { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
        { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ];

    // Ürün sayfaları
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const { data: products } = await supabaseAdmin
            .from("products")
            .select("slug, updated_at")
            .order("updated_at", { ascending: false });

        if (products) {
            productPages = products.map(p => ({
                url: `${baseUrl}/product/${p.slug}`,
                lastModified: new Date(p.updated_at),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }));
        }
    } catch (err) {
        console.error("Sitemap ürün hatası:", err);
    }

    // Koleksiyon sayfaları
    const collectionSlugs = ["tops", "bottoms", "outwear", "accessories", "headwear", "all"];
    const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map(slug => ({
        url: `${baseUrl}/collections/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...collectionPages];
}
