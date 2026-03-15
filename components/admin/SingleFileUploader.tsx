"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";

interface SingleFileUploaderProps {
    value: string;
    onChange: (url: string) => void;
    accept?: string;
    label?: string;
    placeholder?: string;
    className?: string;
}

/**
 * Inline tek dosya yükleyici — mevcut text input'un yanına upload butonu ekler.
 * Hem URL yapıştırma hem dosya yükleme destekler.
 */
export default function SingleFileUploader({
    value,
    onChange,
    accept = "image/*,video/*",
    label,
    placeholder = "URL veya dosya yükleyin...",
    className = "",
}: SingleFileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("files", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Yükleme başarısız");
                return;
            }
            if (data.urls && data.urls.length > 0) {
                onChange(data.urls[0]);
            }
        } catch {
            setError("Yükleme sırasında hata oluştu");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-[11px] font-mono text-white/50 uppercase tracking-widest">{label}</label>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => { onChange(e.target.value); setError(""); }}
                    className="flex-1 bg-[#111111] border border-white/10 text-white px-3 py-2 rounded-md outline-none focus:border-danger text-sm font-mono"
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="shrink-0 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/50 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold"
                >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "..." : "Yükle"}
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                }}
            />
            {error && (
                <p className="text-danger text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}
