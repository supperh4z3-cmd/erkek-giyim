"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Megaphone, Video, Link as LinkIcon, Save, Eye, EyeOff, Image as ImageIcon, Loader2, CheckCircle, Plus, Trash2, GripVertical } from "lucide-react";
import SingleFileUploader from "@/components/admin/SingleFileUploader";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [announcement, setAnnouncement] = useState<{
        isActive: boolean;
        items: { text: string; link: string }[];
    }>({
        isActive: false,
        items: [{ text: "", link: "" }],
    });
    const [heroSettings, setHeroSettings] = useState({
        video1: "", video2: "", title: "", subtitle: "", buttonText: "", buttonLink: ""
    });
    const [socialLinks, setSocialLinks] = useState({
        instagram: "", tiktok: "", twitter: ""
    });
    const [generalSettings, setGeneralSettings] = useState({
        siteName: "", contactEmail: "", contactPhone: "", address: "", footerText: ""
    });
    const [globalImages, setGlobalImages] = useState({
        logoUrl: "", faviconUrl: "", defaultOgImage: ""
    });

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.announcement) {
                    // Eski format uyumluluğu: tek metin → array'e çevir
                    if (typeof data.announcement.text === "string" && !data.announcement.items) {
                        setAnnouncement({
                            isActive: data.announcement.isActive ?? false,
                            items: [{ text: data.announcement.text, link: data.announcement.link || "" }],
                        });
                    } else {
                        setAnnouncement({
                            isActive: data.announcement.isActive ?? false,
                            items: data.announcement.items?.length ? data.announcement.items : [{ text: "", link: "" }],
                        });
                    }
                }
                if (data.hero) setHeroSettings(data.hero);
                if (data.socialLinks) setSocialLinks(data.socialLinks);
                if (data.general) setGeneralSettings(data.general);
                if (data.globalImages) setGlobalImages(data.globalImages);
            })
            .catch(err => console.error("Ayarlar yüklenemedi:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    announcement,
                    hero: heroSettings,
                    socialLinks,
                    general: generalSettings,
                    globalImages,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            setSaveError("Kaydetme sırasında bir hata oluştu!");
            setTimeout(() => setSaveError(null), 5000);
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-widest text-white">SİTE AYARLARI</h1>
                    <p className="text-white/50 text-sm mt-1">Sitenizin genel görünümünü, bağlantılarını ve duyurularını yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                    {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
                </button>
                {saveError && <span className="text-red-400 text-xs font-bold">{saveError}</span>}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Tabs */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "general" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Genel Ayarlar
                    </button>
                    <button
                        onClick={() => setActiveTab("announcement")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "announcement" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        Duyuru Çubuğu
                    </button>
                    <button
                        onClick={() => setActiveTab("hero")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "hero" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Video className="w-4 h-4" />
                        Anasayfa Hero
                    </button>
                    <button
                        onClick={() => setActiveTab("social")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "social" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Sosyal Medya
                    </button>
                    <button
                        onClick={() => setActiveTab("images")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "images" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Görsel & Logo
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8">

                    {/* General Settings Tab */}
                    {activeTab === "general" && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-6">
                                Genel İletişim Bilgileri
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Site Adı (Title)</label>
                                    <input
                                        type="text"
                                        value={generalSettings.siteName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">İletişim E-Posta</label>
                                    <input
                                        type="email"
                                        value={generalSettings.contactEmail}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">İletişim Telefon</label>
                                    <input
                                        type="text"
                                        value={generalSettings.contactPhone}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 font-mono"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Fiziksel Adres</label>
                                    <textarea
                                        value={generalSettings.address}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                                        rows={2}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 resize-none"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Footer Telif Metni</label>
                                    <input
                                        type="text"
                                        value={generalSettings.footerText}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, footerText: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcement Bar Tab */}
                    {activeTab === "announcement" && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white">
                                    Duyuru Çubuğu (Top Bar)
                                </h2>
                                <button
                                    onClick={() => setAnnouncement({ ...announcement, isActive: !announcement.isActive })}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${announcement.isActive ? "bg-danger/20 text-danger border border-danger/50" : "bg-white/5 text-white/40 border border-white/10"
                                        }`}
                                >
                                    {announcement.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {announcement.isActive ? "Aktif (Yayında)" : "Gizli"}
                                </button>
                            </div>

                            {/* Canlı Önizleme — rotating loop */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-6">
                                <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">Canlı Önizleme (Döngülü)</p>
                                {announcement.isActive && announcement.items.some(i => i.text) ? (
                                    <div className="w-full bg-danger text-black text-[10px] md:text-xs font-bold uppercase tracking-widest py-2 text-center overflow-hidden">
                                        <div className="animate-pulse">
                                            {announcement.items.filter(i => i.text).map((item, idx) => (
                                                <span key={idx}>
                                                    {idx > 0 && <span className="mx-3 text-black/30">•</span>}
                                                    {item.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full bg-white/5 border border-white/5 border-dashed text-white/20 text-xs font-mono uppercase tracking-widest py-2 text-center flex justify-center items-center gap-2">
                                        <EyeOff className="w-4 h-4" /> {announcement.isActive ? "Duyuru metni giriniz" : "Şu An Gizli"}
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-white/30">Birden fazla duyuru ekleyebilirsiniz. Duyurular sitede otomatik olarak döngülü şekilde değişecektir.</p>

                            {/* Duyuru Listesi */}
                            <div className="space-y-3">
                                {announcement.items.map((item, idx) => (
                                    <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-4 relative group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-white/15" />
                                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Duyuru #{idx + 1}</span>
                                            </div>
                                            {announcement.items.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const newItems = announcement.items.filter((_, i) => i !== idx);
                                                        setAnnouncement({ ...announcement, items: newItems });
                                                    }}
                                                    className="text-white/20 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Duyuru Metni</label>
                                            <input
                                                type="text"
                                                value={item.text}
                                                onChange={(e) => {
                                                    const newItems = [...announcement.items];
                                                    newItems[idx] = { ...newItems[idx], text: e.target.value };
                                                    setAnnouncement({ ...announcement, items: newItems });
                                                }}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                                                placeholder="Örn: 500₺ ÜZERİ ÜCRETSİZ KARGO"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Tıklama Linki (İsteğe Bağlı)</label>
                                            <input
                                                type="text"
                                                value={item.link}
                                                onChange={(e) => {
                                                    const newItems = [...announcement.items];
                                                    newItems[idx] = { ...newItems[idx], link: e.target.value };
                                                    setAnnouncement({ ...announcement, items: newItems });
                                                }}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                                                placeholder="Örn: /collections/sale"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setAnnouncement({ ...announcement, items: [...announcement.items, { text: "", link: "" }] })}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white border border-dashed border-white/10 hover:border-white/30 rounded-lg px-4 py-3 w-full justify-center transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Yeni Duyuru Ekle
                            </button>
                        </div>
                    )}

                    {/* Hero Settings Tab */}
                    {activeTab === "hero" && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-6">
                                Anasayfa Giriş (Hero)
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <SingleFileUploader
                                        value={heroSettings.video1}
                                        onChange={(url) => setHeroSettings({ ...heroSettings, video1: url })}
                                        accept="video/mp4,video/webm,video/quicktime"
                                        label="Sol Taraf Video (.mp4)"
                                        placeholder="/videos/karanligin-icinden.mp4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <SingleFileUploader
                                        value={heroSettings.video2}
                                        onChange={(url) => setHeroSettings({ ...heroSettings, video2: url })}
                                        accept="video/mp4,video/webm,video/quicktime"
                                        label="Sağ Taraf Video (.mp4)"
                                        placeholder="/videos/ikinci-video.mp4"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2 mt-4 border-t border-white/5 pt-6">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Merkez Başlık (Neon Animasyonlu)</label>
                                    <input
                                        type="text"
                                        value={heroSettings.title}
                                        onChange={(e) => setHeroSettings({ ...heroSettings, title: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-xl font-black italic tracking-tighter uppercase text-white focus:outline-none focus:border-danger"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Alt Başlık</label>
                                    <input
                                        type="text"
                                        value={heroSettings.subtitle}
                                        onChange={(e) => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono uppercase tracking-widest focus:outline-none focus:border-white/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Buton Metni</label>
                                    <input
                                        type="text"
                                        value={heroSettings.buttonText}
                                        onChange={(e) => setHeroSettings({ ...heroSettings, buttonText: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white font-bold uppercase tracking-widest focus:outline-none focus:border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Buton Yönlendirme Linki</label>
                                    <input
                                        type="text"
                                        value={heroSettings.buttonLink}
                                        onChange={(e) => setHeroSettings({ ...heroSettings, buttonLink: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none focus:border-white/30"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Links Tab */}
                    {activeTab === "social" && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-6">
                                Sosyal Medya Profilleri
                            </h2>
                            <p className="text-white/50 text-sm mb-6">Bu linkler sitenizin Footer kısmındaki sosyal medya ikonlarında kullanılır. Boş bırakılan platformlar otomatik olarak gizlenir.</p>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Instagram URL</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">IG</div>
                                        <input
                                            type="url"
                                            value={socialLinks.instagram}
                                            onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                                        placeholder="https://instagram.com/hesabiniz"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">TikTok URL</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">TT</div>
                                        <input
                                            type="url"
                                            value={socialLinks.tiktok}
                                            onChange={(e) => setSocialLinks({...socialLinks, tiktok: e.target.value})}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                                        placeholder="https://tiktok.com/@hesabiniz"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">Twitter / X URL</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs text-center w-4">X</div>
                                        <input
                                            type="url"
                                            value={socialLinks.twitter}
                                            onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                                        placeholder="https://twitter.com/hesabiniz"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logo & Images Tab */}
                    {activeTab === "images" && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-6">
                                Global Görseller
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <SingleFileUploader
                                        value={globalImages.logoUrl}
                                        onChange={(url) => setGlobalImages({ ...globalImages, logoUrl: url })}
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        label="Site Logosu (Header)"
                                        placeholder="Logo yükleyin veya URL girin"
                                    />
                                    <SingleFileUploader
                                        value={globalImages.faviconUrl}
                                        onChange={(url) => setGlobalImages({ ...globalImages, faviconUrl: url })}
                                        accept="image/png,image/x-icon,image/svg+xml,image/ico"
                                        label="Favicon (Tarayıcı Sekmesi)"
                                        placeholder="Favicon yükleyin veya URL girin"
                                    />
                                    <SingleFileUploader
                                        value={globalImages.defaultOgImage}
                                        onChange={(url) => setGlobalImages({ ...globalImages, defaultOgImage: url })}
                                        accept="image/png,image/jpeg,image/webp"
                                        label="Open Graph Görseli"
                                        placeholder="OG görseli yükleyin veya URL girin"
                                    />
                                    <p className="text-[10px] text-white/40">Siteniz WhatsApp, Twitter gibi yerlerde paylaşıldığında otomatik çıkacak resim.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Logo Preview */}
                                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                                        {globalImages.logoUrl ? (
                                            <>
                                                <p className="text-[10px] uppercase font-mono tracking-widest text-white/40">Logo Önizleme</p>
                                                <div className="bg-black p-4 rounded-lg">
                                                    <img src={globalImages.logoUrl} alt="Logo" className="max-h-16 object-contain" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 text-white/10" />
                                                <p className="text-xs text-white/40">Logo yüklendikten sonra burada önizleme görüntülenecek</p>
                                            </>
                                        )}
                                    </div>
                                    {/* Favicon Preview */}
                                    {globalImages.faviconUrl && (
                                        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                            <img src={globalImages.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                                            <div>
                                                <p className="text-[10px] uppercase font-mono tracking-widest text-white/40">Favicon Önizleme</p>
                                                <p className="text-xs text-white/60 mt-0.5">Tarayıcı sekmesinde görünecek simge</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
