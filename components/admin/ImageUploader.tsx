"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxFiles?: number;
    label?: string;
}

export default function ImageUploader({ images, onChange, maxFiles = 10, label = "Ürün Görselleri" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        // Check max files
        if (images.length + fileArray.length > maxFiles) {
            setError(`En fazla ${maxFiles} görsel yükleyebilirsiniz`);
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            for (const file of fileArray) {
                formData.append("files", file);
            }

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Yükleme başarısız");
                return;
            }

            onChange([...images, ...data.urls]);
        } catch {
            setError("Yükleme sırasında hata oluştu");
        } finally {
            setUploading(false);
        }
    }, [images, onChange, maxFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const removeImage = useCallback((index: number) => {
        onChange(images.filter((_, i) => i !== index));
    }, [images, onChange]);

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= images.length) return;
        const newImages = [...images];
        const [moved] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, moved);
        onChange(newImages);
    }, [images, onChange]);

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50">
                {label} ({images.length}/{maxFiles})
            </label>

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10">
                            <Image src={url} alt={`Görsel ${idx + 1}`} fill className="object-cover" />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* Move buttons */}
                                {idx > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(idx, idx - 1)}
                                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs transition-colors"
                                        title="Sola taşı"
                                    >
                                        ←
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="w-7 h-7 rounded-full bg-danger/80 hover:bg-danger flex items-center justify-center text-white transition-colors"
                                    title="Kaldır"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                {idx < images.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => moveImage(idx, idx + 1)}
                                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs transition-colors"
                                        title="Sağa taşı"
                                    >
                                        →
                                    </button>
                                )}
                            </div>

                            {/* Index badge */}
                            {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Ana
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Drop Zone */}
            {images.length < maxFiles && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                        ${dragOver
                            ? "border-danger bg-danger/5 scale-[1.01]"
                            : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
                        }
                    `}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-danger animate-spin" />
                            <p className="text-white/50 text-sm">Yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            {dragOver ? (
                                <Upload className="w-8 h-8 text-danger" />
                            ) : (
                                <ImagePlus className="w-8 h-8 text-white/20" />
                            )}
                            <div>
                                <p className="text-white/60 text-sm font-medium">
                                    {dragOver ? "Bırakın" : "Görselleri sürükleyin veya tıklayın"}
                                </p>
                                <p className="text-white/30 text-xs mt-1">
                                    JPEG, PNG, WebP, GIF • Maks. 5MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* URL Input (fallback) */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="veya görsel URL yapıştırın..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-danger"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const url = target.value.trim();
                            if (url && images.length < maxFiles) {
                                onChange([...images, url]);
                                target.value = "";
                            }
                        }
                    }}
                />
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) {
                        handleFiles(e.target.files);
                        e.target.value = "";
                    }
                }}
            />

            {/* Error */}
            {error && (
                <p className="text-danger text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}
