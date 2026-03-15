"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Search, Eye, Globe, Plus, Trash2, GripVertical, ExternalLink, Info } from "lucide-react";

interface SeoEntry {
    title: string;
    description: string;
}

interface SitelinkItem {
    label: string;
    url: string;
    description: string;
}

const PAGES = [
    { key: "home", label: "Anasayfa", path: "/" },
    { key: "discover", label: "Sokağın Ritmi", path: "/discover" },
    { key: "campaigns", label: "Kampanyalar", path: "/campaigns" },
    { key: "new", label: "Yeni Gelenler", path: "/new" },
    { key: "collections", label: "Tüm Koleksiyonlar", path: "/collections" },
    { key: "contact", label: "İletişim", path: "/contact" },
];

const DEFAULT_SITELINKS: SitelinkItem[] = [
    { label: "Sokağın Ritmi", url: "/discover", description: "En yeni street style trendleri ve ilham veren koleksiyonlar." },
    { label: "Kampanyalar", url: "/campaigns", description: "Özel indirimler, sezon sonu fırsatları ve kampanya detayları." },
    { label: "Yeni Gelenler", url: "/new", description: "Bu sezonun en yeni ürünleri ve koleksiyonları." },
    { label: "Tüm Koleksiyonlar", url: "/collections", description: "Tüm kategorileri keşfedin: mont, sweatshirt, pantolon ve daha fazlası." },
    { label: "İletişim", url: "/contact", description: "Bize ulaşın, sorularınızı yanıtlayalım." },
];

