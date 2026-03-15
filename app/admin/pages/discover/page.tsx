"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Video, Package, MousePointerClick, CheckSquare, Save, Loader2, CheckCircle } from "lucide-react";
import SingleFileUploader from "@/components/admin/SingleFileUploader";

interface DiscoverSlide {
    id: string;
    video: string;
    title: string;
    subtitle: string;
    theme: string;
    productName: string;
    productPrice: string;
    productImage: string;
    productLink: string;
    textEffect: string;
}

interface EditorProduct {
    id: string;
    image: string;
    title: string;
    price: string;
    link: string;
    isLarge: boolean;
}

export default function DiscoverManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [slides, setSlides] = useState<DiscoverSlide[]>([]);
    const [editorProducts, setEditorProducts] = useState<EditorProduct[]>([]);

    useEffect(() => {
        fetch("/api/discover")
            .then(res => res.json())
            .then(data => {
                setIsActive(data.isActive ?? true);
                setSlides(data.slides ?? []);
                setEditorProducts(data.editorProducts ?? []);
            })
            .catch(err => console.error("Discover yüklenemedi:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/discover", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive, slides, editorProducts }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        );
    }

    // --- Slide Handlers ---
    const addSlide = () => {
        const newId = `slide-${Date.now()}`;
        setSlides([
            ...slides,
            {
                id: newId,
                video: "",
                title: "YENİ SLAYT",
                subtitle: "Alt Başlık",
                theme: "danger",
                productName: "Ürün Adı",
                productPrice: "₺0.00",
                productImage: "",
                productLink: "#",
                textEffect: "animate-police-strobe"
            }
        ]);
    };

    const removeSlide = (id: string) => {
        setSlides(slides.filter(s => s.id !== id));
    };

    const updateSlide = (id: string, field: keyof DiscoverSlide, value: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // --- Editor Product Handlers ---
    const addEditorProduct = () => {
        setEditorProducts([
            ...editorProducts,
            { id: `ep-${Date.now()}`, image: "", title: "Yeni Ürün", price: "₺0.00", link: "", isLarge: false }
        ]);
    };

    const removeEditorProduct = (id: string) => {
        setEditorProducts(editorProducts.filter(ep => ep.id !== id));
    };

    const updateEditorProduct = (id: string, field: keyof EditorProduct, value: string | boolean) => {
        setEditorProducts(editorProducts.map(ep => ep.id === id ? { ...ep, [field]: value } : ep));
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-widest text-white">Sokağın Ritmi</h1>
                    <p className="text-white/50 text-sm mt-1">/discover sayfasındaki tam ekran video akışını (TikTok stili) yönetin.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-[#111111] hover:bg-white/10 text-white border border-white/10 rounded-md font-medium transition-colors text-sm uppercase tracking-widest">
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-md font-bold transition-colors shadow-lg shadow-white/10 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                        {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
                    </button>
                </div>
            </div>

            {/* General Status */}
            <div className="bg-[#111111] border border-white/5 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-danger animate-pulse' : 'bg-gray-500'}`} />
                    <div>
                        <h3 className="font-bold text-lg text-white">Sayfa Yayında</h3>
                        <p className="text-xs text-white/40 mt-1 font-mono">Discover sayfası menülerde ve aramalarda gözüksün mü?</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-danger"></div>
                </label>
            </div>

            {/* Video Slides Section */}
            <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-blue-500" />
                        <div>
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Video Akışı (Slaytlar)</h2>
                            <p className="text-[10px] text-white/40 mt-1">Sayfa açıldığında yukarıdan aşağı kaydırılarak gezilen tam ekran hikayeler.</p>
                        </div>
                    </div>
                    <button
                        onClick={addSlide}
                        className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10"
                    >
                        <Plus className="w-4 h-4" /> Yeni Video Ekle
                    </button>
                </div>

                <div className="space-y-8">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="bg-[#050505] border border-white/10 rounded-xl p-6 relative group overflow-hidden">
                            {/* Silme Butonu */}
                            <button
                                onClick={() => removeSlide(slide.id)}
                                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white bg-danger/0 hover:bg-danger rounded-md transition-colors z-10"
                                title="Slaytı Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3 font-mono text-xs uppercase tracking-widest">
                                <span className="bg-white/10 text-white px-2 py-1 rounded">#{index + 1}</span> {slide.id}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Canlı Önizleme - Sol */}
                                <div className="lg:col-span-3">
                                    <h4 className="text-[10px] text-white/30 font-mono tracking-widest uppercase mb-2 text-center">Cep Telefonu Görünümü (Mockup)</h4>
                                    <div className="w-full aspect-[9/16] bg-[#111111] rounded-[2rem] border-8 border-[#222] relative overflow-hidden flex flex-col justify-center items-center">
                                        {/* Video Pseudo */}
                                        <div className="absolute inset-0 bg-neutral-900 z-0">
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10" />
                                        </div>

                                        {/* Center Text */}
                                        <div className="relative z-20 text-center px-4 w-full">
                                            <h3 className={`text-2xl font-black italic tracking-tighter uppercase mb-1 drop-shadow-md ${slide.textEffect}`}>{slide.title || "BAŞLIK"}</h3>
                                            <p className="text-[10px] uppercase font-mono tracking-widest text-white/70">{slide.subtitle || "Alt Başlık"}</p>
                                        </div>

                                        {/* Shop Bubble Bottom Left */}
                                        <div className="absolute bottom-6 left-4 right-12 z-20">
                                            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/5 rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                                                    {slide.productImage ? <Image src={slide.productImage} alt="" width={40} height={40} className="object-cover" /> : <Package className="w-4 h-4 opacity-30" />}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <p className="text-[9px] font-bold text-white truncate">{slide.productName || "Ürün Seçilmedi"}</p>
                                                    <p className="text-[8px] text-white/50 uppercase">{slide.productPrice}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Ayarları - Sağ */}
                                <div className="lg:col-span-9 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <SingleFileUploader
                                                value={slide.video}
                                                onChange={(url) => updateSlide(slide.id, "video", url)}
                                                accept="video/mp4,video/webm,video/quicktime"
                                                label="Video Dosyası (TikTok/Reels tarzı mp4)"
                                                placeholder="/videos/street-1.mp4"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Kombin Teması (Tema Rengi)</label>
                                            <select
                                                value={slide.theme}
                                                onChange={(e) => updateSlide(slide.id, "theme", e.target.value)}
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-danger text-sm font-mono"
                                            >
                                                <option value="danger">Danger Red (Kırmızı)</option>
                                                <option value="blue-600">Cyber Blue (Mavi)</option>
                                                <option value="purple-600">Night Purple (Mor)</option>
                                                <option value="zinc-400">Metal Zinc (Gri)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Ana Büyük Başlık</label>
                                            <input
                                                type="text"
                                                value={slide.title}
                                                onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-white/50 text-sm font-display tracking-widest uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">İkincil Alt Başlık</label>
                                            <input
                                                type="text"
                                                value={slide.subtitle}
                                                onChange={(e) => updateSlide(slide.id, "subtitle", e.target.value)}
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-white/50 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Yazı Efekti (Ana Başlık İçin)</label>
                                            <select
                                                value={slide.textEffect}
                                                onChange={(e) => updateSlide(slide.id, "textEffect", e.target.value)}
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-danger text-sm font-mono"
                                            >
                                                <option value="animate-police-strobe">Police Strobe (Mavi/Kırmızı Siren)</option>
                                                <option value="animate-glitch-text">Glitch (Bozuk Sinyal)</option>
                                                <option value="animate-neon-pulse">Neon Pulse (Yanıp Sönen Neon)</option>
                                                <option value="animate-ghost-fade">Ghost Fade (Hayalet Geçişi)</option>
                                                <option value="">Efekt Yok</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-[#0a0a0a] p-4 rounded-md border border-white/5">
                                        <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2"><MousePointerClick className="w-3 h-3" /> Bağlı Referans Ürün (Sepet Butonu İçin)</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={slide.productName}
                                                onChange={(e) => updateSlide(slide.id, "productName", e.target.value)}
                                                placeholder="Ürün Adı"
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-white/50 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={slide.productPrice}
                                                onChange={(e) => updateSlide(slide.id, "productPrice", e.target.value)}
                                                placeholder="₺ Fiyat"
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-white/50 text-sm"
                                            />
                                            <SingleFileUploader
                                                value={slide.productImage}
                                                onChange={(url) => updateSlide(slide.id, "productImage", url)}
                                                accept="image/*"
                                                placeholder="Ürün Görseli"
                                            />
                                            <input
                                                type="text"
                                                value={slide.productLink}
                                                onChange={(e) => updateSlide(slide.id, "productLink", e.target.value)}
                                                placeholder="Hedef Link ID (/product/xxx)"
                                                className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-white/50 text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Products Module */}
            <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-purple-500" />
                        <div>
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Editörün Seçimi (Kayan Grid)</h2>
                            <p className="text-[10px] text-white/40 mt-1">Videoların hemen altında kullanıcılara sunulan hızlı kombin ürünleri.</p>
                        </div>
                    </div>
                    <button
                        onClick={addEditorProduct}
                        className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10"
                    >
                        <Plus className="w-4 h-4" /> Ürün Ekle
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editorProducts.map((ep, index) => (
                        <div key={ep.id} className="bg-[#050505] border border-white/10 rounded-xl p-4 relative group">
                            <button
                                onClick={() => removeEditorProduct(ep.id)}
                                className="absolute -top-2 -right-2 p-1.5 text-white bg-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-16 bg-[#111111] rounded overflow-hidden shrink-0 border border-white/5">
                                    {ep.image ? <Image src={ep.image} alt="" width={48} height={64} className="object-cover w-full h-full" /> : null}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={ep.image}
                                        onChange={(e) => updateEditorProduct(ep.id, "image", e.target.value)}
                                        placeholder="Görsel URL veya yükleyin"
                                        className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1 rounded outline-none focus:border-white/50 text-[10px] font-mono block"
                                    />
                                    <div className="mt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (!file) return;
                                                    const fd = new FormData();
                                                    fd.append('files', file);
                                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const data = await res.json();
                                                    if (data.urls?.[0]) updateEditorProduct(ep.id, 'image', data.urls[0]);
                                                };
                                                input.click();
                                            }}
                                            className="text-[9px] text-white/30 hover:text-white uppercase tracking-widest font-bold transition-colors"
                                        >
                                            ↑ Görsel Yükle
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={ep.title}
                                        onChange={(e) => updateEditorProduct(ep.id, "title", e.target.value)}
                                        placeholder="Ürün Adı"
                                        className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1 rounded outline-none focus:border-white/50 text-xs block"
                                    />
                                    <input
                                        type="text"
                                        value={ep.price}
                                        onChange={(e) => updateEditorProduct(ep.id, "price", e.target.value)}
                                        placeholder="Fiyat"
                                        className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1 rounded outline-none focus:border-white/50 text-xs block"
                                    />
                                    <input
                                        type="text"
                                        value={ep.link || ""}
                                        onChange={(e) => updateEditorProduct(ep.id, "link", e.target.value)}
                                        placeholder="Ürün Linki (örn: /product/urun-slug)"
                                        className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1 rounded outline-none focus:border-white/50 text-xs block font-mono"
                                    />
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="accent-danger w-3 h-3"
                                            checked={ep.isLarge}
                                            onChange={(e) => updateEditorProduct(ep.id, "isLarge", e.target.checked)}
                                        />
                                        <span className="text-[10px] text-white/70 uppercase tracking-widest font-mono">Büyük Görsel (2 Sütun Kaplar)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
