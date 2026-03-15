"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle, Loader2, History, PackagePlus } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORIES = ["T-Shirts", "Bottoms", "Outwear", "Heavy Jackets", "Knitwear", "Hoodies", "Denim Studio", "Accessories", "Headwear"];

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("T-Shirts");
    const [price, setPrice] = useState("");
    const [oldPrice, setOldPrice] = useState("");
    const [description, setDescription] = useState("");
    const [hoverImage, setHoverImage] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");

    // Arrays
    const [images, setImages] = useState<string[]>([""]);
    const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
    const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    // Flags
    const [badge, setBadge] = useState<"none" | "new" | "sale">("none");
    const [isNewSeason, setIsNewSeason] = useState(false);
    const [isBestSeller, setIsBestSeller] = useState(false);
    const [saving, setSaving] = useState(false);

    // Stock History
    const [stockHistory, setStockHistory] = useState<{ id: string; variant: string | null; change: number; reason: string; created_at: string }[]>([]);
    const [showStockForm, setShowStockForm] = useState(false);
    const [stockForm, setStockForm] = useState({ variant: "", change: "", reason: "" });
    const [savingStock, setSavingStock] = useState(false);

    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "OS"];

    useEffect(() => {
        fetch(`/api/products/${productId}`)
            .then(res => {
                if (!res.ok) throw new Error("not found");
                return res.json();
            })
            .then(product => {
                setName(product.name || "");
                setSlug(product.slug || "");
                setCategory(product.category || "T-Shirts");
                setPrice(product.price?.toString() || "");
                setOldPrice(product.oldPrice?.toString() || "");
                setDescription(product.description || "");
                setHoverImage(product.hoverImage || "");
                setDiscountPercentage(product.discountPercentage?.toString() || "");
                setImages(product.images?.length > 0 ? product.images : [""]);
                // Colors
                if (product.colors?.length > 0) {
                    setColors(product.colors);
                }
                // Sizes
                if (product.sizes) {
                    const mappedSizes = product.sizes.map((s: string | { size: string; stock: number }) => {
                        if (typeof s === 'string') return { size: s, stock: 10 };
                        return s;
                    });
                    setSizes(mappedSizes);
                }
                // Features
                if (product.features?.length > 0) {
                    setFeatures(product.features);
                }
                setBadge(product.badge || "none");
                setIsNewSeason(!!product.isNewSeason);
                setIsBestSeller(!!product.isBestSeller);
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [productId]);

    // Fetch stock history
    useEffect(() => {
        if (!productId) return;
        fetch(`/api/stock-history?product_id=${productId}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setStockHistory(data); })
            .catch(console.error);
    }, [productId]);

    const toggleSize = (size: string) => {
        if (sizes.some(s => s.size === size)) {
            setSizes(sizes.filter(s => s.size !== size));
        } else {
            setSizes([...sizes, { size, stock: 10 }]);
        }
    };

    const updateStock = (size: string, stock: number) => {
        setSizes(sizes.map(s => s.size === size ? { ...s, stock } : s));
    };

    const addColor = () => {
        setColors([...colors, { name: "", hex: "#000000" }]);
    };

    const updateColor = (index: number, field: "name" | "hex", value: string) => {
        const newColors = [...colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setColors(newColors);
    };

    const removeColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        setFeatures([...features, ""]);
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const productData = {
                name, slug, category,
                price: parseFloat(price) || 0,
                oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
                description,
                images: images.filter(Boolean),
                colors: colors.filter(c => c.name),
                sizes,
                features: features.filter(Boolean),
                hoverImage,
                badge: badge === "none" ? undefined : badge,
                discountPercentage: parseInt(discountPercentage) || 0,
                isNewSeason, isBestSeller,
            };

            const res = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error("Ürün güncellenemedi");

            router.push("/admin/products");
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            alert("Bir hata oluştu!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
        </div>
    );

    if (notFound) return (
        <div className="text-danger flex flex-col items-center justify-center p-20 gap-4">
            <AlertTriangle className="w-12 h-12" />
            <h2 className="font-display text-2xl uppercase tracking-tighter">Ürün Bulunamadı</h2>
            <Link href="/admin/products" className="text-white border px-4 py-2 mt-4 hover:bg-white/10 transition">Sisteme Geri Dön</Link>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Ürünü Düzenle</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            ID: {productId}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Temel Bilgiler</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Ürün Adı</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Bağlantı Kodu (Slug)</label>
                                <input
                                    required
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm cursor-pointer"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Ürün Açıklaması</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Fiyatlandırma</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Fiyat (₺)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Eski Fiyat (İsteğe Bağlı)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={oldPrice}
                                    onChange={(e) => setOldPrice(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">İndirim % (İsteğe Bağlı)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <ImageUploader
                            images={images}
                            onChange={setImages}
                            maxFiles={10}
                            label="Ürün Görselleri"
                        />

                        {/* Hover Image */}
                        <div className="border-t border-white/5 pt-4 space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Hover Görseli (İsteğe Bağlı)</label>
                            <input
                                type="text"
                                value={hoverImage}
                                onChange={(e) => setHoverImage(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                placeholder="/products/hover-image.png"
                            />
                            <p className="text-[10px] text-white/30 font-mono">Ürün kartında üzerine gelindiğinde gösterilecek görsel</p>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Renk Seçenekleri</h2>
                            <button
                                type="button"
                                onClick={addColor}
                                className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Renk Ekle
                            </button>
                        </div>

                        {colors.length === 0 ? (
                            <p className="text-xs text-white/30 font-mono text-center py-4">Henüz renk eklenmedi. &quot;Renk Ekle&quot; butonuna tıklayın.</p>
                        ) : (
                            <div className="space-y-3">
                                {colors.map((color, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={color.hex}
                                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer border border-white/10 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={color.name}
                                            onChange={(e) => updateColor(index, "name", e.target.value)}
                                            className="flex-1 bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm"
                                            placeholder="Renk adı (ör: Siyah)"
                                        />
                                        <input
                                            type="text"
                                            value={color.hex}
                                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                                            className="w-28 bg-[#0a0a0a] border border-white/10 text-white px-3 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-xs font-mono"
                                            placeholder="#000000"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeColor(index)}
                                            className="p-2.5 text-white/40 hover:text-danger bg-white/5 hover:bg-danger/10 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Ürün Özellikleri</h2>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Özellik Ekle
                            </button>
                        </div>

                        {features.length === 0 ? (
                            <p className="text-xs text-white/30 font-mono text-center py-4">Henüz özellik eklenmedi. &quot;Özellik Ekle&quot; butonuna tıklayın.</p>
                        ) : (
                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="text-xs text-white/30 font-mono w-6 text-center">{index + 1}</span>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            className="flex-1 bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm"
                                            placeholder="Özellik açıklaması (ör: %100 Pamuk)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2.5 text-white/40 hover:text-danger bg-white/5 hover:bg-danger/10 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Organization & Badges */}
                <div className="space-y-8">
                    {/* Status & Badges */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Durum ve Etiketler</h2>

                        <div className="flex flex-col gap-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Yeni Sezon Etiketi</span>
                                <input
                                    type="checkbox"
                                    checked={isNewSeason}
                                    onChange={(e) => setIsNewSeason(e.target.checked)}
                                    className="w-4 h-4 accent-danger bg-[#0a0a0a] border-white/10 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Çok Satanlar Etiketi</span>
                                <input
                                    type="checkbox"
                                    checked={isBestSeller}
                                    onChange={(e) => setIsBestSeller(e.target.checked)}
                                    className="w-4 h-4 accent-danger bg-[#0a0a0a] border-white/10 rounded"
                                />
                            </label>

                            <hr className="border-white/5 my-2" />

                            <div className="space-y-3">
                                <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Köşe Rozeti</label>
                                <div className="flex bg-[#0a0a0a] border border-white/10 rounded-md p-1">
                                    {(["none", "new", "sale"] as const).map(b => (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() => setBadge(b)}
                                            className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors ${badge === b ? 'bg-white text-black' : 'text-white/40 hover:text-white/80'}`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Beden Seçenekleri</h2>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(size => {
                                const sizeObj = sizes.find(s => s.size === size);
                                const isSelected = !!sizeObj;

                                return (
                                    <div key={size} className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`w-12 h-12 flex items-center justify-center border font-mono text-sm transition-all duration-300 ${isSelected ? 'border-primary-900 bg-white text-primary-900 font-bold' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                                        >
                                            {size}
                                        </button>
                                        {isSelected && (
                                            <input
                                                type="number"
                                                min="0"
                                                value={sizeObj.stock}
                                                onChange={(e) => updateStock(size, parseInt(e.target.value) || 0)}
                                                className="w-12 bg-[#0a0a0a] border border-white/20 text-white px-1 py-1 rounded text-center text-xs font-mono outline-none focus:border-danger transition-colors"
                                                title={`${size} stok miktarı`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Preview */}
                    {colors.length > 0 && (
                        <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-4">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80 border-b border-white/5 pb-4">Renk Önizleme</h2>
                            <div className="flex flex-wrap gap-3">
                                {colors.filter(c => c.name).map((color, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                                        <span className="text-xs text-white/60">{color.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock History */}
                    <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-500" />
                                <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Stok Geçmişi</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowStockForm(!showStockForm)}
                                className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <PackagePlus className="w-3 h-3" /> Manuel Giriş
                            </button>
                        </div>

                        {/* Manual Stock Entry Form */}
                        {showStockForm && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Varyant</label>
                                        <input
                                            type="text"
                                            value={stockForm.variant}
                                            onChange={e => setStockForm({ ...stockForm, variant: e.target.value })}
                                            placeholder="ör: M / Siyah"
                                            className="w-full bg-[#0a0a0a] border border-white/10 text-white px-3 py-2 rounded-md text-xs font-mono outline-none focus:border-danger"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Değişim (+/-)</label>
                                        <input
                                            type="number"
                                            value={stockForm.change}
                                            onChange={e => setStockForm({ ...stockForm, change: e.target.value })}
                                            placeholder="+10 veya -5"
                                            className="w-full bg-[#0a0a0a] border border-white/10 text-white px-3 py-2 rounded-md text-xs font-mono outline-none focus:border-danger"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Sebep</label>
                                    <input
                                        type="text"
                                        value={stockForm.reason}
                                        onChange={e => setStockForm({ ...stockForm, reason: e.target.value })}
                                        placeholder="ör: Yeni mal girişi"
                                        className="w-full bg-[#0a0a0a] border border-white/10 text-white px-3 py-2 rounded-md text-xs font-mono outline-none focus:border-danger"
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={savingStock || !stockForm.change}
                                    onClick={async () => {
                                        setSavingStock(true);
                                        try {
                                            const res = await fetch("/api/stock-history", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    product_id: productId,
                                                    variant: stockForm.variant || null,
                                                    change: Number(stockForm.change),
                                                    reason: stockForm.reason || "Manuel düzenleme",
                                                }),
                                            });
                                            if (res.ok) {
                                                const newEntry = await res.json();
                                                setStockHistory(prev => [newEntry, ...prev]);
                                                setStockForm({ variant: "", change: "", reason: "" });
                                                setShowStockForm(false);
                                            }
                                        } catch (err) {
                                            console.error("Stok girişi hatası:", err);
                                        } finally {
                                            setSavingStock(false);
                                        }
                                    }}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {savingStock ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                    Kaydet
                                </button>
                            </div>
                        )}

                        {/* History List */}
                        {stockHistory.length === 0 ? (
                            <p className="text-xs text-white/30 font-mono text-center py-4">Henüz stok kaydı yok</p>
                        ) : (
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {stockHistory.map(entry => (
                                    <div key={entry.id} className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                            entry.change > 0
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        }`}>
                                            {entry.change > 0 ? `+${entry.change}` : entry.change}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-white/70 truncate">{entry.reason || "—"}</div>
                                            {entry.variant && <span className="text-[10px] text-white/30 font-mono">{entry.variant}</span>}
                                        </div>
                                        <span className="text-[10px] font-mono text-white/20 shrink-0">
                                            {new Date(entry.created_at).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
