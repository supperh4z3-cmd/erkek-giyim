"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Search, Star, Sparkles, Loader2 } from "lucide-react";
import { Product } from "@/lib/constants/products-data";
import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/admin/Skeleton";

export default function FeaturedManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggleError, setToggleError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

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

    const toggleNewSeason = async (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        try {
            await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isNewSeason: !product.isNewSeason }),
            });
            setProducts(products.map(p =>
                p.id === id ? { ...p, isNewSeason: !p.isNewSeason } : p
            ));
        } catch {
            setToggleError("Yeni Sezon durumu güncellenemedi");
            setTimeout(() => setToggleError(null), 4000);
        }
    };

    const toggleBestSeller = async (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        try {
            await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isBestSeller: !product.isBestSeller }),
            });
            setProducts(products.map(p =>
                p.id === id ? { ...p, isBestSeller: !p.isBestSeller } : p
            ));
        } catch {
            setToggleError("Çok Satan durumu güncellenemedi");
            setTimeout(() => setToggleError(null), 4000);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (loading) {
        return <TableSkeleton rows={8} cols={4} />;
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Vitrin Yönetimi</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Yeni Sezon & Çok Satan Ürünleri Belirle
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-white/50 mb-4">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-xs uppercase tracking-widest font-mono">Yeni Sezon</span>
                    </div>
                    <div>
                        <span className="text-3xl font-display">{products.filter(p => p.isNewSeason).length}</span>
                        <span className="text-white/40 text-sm ml-2">aktif ürün</span>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 rounded-lg p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-white/50 mb-4">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs uppercase tracking-widest font-mono">Çok Satanlar</span>
                    </div>
                    <div>
                        <span className="text-3xl font-display">{products.filter(p => p.isBestSeller).length}</span>
                        <span className="text-white/40 text-sm ml-2">aktif ürün</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-[#151515]">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Ürün adı veya ID ile ara..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-10 pr-4 py-2 text-sm rounded-md outline-none focus:border-white/30 transition-colors placeholder:text-white/20 font-mono"
                        />
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0a0a0a] border-b border-white/5 text-white/40 font-mono text-xs uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-normal">Ürün</th>
                                <th className="px-6 py-4 font-normal">Kategori</th>
                                <th className="px-6 py-4 font-normal text-center">Yeni Sezon</th>
                                <th className="px-6 py-4 font-normal text-center">Çok Satan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-[#1a1a1a] relative overflow-hidden border border-white/10 shrink-0">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium group-hover:text-danger transition-colors">{product.name}</div>
                                                <div className="text-xs text-white/40 font-mono">{product.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-white/5 text-white/60 px-2 py-1 rounded text-xs font-mono">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-white/70">
                                        <button
                                            onClick={() => toggleNewSeason(product.id)}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${product.isNewSeason ? 'bg-blue-600' : 'bg-white/10'}`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${product.isNewSeason ? 'left-7 font-bold text-blue-600 flex items-center justify-center' : 'left-1'}`}
                                            >
                                                {product.isNewSeason && <Check className="w-3 h-3 text-blue-600" />}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleBestSeller(product.id)}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${product.isBestSeller ? 'bg-yellow-500' : 'bg-white/10'}`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${product.isBestSeller ? 'left-7 font-bold text-yellow-500 flex items-center justify-center' : 'left-1'}`}
                                            >
                                                {product.isBestSeller && <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-white/40 font-mono text-sm">
                                        Arama kriterlerine uygun ürün bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Error Message */}
            {toggleError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-bold">
                    {toggleError}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                pageSize={PAGE_SIZE}
            />
        </div>
    );
}
