import Image from "next/image";
import Link from "next/link";
import HeroVideo from "@/components/ui/HeroVideo";
import ProductCard from "@/components/ui/ProductCard";
import PhilosophyCarousel from "@/components/ui/PhilosophyCarousel";
import BestSellersMarquee from "@/components/ui/BestSellersMarquee";
import DiscoverTeaser from "@/components/ui/DiscoverTeaser";
import { readJSON } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoriesData = readJSON<{ homepage?: any[] }>("categories.json", { homepage: [] });
const COLLECTIONS_DATA = (categoriesData.homepage || []).map((cat: { title: string; subtitle: string; image: string; link?: string }) => ({
    title: cat.title,
    subtitle: cat.subtitle,
    image: cat.image,
    link: cat.link,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProduct(p: any) {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        priceFormatted: `₺${Number(p.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        oldPriceFormatted: p.old_price ? `₺${Number(p.old_price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` : undefined,
        description: p.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colors: (p.product_colors || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((c: any) => ({ name: c.name, hex: c.hex })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sizes: (p.product_sizes || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((s: any) => ({ size: s.size, stock: s.stock })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        images: (p.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url),
        hoverImage: p.hover_image || "",
        badge: p.badge || undefined,
        discountPercentage: p.discount_percentage || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        features: (p.product_features || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((f: any) => f.feature),
        isNewSeason: p.is_new_season || false,
        isBestSeller: p.is_best_seller || false,
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
    // Veritabanından yeni sezon ürünlerini çek
    const { data: newSeasonRaw } = await supabaseAdmin
        .from("products")
        .select("*, product_colors(*), product_sizes(*), product_images(*), product_features(*)")
        .eq("is_new_season", true)
        .limit(10);

    const newSeasonProducts = (newSeasonRaw || []).map(formatProduct);

    return (
        <div className="flex flex-col">
            {/* Full Screen Cinematic Video Hero */}
            <HeroVideo />

            {/* Animated Best Sellers Marquee */}
            <BestSellersMarquee />

            {/* Categories / Collections */}
            <section id="collections" className="py-24 container mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl md:text-5xl font-display text-primary-900 uppercase tracking-tighter">Koleksiyonlar</h2>
                    <Link href="/collections" className="text-accent underline underline-offset-4 decoration-1 hover:text-danger transition-colors font-medium">
                        Tümünü Gör
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="flex flex-col border border-border">
                    {/* Row 1: 2 Categories (Symmetric) */}
                    <div className="grid grid-cols-2">
                        {COLLECTIONS_DATA.slice(0, 2).map((cat, i) => (
                            <Link href={`/collections/${cat.title.toLowerCase().replace(/ /g, '-')}`} key={i} className="group relative aspect-[3/4] md:aspect-square bg-white border-r last:border-r-0 border-border overflow-hidden cursor-pointer block">
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full flex flex-col items-center text-center">
                                    <p className="text-white/80 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 font-medium">{cat.subtitle}</p>
                                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-tight text-center px-2">{cat.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Row 2: 2 Categories (Symmetric) */}
                    <div className="grid grid-cols-2 border-t border-border">
                        {COLLECTIONS_DATA.slice(2, 4).map((cat, i) => (
                            <Link href={cat.link || `/collections/${cat.title.toLowerCase().replace(/ /g, '-')}`} key={i} className="group relative aspect-[3/4] md:aspect-square bg-white border-r last:border-r-0 border-border overflow-hidden cursor-pointer block">
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full flex flex-col items-center text-center">
                                    <p className="text-white/80 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 font-medium">{cat.subtitle}</p>
                                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-tight text-center px-2">{cat.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Row 3: 2 Categories (Asymmetric 2:1 Ratio) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
                        {COLLECTIONS_DATA.slice(4, 6).map((cat, i) => {
                            const isBig = i === 0;
                            const colSpanClass = isBig ? 'md:col-span-2' : 'md:col-span-1';

                            return (
                                <Link href={`/collections/${cat.title.toLowerCase().replace(/ /g, '-')}`} key={i} className={`group relative aspect-square md:aspect-auto md:h-[500px] bg-white border-b md:border-b-0 md:border-r last:border-r-0 border-border overflow-hidden cursor-pointer block ${colSpanClass}`}>
                                    <Image
                                        src={cat.image}
                                        alt={cat.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className={`absolute bottom-0 left-0 p-8 text-white w-full flex flex-col items-center text-center ${isBig ? 'justify-end' : ''}`}>
                                        <p className="text-white/80 text-xs md:text-sm uppercase tracking-[0.3em] mb-2 font-medium">{cat.subtitle}</p>
                                        <h3 className={`${isBig ? 'text-4xl md:text-6xl' : 'text-3xl'} font-display uppercase tracking-tight`}>{cat.title}</h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Row 4: 3 Tiny Categories for Mobile & Desktop (Accessories, Headwear, Footwear) */}
                    <div className="grid grid-cols-3 border-t border-border">
                        {COLLECTIONS_DATA.slice(6, 9).map((cat, i) => (
                            <Link href={`/collections/${cat.title.toLowerCase().replace(/ /g, '-')}`} key={i} className="group relative aspect-[3/4] sm:aspect-square bg-white border-r last:border-r-0 border-border overflow-hidden cursor-pointer block">
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-0 left-0 p-2 sm:p-6 text-white w-full flex flex-col items-center text-center">
                                    <p className="hidden sm:block text-white/80 text-xs md:text-sm uppercase tracking-[0.3em] mb-2 font-medium">{cat.subtitle}</p>
                                    <h3 className="text-sm sm:text-2xl md:text-3xl font-display uppercase tracking-tight break-words px-1">{cat.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products / Yeni Sezon */}
            <section id="new-drops" className="py-24 bg-white border-y border-border">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-3xl md:text-5xl font-display text-primary-900 uppercase tracking-tighter">Yeni Sezon</h2>
                        <Link href="/new" className="text-accent underline underline-offset-4 decoration-1 hover:text-danger transition-colors font-medium">
                            Tümünü Gör
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>

                    {newSeasonProducts.length > 0 ? (
                        <NewSeasonGrid products={newSeasonProducts} />
                    ) : (
                        <div className="text-center py-20 text-accent-muted border border-border">
                            <p className="text-lg font-display uppercase tracking-widest">Henüz yeni sezon ürünü eklenmedi</p>
                            <p className="text-sm mt-2">Admin panelden ürünlere &quot;Yeni Sezon&quot; etiketi ekleyin</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Discover Teaser Entry Point */}
            <DiscoverTeaser />

            {/* Brand Value / Visual Loop Asymmetrical Carousel */}
            <PhilosophyCarousel />

        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NewSeasonGrid({ products }: { products: any[] }) {
    const count = products.length;

    // Ürün sayısına göre dinamik grid sınıfları
    const getGridClasses = (index: number, total: number): string => {
        if (total <= 2) {
            // 1-2 ürün: hepsi büyük
            return "col-span-1 row-span-2 border-r border-b border-border";
        }
        if (total <= 4) {
            // 3-4 ürün: ilki büyük, geri kalanlar normal
            if (index === 0) return "col-span-2 row-span-2 border-r border-b border-border";
            return "col-span-1 row-span-1 border-r border-b border-border";
        }
        if (total <= 6) {
            // 5-6 ürün: 0 büyük, 1-3 küçük, 4 büyük, 5 küçük
            if (index === 0) return "col-span-2 row-span-2 border-r border-b border-border";
            if (index === 4) return "col-span-2 row-span-2 border-r border-b border-border";
            return "col-span-1 row-span-1 border-r border-b border-border";
        }
        // 7+ ürün: tam asimetrik dağılım
        const patterns = [
            "col-span-2 row-span-2 border-r border-b border-border", // 0: Büyük sol üst
            "col-span-1 row-span-1 border-r border-b border-border", // 1
            "col-span-1 row-span-1 border-r border-b border-border", // 2
            "col-span-1 row-span-1 border-r border-b border-border", // 3
            "col-span-1 row-span-1 border-r border-b border-border", // 4
            "col-span-1 row-span-1 border-r border-b border-border", // 5
            "col-span-2 row-span-2 border-r border-b border-border", // 6: Büyük orta
            "col-span-1 row-span-1 border-r border-b border-border", // 7
            "col-span-1 row-span-1 border-r border-b border-border", // 8
            "col-span-1 row-span-1 border-r border-b border-border", // 9
        ];
        return patterns[index % patterns.length];
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-row-dense auto-rows-[240px] md:auto-rows-[400px] border-t border-l border-border mt-8">
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    {...product}
                    className={getGridClasses(index, count)}
                />
            ))}
        </div>
    );
}
