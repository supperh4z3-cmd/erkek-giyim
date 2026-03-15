"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, HardDrive, Clock, Database, Loader2, CheckCircle, AlertTriangle, Upload } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface RestoreResult {
    success: boolean;
    totalInserted: number;
    tables: { table: string; inserted: number; error?: string }[];
    errors?: { table: string; error: string }[];
}

export default function BackupPage() {
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Restore state
    const [restoring, setRestoring] = useState(false);
    const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = async () => {
        setDownloading(true);
        setResult(null);
        try {
            const res = await fetch("/api/backup");
            if (!res.ok) throw new Error("Yedekleme başarısız");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chase-chain-backup-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            setResult({ success: true, message: "Yedek dosyası başarıyla indirildi!" });
        } catch {
            setResult({ success: false, message: "Yedekleme sırasında bir hata oluştu" });
        } finally {
            setDownloading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/json") {
            setRestoreFile(file);
            setShowRestoreConfirm(true);
        } else {
            alert("Lütfen .json uzantılı bir yedek dosyası seçin");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const restoreFromBackup = async () => {
        if (!restoreFile) return;
        setShowRestoreConfirm(false);
        setRestoring(true);
        setRestoreResult(null);
        try {
            const text = await restoreFile.text();
            const data = JSON.parse(text);

            if (!data.version || !data.tables) {
                throw new Error("Geçersiz yedek dosyası formatı");
            }

            const res = await fetch("/api/backup/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: text,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Geri yükleme başarısız");

            setRestoreResult(result);
        } catch (err) {
            setRestoreResult({
                success: false,
                totalInserted: 0,
                tables: [],
                errors: [{ table: "genel", error: err instanceof Error ? err.message : "Bilinmeyen hata" }],
            });
        } finally {
            setRestoring(false);
            setRestoreFile(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Veritabanı Yedekleme</h1>
                    <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                        Yedekleyin veya geri yükleyin
                    </p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Database className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Tam Yedekleme</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Tüm tablolar dahil</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <HardDrive className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">JSON Format</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">İnsan okunabilir</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Anlık Durum</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Gerçek zamanlı veri</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Columns: Backup + Restore */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Backup Action */}
                <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
                    <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Download className="w-7 h-7 text-danger" />
                    </div>
                    <h2 className="text-white font-bold text-lg mb-2">Yedek İndir</h2>
                    <p className="text-white/40 text-sm mb-5">
                        Tüm verilerin tam bir yedek dosyasını indirin.
                    </p>
                    <button
                        onClick={handleBackup}
                        disabled={downloading}
                        className="inline-flex items-center gap-3 bg-danger text-white px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                        {downloading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Yedekleniyor...</>
                        ) : (
                            <><Download className="w-5 h-5" /> Yedek İndir</>
                        )}
                    </button>

                    {result && (
                        <div className={`flex items-center justify-center gap-2 mt-5 text-sm ${result.success ? "text-green-500" : "text-red-500"}`}>
                            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {result.message}
                        </div>
                    )}
                </div>

                {/* Restore Action */}
                <div className="bg-[#111] border border-white/5 rounded-lg p-8 text-center">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Upload className="w-7 h-7 text-blue-500" />
                    </div>
                    <h2 className="text-white font-bold text-lg mb-2">Yedekten Geri Yükle</h2>
                    <p className="text-white/40 text-sm mb-5">
                        Önceden alınmış bir yedek dosyasından verileri geri yükleyin.
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={restoring}
                        className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {restoring ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Geri Yükleniyor...</>
                        ) : (
                            <><Upload className="w-5 h-5" /> Dosya Seç</>
                        )}
                    </button>

                    {/* Restore Results */}
                    {restoreResult && (
                        <div className="mt-5 text-left">
                            <div className={`flex items-center gap-2 mb-3 text-sm font-bold ${restoreResult.success ? "text-green-500" : "text-red-500"}`}>
                                {restoreResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {restoreResult.success
                                    ? `Başarılı! ${restoreResult.totalInserted} kayıt geri yüklendi`
                                    : "Geri yükleme hatası"
                                }
                            </div>
                            {restoreResult.tables.length > 0 && (
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {restoreResult.tables.map(t => (
                                        <div key={t.table} className="flex items-center justify-between bg-white/[0.03] rounded px-3 py-1.5">
                                            <span className="text-xs text-white/50 font-mono">{t.table}</span>
                                            <span className={`text-xs font-bold ${t.error ? "text-red-400" : "text-green-400"}`}>
                                                {t.error ? "Hata" : `${t.inserted} kayıt`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {restoreResult.errors && restoreResult.errors.length > 0 && (
                                <div className="mt-2 text-xs text-red-400/80">
                                    {restoreResult.errors.map((e, i) => (
                                        <p key={i}>{e.table}: {e.error}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tables Info */}
            <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Yedeklenen Tablolar</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                        "products", "product_colors", "product_sizes", "product_images",
                        "product_features", "categories", "orders", "order_items",
                        "customers", "coupons", "site_settings", "seo_settings",
                        "discover_items", "campaigns", "announcements", "policies",
                        "notifications", "audit_logs"
                    ].map(table => (
                        <div key={table} className="bg-white/5 rounded px-3 py-2">
                            <span className="text-white/60 text-xs font-mono">{table}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Restore Confirm Modal */}
            <ConfirmModal
                open={showRestoreConfirm}
                title="Geri Yükleme Onayı"
                message="Bu işlem mevcut tüm verileri silip yedek dosyasındaki verilerle değiştirecektir. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?"
                confirmText="Evet, Geri Yükle"
                variant="warning"
                onConfirm={restoreFromBackup}
                onCancel={() => { setShowRestoreConfirm(false); setRestoreFile(null); }}
            />
        </div>
    );
}
