"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Eye, Edit3, Check, X, Send, Loader2, Package, Truck, UserPlus, Lock, Save } from "lucide-react";

interface EmailTemplate {
    key: string;
    name: string;
    icon: React.ReactNode;
    subject: string;
    description: string;
    variables: string[];
    preview: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        key: "order_confirmation",
        name: "Sipariş Onayı",
        icon: <Package className="w-5 h-5" />,
        subject: "Sipariş Onaylandı - {{order_id}} | CHASE & CHAIN",
        description: "Müşteri sipariş verdiğinde gönderilen onay e-postası. Sipariş numarası, ürün listesi, toplam tutar ve takip bağlantısı içerir.",
        variables: ["{{customer_name}}", "{{order_id}}", "{{items}}", "{{total}}", "{{shipping_address}}"],
        preview: `<div style="text-align:center;padding:20px;">
            <div style="background:#1a0f0f;border:1px solid #2a1515;border-radius:20px;padding:6px 18px;display:inline-block;margin-bottom:20px;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#ef4444;font-weight:700;">Siparis Onaylandi</span>
            </div>
            <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Siparisin Alindi</h2>
            <p style="color:#666;font-size:13px;">Merhaba <strong style="color:#fff">{{customer_name}}</strong>, siparisin basariyla olusturuldu.</p>
            <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
                <span style="font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#555;">Siparis Numarasi</span><br/>
                <span style="font-size:20px;font-weight:900;color:#ef4444;letter-spacing:3px;">{{order_id}}</span>
            </div>
            <div style="background:#1a0f0f;border:1px solid #2a1515;border-radius:8px;padding:16px;margin:20px 0;">
                <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:3px;">Toplam</span>
                <span style="font-size:24px;font-weight:900;color:#fff;display:block;margin-top:4px;">{{total}} TL</span>
            </div>
        </div>`,
    },
    {
        key: "shipping_notification",
        name: "Kargo Bildirimi",
        icon: <Truck className="w-5 h-5" />,
        subject: "Siparisiniz Kargoya Verildi - {{order_id}} | CHASE & CHAIN",
        description: "Sipariş kargoya verildiğinde gönderilen bildirim. Takip numarası, kargo firması ve takip bağlantısı içerir.",
        variables: ["{{customer_name}}", "{{order_id}}", "{{tracking_number}}", "{{carrier}}"],
        preview: `<div style="text-align:center;padding:20px;">
            <div style="background:#0f1a0f;border:1px solid #152a15;border-radius:20px;padding:6px 18px;display:inline-block;margin-bottom:20px;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#22c55e;font-weight:700;">Kargoya Verildi</span>
            </div>
            <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Siparisin Yola Cikti</h2>
            <p style="color:#666;font-size:13px;">Merhaba <strong style="color:#fff">{{customer_name}}</strong>, siparisin kargoya verildi!</p>
            <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:8px;padding:16px;margin:20px 0;">
                <span style="font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#555;">Kargo Takip Numarasi</span><br/>
                <span style="font-size:20px;font-weight:900;color:#22c55e;letter-spacing:4px;">{{tracking_number}}</span><br/>
                <span style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:2px;">{{carrier}}</span>
            </div>
        </div>`,
    },
    {
        key: "welcome",
        name: "Hoş Geldiniz",
        icon: <UserPlus className="w-5 h-5" />,
        subject: "CHASE & CHAIN Ailesine Hoş Geldin!",
        description: "Yeni müşteri kaydolduğunda gönderilen karşılama e-postası. Yeni koleksiyonlar, özel indirimler ve takip özellikleri tanıtılır.",
        variables: ["{{customer_name}}"],
        preview: `<div style="text-align:center;padding:20px;">
            <div style="width:56px;height:56px;background:#1a0f0f;border:1px solid #2a1515;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:24px;">⚡</span>
            </div>
            <h2 style="color:#fff;font-size:26px;margin:0 0 8px;">Hos Geldin</h2>
            <p style="color:#666;font-size:14px;">Merhaba <strong style="color:#fff">{{customer_name}}</strong>,<br/><strong style="color:#ef4444;">CHASE & CHAIN</strong> ailesine katildigin icin memnunuz.</p>
            <div style="display:flex;flex-direction:column;gap:8px;margin:24px 0;">
                <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:8px;padding:12px 16px;text-align:left;display:flex;align-items:center;gap:12px;">
                    <span style="width:32px;height:32px;background:#1a0f0f;border:1px solid #2a1515;border-radius:8px;display:flex;align-items:center;justify-content:center;">🔥</span>
                    <div><strong style="color:#fff;font-size:13px;">Yeni Koleksiyonlar</strong><br/><span style="color:#555;font-size:11px;">Ilk sen haberdar ol</span></div>
                </div>
            </div>
        </div>`,
    },
    {
        key: "password_reset",
        name: "Şifre Sıfırlama",
        icon: <Lock className="w-5 h-5" />,
        subject: "Şifre Sıfırlama | CHASE & CHAIN",
        description: "Müşteri şifresini unuttuğunda gönderilen sıfırlama e-postası. 1 saat geçerli sıfırlama bağlantısı ve güvenlik uyarısı içerir.",
        variables: ["{{customer_name}}", "{{reset_url}}"],
        preview: `<div style="text-align:center;padding:20px;">
            <div style="width:56px;height:56px;background:#1a0f0f;border:1px solid #2a1515;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:24px;">🔒</span>
            </div>
            <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Sifre Sifirlama</h2>
            <p style="color:#666;font-size:13px;">Merhaba <strong style="color:#fff">{{customer_name}}</strong>,<br/>Hesabiniz icin bir sifre sifirlama istegi aldik.</p>
            <a href="#" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:24px 0;">Sifremi Sifirla</a>
            <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:8px;padding:12px 16px;margin:16px 0;">
                <span style="font-size:11px;color:#999;">⏱ Bu baglanti <strong style="color:#ef4444">1 saat</strong> icerisinde gecerlidir.<br/>🔒 Eger bu istegi siz yapmadiysaniz, bu e-postayi dikkate almayin.</span>
            </div>
        </div>`,
    },
];

