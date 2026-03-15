// ─── PRODUCT DATA (CMS-Ready: ileride API/DB'den gelecek) ─── //

export interface ProductColor {
    name: string;
    hex: string;
}

export interface ProductSize {
    size: string;
    stock: number;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    oldPrice?: number;
    oldPriceFormatted?: string;
    description: string;
    colors: ProductColor[];
    sizes: ProductSize[];
    images: string[];
    hoverImage?: string;
    badge?: "new" | "sale";
    discountPercentage?: number;
    features: string[];
    isNewSeason?: boolean;
    isBestSeller?: boolean;
    totalStock?: number;
}

export const ALL_PRODUCTS: Product[] = [
    {
        id: "prod-1",
        slug: "vintage-washed-oversized-tshirt",
        name: "Vintage Washed Oversized T-Shirt",
        category: "T-Shirts",
        price: 699,
        priceFormatted: "₺699.00",
        description: "Ağır gramaj %100 pamuk kumaştan üretilen, vintage yıkama efektli oversize tişört. Serbest kalıp ve düşük omuz detayı ile sokak stilinin vazgeçilmezi.",
        colors: [
            { name: "Vintage Ash", hex: "#9ca3af" },
            { name: "Washed Black", hex: "#1f2937" },
        ],
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 20 }, { size: "XL", stock: 5 }],
        images: ["/category-tshirts.png", "/category-outwear.png", "/product-hoodie.png", "/product-cargo.png"],
        hoverImage: "/category-outwear.png",
        badge: "new",
        isNewSeason: true,
        isBestSeller: true,
        features: ["280gsm %100 Pamuk", "Vintage Yıkama Efekti", "Oversize Kalıp", "Düşük Omuz Detayı", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-2",
        slug: "heavyweight-zip-up-hoodie",
        name: "Heavyweight Zip-Up Hoodie",
        category: "Outwear",
        price: 1399,
        priceFormatted: "₺1399.00",
        description: "450gsm ultra-heavyweight cotton. Tasarımın kalbinde yatan asimetrik kesim ve premium metalik fermuar detayları. Yıkamalı (washed) efekti sayesinde her ürün tamamen benzersizdir. Sokak kültürünün en saf halini yansıtan oversize (geniş) kalıp.",
        colors: [
            { name: "Vintage Ash", hex: "#9ca3af" },
            { name: "Washed Black", hex: "#1f2937" },
            { name: "Blood Red", hex: "#7f1d1d" },
        ],
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 20 }, { size: "XL", stock: 5 }],
        images: ["/product-zipup.png", "/product-hoodie.png", "/product-utility.png", "/category-outwear.png"],
        hoverImage: "/product-cargo.png",
        isBestSeller: true,
        features: ["450gsm %100 Pamuk", "Vintage Yıkama Efekti", "Çift Kürsörlü Metal Fermuar", "Genişletilmiş Kapüşon", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-3",
        slug: "utility-cargo-pants",
        name: "Utility Cargo Pants",
        category: "Bottoms",
        price: 1599,
        priceFormatted: "₺1599.00",
        description: "Askeri estetiğin modern yorumu. Çoklu cep detayı, ayarlanabilir paça manşetleri ve dayanıklı kumaş yapısıyla fonksiyonellik ve tarzı birleştiren kargo pantolon.",
        colors: [
            { name: "Washed Black", hex: "#1f2937" },
            { name: "Military Olive", hex: "#4a5d3a" },
        ],
        sizes: [{ size: "28/S", stock: 10 }, { size: "30/M", stock: 15 }, { size: "32/L", stock: 20 }, { size: "34/XL", stock: 5 }],
        images: ["/category-bottoms.png", "/product-utility.png", "/product-hoodie.png", "/category-outwear.png"],
        features: ["Ripstop Kumaş", "6 Cepli Tasarım", "Ayarlanabilir Paça", "Rahat Kesim", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-4",
        slug: "distressed-denim-jacket",
        name: "Distressed Denim Jacket",
        category: "Denim Studio",
        price: 2199,
        priceFormatted: "₺2199.00",
        description: "El yapımı yıpratma detayları ve vintage yıkama ile karakter kazandırılmış premium denim ceket. Klasik oversize kesim, metal düğme aksesuarları.",
        colors: [
            { name: "Dark Indigo", hex: "#1e3a5f" },
            { name: "Light Wash", hex: "#7ca5c7" },
        ],
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 20 }, { size: "XL", stock: 5 }],
        images: ["/category-denim.png", "/product-hoodie.png", "/product-cargo.png", "/category-outwear.png"],
        hoverImage: "/product-hoodie.png",
        badge: "sale",
        discountPercentage: 15,
        isNewSeason: true,
        isBestSeller: true,
        features: ["Premium Denim", "El Yapımı Distress", "Metal Düğmeler", "Oversize Kalıp", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-5",
        slug: "signature-knit-sweater",
        name: "Signature Knit Sweater",
        category: "Knitwear",
        price: 1899,
        priceFormatted: "₺1899.00",
        description: "Örgü kalıplarla bezeli, premium yün karışımlı triko. Hafif oversize kesim ve ribana detayları ile sezonun en çok aranan parçası.",
        colors: [
            { name: "Cream", hex: "#f5f0e8" },
            { name: "Charcoal", hex: "#333333" },
        ],
        sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 20 }, { size: "XL", stock: 5 }],
        images: ["/category-knitwear.png", "/product-hoodie.png", "/product-hoodie.png", "/category-outwear.png"],
        isNewSeason: true,
        features: ["Yün Karışımlı", "Premium Örgü", "Ribana Detay", "Hafif Oversize Kalıp", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-6",
        slug: "monogram-wool-beanie",
        name: "Monogram Wool Beanie",
        category: "Headwear",
        price: 449,
        priceFormatted: "₺449.00",
        description: "Sıcak tutan yün karışımlı bere. Marka monogramı işlemeli, kışın vazgeçilmez aksesuarı.",
        colors: [
            { name: "Black", hex: "#0a0a0a" },
            { name: "Grey", hex: "#6b7280" },
        ],
        sizes: [{ size: "Tek Beden", stock: 50 }],
        images: ["/category-headwear.png", "/product-hoodie.png", "/product-cargo.png", "/category-outwear.png"],
        features: ["Yün Karışımlı", "İşlemeli Monogram", "Tek Beden", "Türkiye'de Üretilmiştir"],
    },
    {
        id: "prod-7",
        slug: "chunky-leather-boots",
        name: "Chunky Leather Boots",
        category: "Footwear",
        price: 3499,
        priceFormatted: "₺3499.00",
        description: "Kalın tabanlı, gerçek deri bot. Agresif taban yapısı ve metal halka detaylarıyla drill estetiğinin ayakaltı karşılığı.",
        colors: [
            { name: "Jet Black", hex: "#0a0a0a" },
        ],
        sizes: [{ size: "40", stock: 10 }, { size: "41", stock: 15 }, { size: "42", stock: 20 }, { size: "43", stock: 5 }, { size: "44", stock: 5 }],
        images: ["/category-footwear.png", "/product-utility.png", "/product-hoodie.png", "/category-outwear.png"],
        isNewSeason: true,
        isBestSeller: true,
        features: ["Gerçek Deri", "Kalın Platform Taban", "Metal Halka Detay", "Su Geçirmez", "İtalya'da Üretilmiştir"],
    },
    {
        id: "prod-8",
        slug: "silver-link-chain",
        name: "Silver Link Chain",
        category: "Accessories",
        price: 899,
        priceFormatted: "₺899.00",
        description: "925 ayar gümüş kaplama zincir kolye. Kalın halka tasarımı ile sokak stiline premium bir dokunuş.",
        colors: [
            { name: "Silver", hex: "#c0c0c0" },
        ],
        sizes: [{ size: "50cm", stock: 10 }, { size: "60cm", stock: 15 }],
        images: ["/category-accessories.png", "/product-hoodie.png", "/product-cargo.png", "/category-outwear.png"],
        features: ["925 Ayar Gümüş Kaplama", "Kalın Halka Tasarım", "Paslanmaz Çelik Gövde", "Ayarlanabilir Kilit"],
    },
];

// Helper: slug ile ürün bulma
export function getProductBySlug(slug: string): Product | undefined {
    return ALL_PRODUCTS.find(p => p.slug === slug);
}

// Helper: id ile ürün bulma
export function getProductById(id: string): Product | undefined {
    return ALL_PRODUCTS.find(p => p.id === id);
}

// Helper: benzer ürünler (aynı kategori, kendisi hariç)
export function getRecommendedProducts(currentId: string, limit = 6): Product[] {
    const current = ALL_PRODUCTS.find(p => p.id === currentId);
    if (!current) return ALL_PRODUCTS.slice(0, limit);

    const sameCategory = ALL_PRODUCTS.filter(p => p.id !== currentId && p.category === current.category);
    const others = ALL_PRODUCTS.filter(p => p.id !== currentId && p.category !== current.category);

    return [...sameCategory, ...others].slice(0, limit);
}
