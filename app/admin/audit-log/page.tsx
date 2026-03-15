"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Filter, Package, Truck, FolderTree, Ticket, Settings, Shield, Search as SearchIcon } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/admin/Skeleton";

interface AuditEntry {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: string | null;
    created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    create: { label: "Oluşturma", color: "text-green-500 bg-green-500/10" },
    update: { label: "Güncelleme", color: "text-blue-500 bg-blue-500/10" },
    delete: { label: "Silme", color: "text-red-500 bg-red-500/10" },
    status_change: { label: "Durum Değişikliği", color: "text-purple-500 bg-purple-500/10" },
    login: { label: "Giriş", color: "text-cyan-500 bg-cyan-500/10" },
    settings_update: { label: "Ayar Güncelleme", color: "text-yellow-500 bg-yellow-500/10" },
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
    product: <Package className="w-4 h-4" />,
    order: <Truck className="w-4 h-4" />,
    category: <FolderTree className="w-4 h-4" />,
    coupon: <Ticket className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    auth: <Shield className="w-4 h-4" />,
};

const ENTITY_LABELS: Record<string, string> = {
    product: "Ürün",
    order: "Sipariş",
    category: "Kategori",
    coupon: "Kupon",
    customer: "Müşteri",
    settings: "Ayarlar",
    seo: "SEO",
    campaign: "Kampanya",
    discover: "Discover",
    policy: "Sözleşme",
    auth: "Kimlik",
};

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 25;

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("limit", "100");
        if (entityFilter !== "all") params.set("entityType", entityFilter);
        if (actionFilter !== "all") params.set("action", actionFilter);

        fetch(`/api/audit-log?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [entityFilter, actionFilter]);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [entityFilter, actionFilter]);

    const totalPages = Math.ceil(logs.length / PAGE_SIZE);
    const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const timeAgo = (dateStr: string) => {
        const now = new Date().getTime();
        const diff = now - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Şimdi";
        if (mins < 60) return `${mins} dk önce`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} sa önce`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} gün önce`;
        return new Date(dateStr).toLocaleDateString("tr-TR");
    };

    if (loading) {
        return <TableSkeleton rows={10} cols={4} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Etkinlik Logu</h1>
                    <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                        Son {logs.length} işlem kaydı
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <Filter className="w-4 h-4 text-white/30" />
                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none"
                    >
                        <option value="all">Tüm Varlıklar</option>
                        {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none"
                    >
                        <option value="all">Tüm Eylemler</option>
                        {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Timeline */}
            {logs.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                    <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Etkinlik kaydı bulunamadı</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {paginatedLogs.map((log) => {
                        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "text-white/50 bg-white/5" };
                        const entityLabel = ENTITY_LABELS[log.entity_type] || log.entity_type;
                        const entityIcon = ENTITY_ICONS[log.entity_type] || <Settings className="w-4 h-4" />;

                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 px-4 py-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                            >
                                {/* Icon */}
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 shrink-0 mt-0.5">
                                    {entityIcon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${actionInfo.color}`}>
                                            {actionInfo.label}
                                        </span>
                                        <span className="text-white/40 text-xs">{entityLabel}</span>
                                        {log.entity_id && (
                                            <span className="text-white/20 text-[10px] font-mono">#{log.entity_id}</span>
                                        )}
                                    </div>
                                    {log.details && (
                                        <p className="text-white/50 text-sm mt-1 line-clamp-1">{log.details}</p>
                                    )}
                                </div>

                                {/* Time */}
                                <span className="text-[10px] font-mono text-white/20 shrink-0 mt-1">
                                    {timeAgo(log.created_at)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={logs.length}
                pageSize={PAGE_SIZE}
            />
        </div>
    );
}