export default function EmailTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Editable state
    const [editedSubjects, setEditedSubjects] = useState<Record<string, string>>({});
    const [editedDescriptions, setEditedDescriptions] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load saved customizations from settings
    const loadCustomizations = useCallback(async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.email_templates) {
                const customs = data.email_templates;
                const subjects: Record<string, string> = {};
                const descs: Record<string, string> = {};
                for (const key of Object.keys(customs)) {
                    if (customs[key].subject) subjects[key] = customs[key].subject;
                    if (customs[key].description) descs[key] = customs[key].description;
                }
                setEditedSubjects(subjects);
                setEditedDescriptions(descs);
            }
        } catch {
            // Use defaults
        }
    }, []);

    useEffect(() => {
        loadCustomizations();
    }, [loadCustomizations]);

    // Get template with edits applied
    const getTemplate = (t: EmailTemplate): EmailTemplate => ({
        ...t,
        subject: editedSubjects[t.key] ?? t.subject,
        description: editedDescriptions[t.key] ?? t.description,
    });

    const templates = DEFAULT_TEMPLATES.map(getTemplate);
    const selected = templates.find(t => t.key === selectedTemplate);
    const defaultSelected = DEFAULT_TEMPLATES.find(t => t.key === selectedTemplate);

    const handleSubjectChange = (key: string, value: string) => {
        setEditedSubjects(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleDescriptionChange = (key: string, value: string) => {
        setEditedDescriptions(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build template customizations object
            const customs: Record<string, { subject?: string; description?: string }> = {};
            for (const t of DEFAULT_TEMPLATES) {
                const subj = editedSubjects[t.key];
                const desc = editedDescriptions[t.key];
                if (subj || desc) {
                    customs[t.key] = {};
                    if (subj && subj !== t.subject) customs[t.key].subject = subj;
                    if (desc && desc !== t.description) customs[t.key].description = desc;
                }
            }

            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "email_templates", value: customs }),
            });

            setSaved(true);
            setHasChanges(false);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // Error handling
        } finally {
            setSaving(false);
        }
    };

    const handleTestSend = async () => {
        if (!testEmail || !selected) return;
        setSending(true);
        setTestResult(null);
        try {
            const res = await fetch("/api/email-templates/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateKey: selected.key, email: testEmail }),
            });
            const data = await res.json();
            setTestResult({ success: res.ok, message: data.message || data.error || "İşlem tamamlandı" });
        } catch {
            setTestResult({ success: false, message: "Gönderim başarısız" });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">E-posta Şablonları</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            {templates.length} adet e-posta şablonu — düzenlenebilir
                        </p>
                    </div>
                </div>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
                        {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template List */}
                <div className="lg:col-span-1 space-y-2">
                    {templates.map((template) => (
                        <button
                            key={template.key}
                            onClick={() => { setSelectedTemplate(template.key); setPreviewMode(false); setTestResult(null); }}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                                selectedTemplate === template.key
                                    ? "bg-danger/10 border-danger/30 text-white"
                                    : "bg-[#111] border-white/5 text-white/60 hover:border-white/15 hover:text-white"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    selectedTemplate === template.key ? "bg-danger/20 text-danger" : "bg-white/5"
                                }`}>
                                    {template.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{template.name}</p>
                                    <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mt-0.5">{template.key}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Template Detail */}
                <div className="lg:col-span-2">
                    {!selected || !defaultSelected ? (
                        <div className="bg-[#111] border border-white/5 rounded-lg p-12 text-center">
                            <Mail className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 text-sm">Bir şablon seçerek detayları görüntüleyin ve düzenleyin</p>
                        </div>
                    ) : (
                        <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    {selected.icon}
                                    <h3 className="font-bold text-white text-sm">{selected.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPreviewMode(false)}
                                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                            !previewMode ? "bg-danger text-white" : "bg-white/5 text-white/40 hover:text-white"
                                        }`}
                                    >
                                        <Edit3 className="w-3 h-3 inline-block mr-1" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => setPreviewMode(true)}
                                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                            previewMode ? "bg-danger text-white" : "bg-white/5 text-white/40 hover:text-white"
                                        }`}
                                    >
                                        <Eye className="w-3 h-3 inline-block mr-1" />
                                        Önizleme
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {previewMode ? (
                                    /* Preview Mode */
                                    <div className="bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden">
                                        {/* Email Header Bar */}
                                        <div className="bg-[#060606] px-4 py-3 border-b border-white/5 flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                                            </div>
                                            <span className="text-white/20 text-xs font-mono">Önizleme</span>
                                        </div>
                                        {/* Subject Line */}
                                        <div className="px-4 py-2 border-b border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Konu</p>
                                            <p className="text-white text-sm font-medium">{selected.subject}</p>
                                        </div>
                                        {/* Email Body Preview */}
                                        <div
                                            className="p-6"
                                            dangerouslySetInnerHTML={{ __html: selected.preview }}
                                        />
                                    </div>
                                ) : (
                                    /* Edit Mode */
                                    <div className="space-y-5">
                                        {/* Subject — Editable */}
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Konu Satırı</label>
                                            <input
                                                type="text"
                                                value={selected.subject}
                                                onChange={(e) => handleSubjectChange(selected.key, e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-danger/50 transition-colors"
                                            />
                                        </div>

                                        {/* Description — Editable */}
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Açıklama</label>
                                            <textarea
                                                value={selected.description}
                                                onChange={(e) => handleDescriptionChange(selected.key, e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-white/60 leading-relaxed focus:outline-none focus:border-danger/50 transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Variables */}
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Değişkenler</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selected.variables.map(v => (
                                                    <span key={v} className="px-3 py-1.5 bg-danger/10 text-danger text-xs font-mono rounded-md border border-danger/20">
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-md px-4 py-3">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-green-500 text-sm font-medium">Aktif — Otomatik gönderim açık</span>
                                        </div>

                                        {/* Test Send */}
                                        <div className="border-t border-white/5 pt-5">
                                            <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Test E-postası Gönder</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={testEmail}
                                                    onChange={(e) => setTestEmail(e.target.value)}
                                                    placeholder="test@email.com"
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-danger/50"
                                                />
                                                <button
                                                    onClick={handleTestSend}
                                                    disabled={sending || !testEmail}
                                                    className="flex items-center gap-2 bg-danger text-white px-4 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                >
                                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Gönder
                                                </button>
                                            </div>
                                            {testResult && (
                                                <div className={`flex items-center gap-2 mt-3 text-sm ${testResult.success ? "text-green-500" : "text-red-500"}`}>
                                                    {testResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    {testResult.message}
                                                </div>
                                            )}
                                        </div>
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
