"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORIES = ["T-Shirts", "Bottoms", "Outwear", "Heavy Jackets", "Knitwear", "Hoodies", "Denim Studio", "Accessories", "Headwear"];

export default function ProductNewPage() {
    const router = useRouter();

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
    const [images, setImages] = useState<string[]>([]);
    const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
    const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    // Flags
    const [badge, setBadge] = useState<"none" | "new" | "sale">("none");
    const [isNewSeason, setIsNewSeason] = useState(false);
    const [isBestSeller, setIsBestSeller] = useState(false);
    const [saving, setSaving] = useState(false);

    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "OS"];

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
                name,
                slug,
                category,
                price: parseFloat(price) || 0,
                oldPrice: oldPrice || undefined,
                description,
                images: images.filter(Boolean),
                colors: colors.filter(c => c.name),
                sizes,
                features: features.filter(Boolean),
                hoverImage,
                badge: badge === "none" ? undefined : badge,
                discountPercentage: parseInt(discountPercentage) || 0,
                isNewSeason,
                isBestSeller,
            };

            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error("Ürün kaydedilemedi");

            router.push("/admin/products");
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            alert("Bir hata oluştu!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Yeni Ürün</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Sisteme yeni bir ürün ekleyin
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Kaydediliyor..." : "Kaydet ve Ekle"}
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
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                    }}
                                    className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm"
                                    placeholder="e.g. Heavyweight Zip Hoodie"
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
                                    placeholder="heavyweight-zip-hoodie"
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
                                placeholder="Product description..."
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
                                    placeholder="1449.99"
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
                                    placeholder="1899.99"
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
                                    placeholder="20"
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
                </div>
            </form>
        </div>
    );
}
