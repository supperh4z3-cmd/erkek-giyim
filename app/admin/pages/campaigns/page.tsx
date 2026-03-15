"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Plus, Trash2, Link as LinkIcon, Megaphone, Eye, Loader2, CheckCircle } from "lucide-react";
import SingleFileUploader from "@/components/admin/SingleFileUploader";

// Mock data structure for Campaigns
interface LookbookItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

export default function CampaignsManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroSeason, setHeroSeason] = useState("");
    const [heroImage, setHeroImage] = useState("");
    const [heroFontFamily, setHeroFontFamily] = useState("font-display");
    const [heroAlignment, setHeroAlignment] = useState("text-center");
    const [heroTextGradient, setHeroTextGradient] = useState("bg-gradient-to-b from-white to-white/20");
    const [marqueeText, setMarqueeText] = useState("");

    const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>([]);

    useEffect(() => {
        fetch("/api/campaigns")
            .then(res => res.json())
            .then(data => {
                setIsActive(data.isActive ?? true);
                setHeroTitle(data.hero?.title ?? "");
                setHeroSubtitle(data.hero?.subtitle ?? "");
                setHeroSeason(data.hero?.season ?? "");
                setHeroImage(data.hero?.image ?? "");
                setHeroFontFamily(data.hero?.fontFamily ?? "font-display");
                setHeroAlignment(data.hero?.alignment ?? "text-center");
                setHeroTextGradient(data.hero?.textGradient ?? "bg-gradient-to-b from-white to-white/20");
                setMarqueeText(data.marqueeText ?? "");
                setLookbookItems(data.lookbook ?? []);
            })
            .catch(err => console.error("Kampanya yüklenemedi:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch("/api/campaigns", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isActive,
                    hero: { title: heroTitle, subtitle: heroSubtitle, season: heroSeason, image: heroImage, fontFamily: heroFontFamily, alignment: heroAlignment, textGradient: heroTextGradient },
                    marqueeText,
                    lookbook: lookbookItems,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            alert("Bir hata oluştu!");
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

    const addLookbookItem = () => {
        setLookbookItems([
            ...lookbookItems,
            { id: `lb-${Date.now()}`, title: "", description: "", image: "", link: "" }
        ]);
    };

    const updateLookbookItem = (id: string, field: keyof LookbookItem, value: string) => {
        setLookbookItems(lookbookItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeLookbookItem = (id: string) => {
        setLookbookItems(lookbookItems.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6 max-w-5xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Kampanya Yönetimi</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Kampanyalar Sayfası ve Lookbook Düzenleyici
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/campaigns" target="_blank" className="flex items-center gap-2 bg-white/10 text-white px-4 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors">
                        <Eye className="w-4 h-4" /> Önizleme
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                        {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Status Toggle */}
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Kampanya Durumu</h2>
                            <p className="text-xs text-white/40 mt-1 font-mono">Kampanyalar sayfası ziyaretçilere açık mı?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-danger"></div>
                            <span className="ml-3 text-sm font-bold uppercase tracking-widest text-white/80">{isActive ? 'Aktif' : 'Pasif'}</span>
                        </label>
                    </div>
                </div>

                {/* Hero Settings */}
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Megaphone className="w-5 h-5 text-danger" />
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Hero Bölümü Ayarları</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Metin İçeriği Sekmesi */}
                        <div className="space-y-6 bg-[#0a0a0a] border border-white/5 p-4 rounded-md">
                            <h3 className="text-white/40 text-xs font-mono tracking-widest uppercase mb-2">1. İçerik ve Metinler</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Ana Başlık</label>
                                    <input
                                        required
                                        type="text"
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-display"
                                    />
                                    <p className="text-[10px] text-white/30 font-mono">Satır atlamak için &lt;br/&gt; (örn: NEON&lt;br/&gt;NIGHTS) yazmanız gerekir, frontend parse edecektir.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Alt Başlık (Sezon / Tema Tanımı)</label>
                                    <input
                                        required
                                        type="text"
                                        value={heroSubtitle}
                                        onChange={(e) => setHeroSubtitle(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Damga Metni (Örn: Winter 26 Capsule)</label>
                                    <input
                                        required
                                        type="text"
                                        value={heroSeason}
                                        onChange={(e) => setHeroSeason(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tasarım Ayarları Sekmesi */}
                        <div className="space-y-6 bg-[#0a0a0a] border border-white/5 p-4 rounded-md relative">
                            <h3 className="text-white/40 text-xs font-mono tracking-widest uppercase mb-2">2. Görünüm (Tipografi & Renk)</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Yazı Tipi (Font Ailesi)</label>
                                    <select
                                        value={heroFontFamily}
                                        onChange={(e) => setHeroFontFamily(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger text-sm font-mono"
                                    >
                                        <option value="font-display">Display (Kalın, Brutal, NEON NIGHTS)</option>
                                        <option value="font-sans">Sans Serif (Klasik Düz)</option>
                                        <option value="font-mono">Monospace (Kod stili)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Yazı Rengi veya Gradient (Geçiş Efekti)</label>
                                    <select
                                        value={heroTextGradient}
                                        onChange={(e) => setHeroTextGradient(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger text-sm font-mono"
                                    >
                                        <option value="bg-gradient-to-b from-white to-white/20">Klasik Karanlık Beyaz (Gradient)</option>
                                        <option value="bg-gradient-to-b from-red-500 to-black">Agresif Kırmızı (Neon Gradient)</option>
                                        <option value="bg-gradient-to-b from-blue-500 to-black">Derin Mavi (Siber Gradient)</option>
                                        <option value="text-white">Sadece Saf Beyaz (Soluk renk yok)</option>
                                        <option value="text-danger">Sadece Kırmızı (Solid renk)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Konum (Metin Hizalaması)</label>
                                    <select
                                        value={heroAlignment}
                                        onChange={(e) => setHeroAlignment(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-danger text-sm font-mono"
                                    >
                                        <option value="text-center items-center justify-center">Merkez (Ortada)</option>
                                        <option value="text-left items-start justify-end pb-20 pl-10">Sol Alt Köşe (Agresif)</option>
                                        <option value="text-right items-end justify-start pt-20 pr-10">Sağ Üst Köşe (Modern)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Görsel ve Canlı Önizleme */}
                        <div className="md:col-span-2 space-y-2 mt-4">
                            <SingleFileUploader
                                value={heroImage}
                                onChange={setHeroImage}
                                accept="image/*"
                                label="Hero Arka Plan Görseli"
                                placeholder="/campaigns/hero-bg.jpg"
                            />

                            {/* Image Preview Engine */}
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 text-center mb-1">=== CANLI ÖNİZLEME ===</label>
                            <div className="w-full aspect-[21/9] bg-[#050505] rounded-xl border border-white/10 relative overflow-hidden flex shadow-2xl">
                                {heroImage ? (
                                    <div className="absolute inset-0 z-0">
                                        <Image src={heroImage} alt="Hero Preview" fill className="object-cover opacity-40 mix-blend-luminosity" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white/20 font-mono text-xs uppercase tracking-widest">Görsel Bekleniyor</span>
                                    </div>
                                )}

                                {/* Dynamic Text Wrapper matching frontend logic */}
                                <div className={`relative z-10 w-full h-full flex flex-col p-8 ${heroAlignment}`}>
                                    <p className="text-danger font-bold tracking-[0.5em] text-[8px] md:text-xs uppercase mb-4 flex items-center gap-4">
                                        <span className="w-8 h-px bg-danger hidden md:block"></span>
                                        {heroSeason}
                                        <span className="w-8 h-px bg-danger hidden md:block"></span>
                                    </p>

                                    <h3
                                        className={`text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none ${heroFontFamily} ${heroTextGradient.startsWith('bg-') ? heroTextGradient + ' text-transparent bg-clip-text' : heroTextGradient}`}
                                        dangerouslySetInnerHTML={{ __html: heroTitle.replace(/<br\/?>/gi, '<br/>') }}
                                    >
                                    </h3>
                                    <p className="mt-4 text-white/50 text-sm md:text-lg tracking-widest uppercase font-mono">
                                        {heroSubtitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marquee Settings */}
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 12l4-4m-4 4 4 4" /></svg>
                        <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Kayan Yazı Şeridi (Marquee)</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Şerit Metni (Boş bırakırsanız gizlenir)</label>
                            <input
                                type="text"
                                value={marqueeText}
                                onChange={(e) => setMarqueeText(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded-md outline-none focus:border-white transition-colors text-sm font-display tracking-widest uppercase text-xl"
                                placeholder="NO COMPROMISE vb."
                            />
                        </div>

                        {/* Kayan Yazı Önizlemesi */}
                        <div className="w-full py-6 mt-4 bg-[#050505] border-y border-white/10 overflow-hidden relative group">
                            <div className="whitespace-nowrap flex text-white/20 text-5xl font-display font-black uppercase tracking-tighter pointer-events-none">
                                <span className="mx-8">{marqueeText || "METIN YOK"}</span>
                                <span className="mx-8">{marqueeText || "METIN YOK"}</span>
                                <span className="mx-8">{marqueeText || "METIN YOK"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lookbook Items */}
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <Megaphone className="w-5 h-5 text-blue-500" />
                            <h2 className="font-bold text-sm uppercase tracking-widest text-white/80">Lookbook İçerikleri</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addLookbookItem}
                            className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10"
                        >
                            <Plus className="w-4 h-4" /> Yeni Ekle
                        </button>
                    </div>

                    <div className="space-y-4">
                        {lookbookItems.map((item, index) => (
                            <div key={item.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 flex flex-col md:flex-row gap-6 relative group">
                                <button
                                    type="button"
                                    onClick={() => removeLookbookItem(item.id)}
                                    className="absolute top-2 right-2 p-2 text-white/30 hover:text-danger bg-black/50 rounded-md transition-colors opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Image Preview */}
                                <div className="w-full md:w-48 aspect-[3/4] bg-[#111111] rounded-md border border-white/5 relative overflow-hidden shrink-0">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.title || "Preview"} fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                            <ImageIcon />
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-white/50 font-mono text-xs uppercase tracking-widest">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">#{index + 1}</span> {item.id}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Başlık</label>
                                            <input
                                                required
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateLookbookItem(item.id, "title", e.target.value)}
                                                className="w-full bg-[#111111] border border-white/5 text-white px-3 py-2 rounded-md outline-none focus:border-white/30 transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <SingleFileUploader
                                                value={item.image}
                                                onChange={(url) => updateLookbookItem(item.id, "image", url)}
                                                accept="image/*"
                                                label="Görsel"
                                                placeholder="/campaigns/lookbook.jpg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono uppercase tracking-widest text-white/50">Açıklama</label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={item.description}
                                            onChange={(e) => updateLookbookItem(item.id, "description", e.target.value)}
                                            className="w-full bg-[#111111] border border-white/5 text-white px-3 py-2 rounded-md outline-none focus:border-white/30 transition-colors text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono uppercase tracking-widest text-white/50 flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" /> Yönlendirme Linki
                                        </label>
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={(e) => updateLookbookItem(item.id, "link", e.target.value)}
                                            className="w-full bg-[#111111] border border-white/5 text-white px-3 py-2 rounded-md outline-none focus:border-white/30 transition-colors text-sm font-mono"
                                            placeholder="/product/my-product-slug"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {lookbookItems.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-[#0a0a0a]">
                            <p className="text-white/40 font-mono text-sm">Henüz lookbook öğesi eklenmemiş.</p>
                            <button
                                type="button"
                                onClick={addLookbookItem}
                                className="mt-4 text-xs font-mono uppercase tracking-widest text-white/80 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors bg-white/10 px-4 py-2 rounded-md hover:bg-white/20"
                            >
                                <Plus className="w-4 h-4" /> İlk Öğeyi Ekle
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

// Minimal placeholder icon fallback
function ImageIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
    )
}