export default function SeoManagementPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<"pages" | "sitelinks">("pages");
    const [seoData, setSeoData] = useState<Record<string, SeoEntry>>({});
    const [sitelinks, setSitelinks] = useState<SitelinkItem[]>(DEFAULT_SITELINKS);

    useEffect(() => {
        fetch("/api/seo")
            .then(r => r.json())
            .then(data => {
                const merged: Record<string, SeoEntry> = {};
                for (const page of PAGES) {
                    merged[page.key] = {
                        title: data[page.key]?.title || "",
                        description: data[page.key]?.description || "",
                    };
                }
                setSeoData(merged);
                if (data._sitelinks && Array.isArray(data._sitelinks)) {
                    setSitelinks(data._sitelinks);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/seo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...seoData, _sitelinks: sitelinks }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("SEO kaydetme hatası:", err);
        } finally {
            setSaving(false);
        }
    };

    const updateSeo = (key: string, field: keyof SeoEntry, value: string) => {
        setSeoData(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const updateSitelink = (idx: number, field: keyof SitelinkItem, value: string) => {
        const newLinks = [...sitelinks];
        newLinks[idx] = { ...newLinks[idx], [field]: value };
        setSitelinks(newLinks);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        );
    }

    const homeEntry = seoData["home"] || { title: "", description: "" };
    const homeTitle = homeEntry.title || "CHASE & CHAIN — Premium Streetwear";
    const homeDesc = homeEntry.description || "Premium streetwear koleksiyonları. Erkek giyim, sokak modası ve daha fazlası.";

    return (
        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display uppercase tracking-widest text-white">SEO Yönetimi</h1>
                    <p className="text-white/40 text-xs lg:text-sm mt-1">Sayfa meta verileri ve Google arama sonuçları yapılandırması</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-200 text-black rounded-md font-bold transition-colors shadow-lg shadow-white/10 text-xs uppercase tracking-widest disabled:opacity-50 shrink-0"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                    {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Kaydet"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-1 w-fit">
                <button
                    onClick={() => setActiveTab("pages")}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${activeTab === "pages" ? "bg-white text-black" : "text-white/40 hover:text-white/60"}`}
                >
                    <Search className="w-3 h-3" />
                    Sayfa Meta Verileri
                </button>
                <button
                    onClick={() => setActiveTab("sitelinks")}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${activeTab === "sitelinks" ? "bg-white text-black" : "text-white/40 hover:text-white/60"}`}
                >
                    <ExternalLink className="w-3 h-3" />
                    Google Sitelinks
                </button>
            </div>

            {/* ═══ SAYFA META VERİLERİ ═══ */}
            {activeTab === "pages" && (
                <div className="space-y-4">
                    {PAGES.map(page => {
                        const entry = seoData[page.key] || { title: "", description: "" };
                        const previewTitle = entry.title || `${page.label} — CHASE & CHAIN`;
                        const previewDesc = entry.description || "Sayfa açıklaması burada görünecek...";

                        return (
                            <div key={page.key} className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden">
                                {/* Page Header */}
                                <div className="border-b border-white/[0.04] px-4 lg:px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-sm font-bold text-white uppercase tracking-widest">{page.label}</span>
                                        <span className="text-[10px] text-white/20 font-mono hidden sm:inline">{page.path}</span>
                                    </div>
                                    <a href={page.path} target="_blank" className="text-white/20 hover:text-white transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </a>
                                </div>

                                <div className="p-4 lg:p-6 space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/40 uppercase tracking-widest">Meta Title</label>
                                            <input
                                                type="text"
                                                value={entry.title}
                                                onChange={(e) => updateSeo(page.key, "title", e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-emerald-500/50 text-sm"
                                                placeholder={`${page.label} — CHASE & CHAIN`}
                                                maxLength={70}
                                            />
                                            <div className="flex justify-between">
                                                <span className="text-[10px] text-white/20 font-mono">Önerilen: 50-60 karakter</span>
                                                <span className={`text-[10px] font-mono ${entry.title.length > 60 ? "text-danger" : "text-white/20"}`}>
                                                    {entry.title.length}/70
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/40 uppercase tracking-widest">Meta Description</label>
                                            <textarea
                                                value={entry.description}
                                                onChange={(e) => updateSeo(page.key, "description", e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded-md outline-none focus:border-emerald-500/50 text-sm resize-none"
                                                placeholder="Sayfa açıklaması..."
                                                rows={2}
                                                maxLength={160}
                                            />
                                            <div className="flex justify-between">
                                                <span className="text-[10px] text-white/20 font-mono">Önerilen: 120-155 karakter</span>
                                                <span className={`text-[10px] font-mono ${entry.description.length > 155 ? "text-danger" : "text-white/20"}`}>
                                                    {entry.description.length}/160
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Google Preview */}
                                    <div className="bg-white rounded-lg p-4 mt-2">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-[11px] text-gray-500 font-mono">chaseandchain.com{page.path}</span>
                                        </div>
                                        <h3 className="text-[#1a0dab] text-base font-medium leading-tight hover:underline cursor-pointer">
                                            {previewTitle}
                                        </h3>
                                        <p className="text-[#545454] text-[13px] mt-1 line-clamp-2 leading-relaxed">
                                            {previewDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ GOOGLE SITELINKS ═══ */}
            {activeTab === "sitelinks" && (
                <div className="space-y-6">
                    {/* Info Box */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-white/70 leading-relaxed">
                                <strong className="text-white">Google Sitelinks</strong>, arama sonuçlarında sitenizin altında görünen kısa yol bağlantılarıdır.
                                Google bu bağlantıları yapılandırılmış veri (structured data) ile belirlere, ancak gösterip göstermeme kararı Google&apos;a aittir.
                            </p>
                            <p className="text-xs text-white/40 mt-2">
                                Aşağıda belirlediğiniz linkler sitenizin JSON-LD yapısına eklenir ve Google&apos;ın sitelinks olarak göstermesini teşvik eder.
                            </p>
                        </div>
                    </div>

                    {/* Google Preview with Sitelinks */}
                    <div className="bg-white rounded-xl p-5 space-y-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Google Önizleme</p>

                        {/* Main Result */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                    <span className="text-white text-[8px] font-black italic">C&C</span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-gray-700 font-medium block leading-tight">Chase & Chain</span>
                                    <span className="text-[10px] text-gray-500 font-mono">chaseandchain.com</span>
                                </div>
                            </div>
                            <h3 className="text-[#1a0dab] text-lg font-medium leading-tight hover:underline cursor-pointer mt-1">
                                {homeTitle}
                            </h3>
                            <p className="text-[#545454] text-[13px] mt-1 leading-relaxed">
                                {homeDesc}
                            </p>
                        </div>

                        {/* Sitelinks Grid */}
                        {sitelinks.filter(s => s.label && s.url).length > 0 && (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-3 pt-3 border-t border-gray-100">
                                {sitelinks.filter(s => s.label && s.url).map((link, i) => (
                                    <div key={i} className="py-1">
                                        <a className="text-[#1a0dab] text-sm font-medium hover:underline cursor-pointer block">
                                            {link.label}
                                        </a>
                                        {link.description && (
                                            <p className="text-[#545454] text-[11px] mt-0.5 leading-relaxed line-clamp-2">{link.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sitelink Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sitelink Bağlantıları</h3>
                            <span className="text-[10px] text-white/20 font-mono">{sitelinks.length}/8 link</span>
                        </div>

                        {sitelinks.map((link, idx) => (
                            <div key={idx} className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-4 space-y-3 group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-white/10" />
                                        <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Link #{idx + 1}</span>
                                    </div>
                                    {sitelinks.length > 1 && (
                                        <button
                                            onClick={() => setSitelinks(sitelinks.filter((_, i) => i !== idx))}
                                            className="text-white/15 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest">Görünen İsim</label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateSitelink(idx, "label", e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-emerald-500/50 text-sm"
                                            placeholder="Örn: Yeni Gelenler"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest">URL Yolu</label>
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateSitelink(idx, "url", e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-emerald-500/50 text-sm font-mono"
                                            placeholder="Örn: /new"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest">Açıklama (Description)</label>
                                    <input
                                        type="text"
                                        value={link.description}
                                        onChange={(e) => updateSitelink(idx, "description", e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-emerald-500/50 text-sm"
                                        placeholder="Bu sayfa hakkında kısa açıklama..."
                                        maxLength={90}
                                    />
                                    <div className="flex justify-end">
                                        <span className={`text-[10px] font-mono ${(link.description?.length || 0) > 80 ? "text-danger" : "text-white/15"}`}>
                                            {link.description?.length || 0}/90
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sitelinks.length < 8 && (
                            <button
                                onClick={() => setSitelinks([...sitelinks, { label: "", url: "", description: "" }])}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white border border-dashed border-white/10 hover:border-white/30 rounded-xl px-4 py-3 w-full justify-center transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Yeni Sitelink Ekle
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
