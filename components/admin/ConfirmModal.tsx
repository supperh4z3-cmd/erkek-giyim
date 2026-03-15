"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    variant?: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title = "Silme Onayı",
    message,
    confirmText = "Evet, Sil",
    cancelText = "İptal",
    loading = false,
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    const colors = variant === "danger"
        ? { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-500", btn: "bg-red-600 hover:bg-red-700" }
        : { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-500", btn: "bg-yellow-600 hover:bg-yellow-700" };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div
                className="bg-[#111] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-14 h-14 ${colors.bg} border ${colors.border} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <AlertTriangle className={`w-7 h-7 ${colors.icon}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 pt-0">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 rounded-md border border-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3 rounded-md ${colors.btn} text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {confirmText}
                    </button>
                </div>

                {/* Close */}
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 text-white/20 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
