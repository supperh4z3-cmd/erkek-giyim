"use client";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "rect" | "circle";
    width?: string | number;
    height?: string | number;
    count?: number;
}

export default function Skeleton({
    className = "",
    variant = "rect",
    width,
    height,
    count = 1,
}: SkeletonProps) {
    const baseClass = "animate-pulse bg-white/[0.06] rounded";

    const variantClass =
        variant === "circle"
            ? "rounded-full"
            : variant === "text"
                ? "rounded-md h-4"
                : "rounded-lg";

    const style: React.CSSProperties = {
        width: width ?? "100%",
        height: height ?? (variant === "circle" ? width ?? 40 : variant === "text" ? 16 : 40),
    };

    if (count === 1) {
        return <div className={`${baseClass} ${variantClass} ${className}`} style={style} />;
    }

    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${baseClass} ${variantClass} ${className}`} style={style} />
            ))}
        </div>
    );
}

// Pre-built skeleton patterns
export function StatCardSkeleton() {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-lg p-6 space-y-4">
            <Skeleton variant="circle" width={48} height={48} />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" height={32} />
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton variant="text" width={i === 0 ? "80%" : "60%"} />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0a0a0a]">
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-6 py-4 border-b border-white/5">
                                    <Skeleton variant="text" width="60%" height={12} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.from({ length: rows }).map((_, i) => (
                            <TableRowSkeleton key={i} cols={cols} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton width={200} height={36} />
                    <Skeleton width={300} height={14} />
                </div>
                <Skeleton width={100} height={36} />
            </div>
            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton height={280} className="rounded-lg" />
                <Skeleton height={280} className="rounded-lg" />
            </div>
        </div>
    );
}
