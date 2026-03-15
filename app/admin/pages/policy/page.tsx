"use client";

import { useState, useEffect } from "react";
import { FileText, Save, HelpCircle, FileSignature, ShieldAlert, Zap, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";

export default function PolicyManagementPage() {
    const [activeTab, setActiveTab] = useState("shipping");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [shippingPolicy, setShippingPolicy] = useState("");
    const [returnsPolicy, setReturnsPolicy] = useState("");
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [termsPolicy, setTermsPolicy] = useState("");
    const [faqs, setFaqs] = useState<{id: string; question: string; answer: string}[]>([]);

    useEffect(() => {
        fetch("/api/policies")
            .then(res => res.json())
            .then(data => {
                const toText = (policy: { sections?: { heading: string; content: string[] }[] }) =>
                    policy?.sections?.map(s => `## ${s.heading}\n${s.content.join("\n")}`).join("\n\n") ?? "";
                setShippingPolicy(toText(data.shipping));
                setReturnsPolicy(toText(data.returns));
                setPrivacyPolicy(toText(data.privacy));
                setTermsPolicy(toText(data.terms));
                setFaqs(data.faq ?? []);
            })
            .catch(err => console.error("Politikalar yüklenemedi:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const parseText = (text: string) => {
                const sections: { heading: string; content: string[] }[] = [];
                const parts = text.split(/^## /m).filter(Boolean);
                for (const part of parts) {
                    const lines = part.split("\n");
                    const heading = lines[0]?.trim() ?? "";
                    const content = lines.slice(1).join("\n").trim().split("\n").filter(Boolean);
                    if (heading) sections.push({ heading, content });
                }
                return sections;
            };

            await fetch("/api/policies", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shipping: { title: "Kargo & Teslimat", subtitle: "Sokağın Ritmine Ayak Uydur.", sections: parseText(shippingPolicy) },
                    returns: { title: "İade & Değişim", subtitle: "Taviz Yok, Bahane Yok.", sections: parseText(returnsPolicy) },
                    privacy: { title: "Gizlilik Politikası", subtitle: "Verinin Güvenliği Bizim İçin Kutsal.", sections: parseText(privacyPolicy) },
                    terms: { title: "Hizmet Şartları", subtitle: "Kurallar Net. Oyun Adil.", sections: parseText(termsPolicy) },
                    faq: faqs,
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

    const addFaq = () => {
        setFaqs([...faqs, { id: Date.now().toString(), question: "Yeni Soru...", answer: "Cevap metnini buraya giriniz..." }]);
    };

    const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };

    const removeFaq = (id: string) => {
        setFaqs(faqs.filter(faq => faq.id !== id));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-widest text-white">Sözleşmeler & S.S.S.</h1>
                    <p className="text-white/50 text-sm mt-1">Sitenizin yasal metinlerini, kargo detaylarını ve Sıkça Sorulan Sorularını yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                    {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Tabs */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab("shipping")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "shipping" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        Kargo & Teslimat
                    </button>
                    <button
                        onClick={() => setActiveTab("returns")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "returns" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        İade Politikası
                    </button>
                    <button
                        onClick={() => setActiveTab("privacy")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "privacy" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Gizlilik & Çerezler
                    </button>
                    <button
                        onClick={() => setActiveTab("terms")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "terms" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <FileSignature className="w-4 h-4" />
                        Hizmet Şartları
                    </button>
                    <button
                        onClick={() => setActiveTab("faq")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "faq" ? "bg-white/10 text-white border-l border-danger" : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <HelpCircle className="w-4 h-4" />
                        S.S.S. (Soru/Cevap)
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8">

                    {/* Standard Text Policy Tab Layout */}
                    {["shipping", "returns", "privacy", "terms"].includes(activeTab) && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-6">
                                {activeTab === "shipping" && "Kargo ve Teslimat Metni"}
                                {activeTab === "returns" && "İade ve Değişim Şartları"}
                                {activeTab === "privacy" && "Gizlilik ve Çerez Politikası"}
                                {activeTab === "terms" && "Kullanıcı Sözleşmesi ve Hizmet Şartları"}
                            </h2>
                            <p className="text-white/50 text-xs mt-1 mb-4 font-mono">
                                Markdown formatı veya HTML kullanabilirsiniz. Satır atlamak için iki kez enter tuşuna basınız.
                            </p>

                            <textarea
                                value={
                                    activeTab === "shipping" ? shippingPolicy :
                                        activeTab === "returns" ? returnsPolicy :
                                            activeTab === "privacy" ? privacyPolicy :
                                                termsPolicy
                                }
                                onChange={(e) => {
                                    if (activeTab === "shipping") setShippingPolicy(e.target.value);
                                    else if (activeTab === "returns") setReturnsPolicy(e.target.value);
                                    else if (activeTab === "privacy") setPrivacyPolicy(e.target.value);
                                    else if (activeTab === "terms") setTermsPolicy(e.target.value);
                                }}
                                className="w-full h-[500px] bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 resize-y font-mono text-sm leading-relaxed"
                            />
                        </div>
                    )}

                    {/* FAQ Editor Tab */}
                    {activeTab === "faq" && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white">
                                    Sıkça Sorulan Sorular Düzenleyicisi
                                </h2>
                                <button
                                    onClick={addFaq}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Yeni Soru Ekle
                                </button>
                            </div>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={faq.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 group">
                                        <div className="shrink-0 pt-2 text-white/20 font-bold font-mono">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                                                className="w-full bg-[#111111] border border-white/5 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-white/30"
                                                placeholder="Soru Başlığı"
                                            />
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                                                className="w-full bg-[#111111] border border-white/5 rounded-lg px-4 py-2 text-white/70 text-sm focus:outline-none focus:border-white/30 resize-none h-24"
                                                placeholder="Cevap Metni"
                                            />
                                        </div>
                                        <div className="shrink-0 flex items-start md:items-center justify-end">
                                            <button
                                                onClick={() => removeFaq(faq.id)}
                                                className="p-2 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                title="Soruyu Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {faqs.length === 0 && (
                                    <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
                                        <p className="text-white/40 uppercase tracking-widest text-sm font-mono">Hiç Soru Bulunmuyor</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
