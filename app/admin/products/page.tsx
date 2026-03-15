"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Pagination from "@/components/admin/Pagination";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { TableSkeleton } from "@/components/admin/Skeleton";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Filter,
    Loader2,
    ArrowLeft,
    Download,
    Upload,
    X,
    CheckCircle,
    AlertTriangle
} from "lucide-react";

interface ProductListItem {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    priceFormatted: string;
    oldPrice?: number;
    oldPriceFormatted?: string;
    images: string[];
    badge?: "new" | "sale";
    isNewSeason?: boolean;
    isBestSeller?: boolean;
    totalStock: number;
    colors: { name: string; hex: string }[];
}

export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
    const [csvPreview, setCsvPreview] = useState<string[][] | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"single" | "bulk">("single");

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Ürünler yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Extract unique categories
    const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter]);

    const handleDelete = async (id: string) => {
        setDeleteTarget(id);
        setDeleteType("single");
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteType("bulk");
        setDeleteTarget("bulk");
    };

    const confirmDelete = async () => {
        if (deleteType === "single" && deleteTarget && deleteTarget !== "bulk") {
            try {
                await fetch(`/api/products/${deleteTarget}`, { method: "DELETE" });
                fetchProducts();
            } catch (err) {
                console.error("Silme hatası:", err);
            }
        } else if (deleteType === "bulk") {
            setBulkDeleting(true);
            try {
                await Promise.all(
                    Array.from(selectedIds).map(id =>
                        fetch(`/api/products/${id}`, { method: "DELETE" })
                    )
                );
                setSelectedIds(new Set());
                fetchProducts();
            } catch (err) {
                console.error("Toplu silme hatası:", err);
            } finally {
                setBulkDeleting(false);
            }
        }
        setDeleteTarget(null);
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const handleExport = () => {
        window.open("/api/products/export", "_blank");
    };

    const handleCsvFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            if (lines.length < 2) return;
            const dataRows = lines.slice(1).map(line => {
                const matches: string[] = [];
                let current = "";
                let inQuotes = false;
                for (const ch of line) {
                    if (ch === '"') { inQuotes = !inQuotes; continue; }
                    if (ch === ',' && !inQuotes) { matches.push(current); current = ""; continue; }
                    current += ch;
                }
                matches.push(current);
                return matches;
            });
            setCsvPreview(dataRows);
        };
        reader.readAsText(file, "utf-8");
    };

    const handleImport = async () => {
        if (!csvPreview?.length) return;
        setImporting(true);
        setImportResult(null);
        try {
            const res = await fetch("/api/products/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows: csvPreview }),
            });
            const result = await res.json();
            setImportResult(result);
            if (result.success > 0) fetchProducts();
        } catch {
            setImportResult({ success: 0, errors: ["İçe aktarma başarısız"] });
        } finally {
            setImporting(false);
        }
    };

    if (loading) {
        return <TableSkeleton rows={8} cols={6} />;
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Ürün Veritabanı</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Sistemdeki tüm {products.length} ürünü yönetin
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors"
                        title="CSV Dışa Aktar"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Dışa Aktar</span>
                    </button>
                    <button
                        onClick={() => { setShowImport(true); setCsvPreview(null); setImportResult(null); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-colors"
                        title="CSV İçe Aktar"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">İçe Aktar</span>
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Ürün Ekle
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-[#111111] p-4 rounded-lg border border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="İsim veya koda göre ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono"
                    />
                </div>
                <div className="relative md:w-64 shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-md outline-none focus:border-danger transition-colors text-sm font-mono appearance-none cursor-pointer"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === "all" ? "Tüm Kategoriler" : cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-danger/5 border border-danger/20 rounded-lg px-6 py-3 flex items-center justify-between">
                    <span className="text-danger text-sm font-bold">
                        {selectedIds.size} ürün seçildi
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-md text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {bulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Toplu Sil
                        </button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="bg-white/5 text-xs font-mono uppercase tracking-widest text-white/50 border-b border-white/10">
                            <tr>
                                <th className="px-4 py-4 font-normal w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={toggleSelectAll}
                                        className="accent-danger w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 font-normal">Ürün</th>
                                <th className="px-6 py-4 font-normal">Kod (Slug)</th>
                                <th className="px-6 py-4 font-normal">Kategori</th>
                                <th className="px-6 py-4 font-normal">Fiyat</th>
                                <th className="px-6 py-4 font-normal">Stok</th>
                                <th className="px-6 py-4 font-normal">Durum</th>
                                <th className="px-6 py-4 font-normal text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={product.id}
                                        className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.has(product.id) ? "bg-danger/5" : ""}`}
                                    >
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(product.id)}
                                                onChange={() => toggleSelect(product.id)}
                                                className="accent-danger w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-white/5 shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                                                    <Image
                                                        src={product.images[0] || "/placeholder.jpg"}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white max-w-[200px] truncate" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                    {product.colors.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {product.colors.slice(0, 5).map((c, i) => (
                                                                <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} title={c.name} />
                                                            ))}
                                                            {product.colors.length > 5 && (
                                                                <span className="text-[10px] text-white/30">+{product.colors.length - 5}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-white/40">
                                            {product.slug}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-white/10 px-2.5 py-1 rounded-sm text-xs font-mono uppercase tracking-widest text-white/80">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white">{product.priceFormatted}</span>
                                                {product.oldPriceFormatted && (
                                                    <span className="text-danger line-through text-[10px]">{product.oldPriceFormatted}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-mono font-bold ${product.totalStock === 0 ? 'text-danger' : product.totalStock < 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {product.totalStock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {product.badge === "new" && <span className="w-2 h-2 rounded-full bg-blue-500" title="Yeni Ürün" />}
                                                {product.badge === "sale" && <span className="w-2 h-2 rounded-full bg-danger" title="İndirimde" />}
                                                {product.isNewSeason && <span className="w-2 h-2 rounded-full bg-green-500" title="Yeni Sezon" />}
                                                {product.isBestSeller && <span className="w-2 h-2 rounded-full bg-purple-500" title="Çok Satan" />}
                                                {!product.badge && !product.isNewSeason && !product.isBestSeller && (
                                                    <span className="w-2 h-2 rounded-full bg-white/20" title="Standart" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-white/40 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-white/40 font-mono text-sm uppercase tracking-widest">
                                        Arama kriterlerine uygun ürün bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredProducts.length}
                    pageSize={PAGE_SIZE}
                />
            </div>

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white">CSV İçe Aktar</h3>
                            <button onClick={() => setShowImport(false)} className="p-1 text-white/30 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!csvPreview && !importResult && (
                                <>
                                    <p className="text-white/50 text-sm">
                                        Önce &ldquo;Dışa Aktar&rdquo; ile mevcut CSV formatını indirin, düzenleyin ve buraya yükleyin.
                                    </p>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-colors">
                                        <Upload className="w-8 h-8 text-white/20 mb-2" />
                                        <span className="text-white/40 text-sm">CSV dosyası seçin veya sürükleyin</span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
                                        />
                                    </label>
                                </>
                            )}

                            {csvPreview && !importResult && (
                                <>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-white">{csvPreview.length} ürün bulundu</span>
                                    </div>
                                    <div className="bg-white/5 rounded-md p-3 max-h-40 overflow-y-auto">
                                        {csvPreview.slice(0, 5).map((row, i) => (
                                            <p key={i} className="text-white/60 text-xs truncate">
                                                {i + 1}. {row[0] || "—"} — {row[2] || "—"} — ₺{row[3] || "0"}
                                            </p>
                                        ))}
                                        {csvPreview.length > 5 && (
                                            <p className="text-white/30 text-xs mt-1">...ve {csvPreview.length - 5} ürün daha</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCsvPreview(null)}
                                            className="flex-1 py-2.5 rounded-md border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5"
                                        >
                                            Geri
                                        </button>
                                        <button
                                            onClick={handleImport}
                                            disabled={importing}
                                            className="flex-1 py-2.5 rounded-md bg-danger text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</> : <>İçe Aktar</>}
                                        </button>
                                    </div>
                                </>
                            )}

                            {importResult && (
                                <>
                                    <div className="space-y-2">
                                        {importResult.success > 0 && (
                                            <div className="flex items-center gap-2 text-green-500 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                {importResult.success} ürün başarıyla işlendi
                                            </div>
                                        )}
                                        {importResult.errors?.length > 0 && (
                                            <div className="space-y-1">
                                                {importResult.errors.map((err, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-yellow-500 text-xs">
                                                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                                        {err}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setShowImport(false); setImportResult(null); setCsvPreview(null); }}
                                        className="w-full py-2.5 rounded-md bg-white/5 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                    >
                                        Kapat
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                open={!!deleteTarget}
                title={deleteType === "bulk" ? "Toplu Silme" : "Ürün Silme"}
                message={deleteType === "bulk"
                    ? `${selectedIds.size} ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                    : "Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz."}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={bulkDeleting}
            />
        </div>
    );
}
