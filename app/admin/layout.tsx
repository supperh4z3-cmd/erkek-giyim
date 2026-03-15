"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Truck,
    Settings,
    LogOut,
    Crown,
    Files,
    Users,
    ChevronDown,
    Ticket,
    Menu,
    X,
    Search,
    Globe,
    BarChart3,
    ClipboardList,
    PanelLeftClose,
    PanelLeft,
    Mail,
    HardDrive
} from "lucide-react";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/admin/NotificationBell";

const ADMIN_NAVIGATION = [
    { name: "Kontrol Paneli", href: "/admin", icon: LayoutDashboard },
    { name: "Ürünler", href: "/admin/products", icon: Package },
    { name: "Kategoriler", href: "/admin/categories", icon: FolderTree },
    { name: "Siparişler", href: "/admin/orders", icon: Truck },
    { name: "Müşteriler", href: "/admin/customers", icon: Users },
    { name: "Öne Çıkanlar", href: "/admin/featured", icon: Crown },
    { name: "Kuponlar", href: "/admin/coupons", icon: Ticket },
    {
        name: "Sayfalar",
        href: "/admin/pages",
        icon: Files,
        subnav: [
            { name: "Sokağın Ritmi (Discover)", href: "/admin/pages/discover" },
            { name: "Kampanyalar", href: "/admin/pages/campaigns" },
            { name: "Sözleşmeler & S.S.S.", href: "/admin/pages/policy" },
        ]
    },
    { name: "SEO Yönetimi", href: "/admin/seo", icon: Search },
    { name: "Finans", href: "/admin/finance", icon: BarChart3 },
    { name: "Etkinlik Logu", href: "/admin/audit-log", icon: ClipboardList },
    { name: "E-posta Şablonları", href: "/admin/email-templates", icon: Mail },
    { name: "Yedekleme", href: "/admin/backup", icon: HardDrive },
    { name: "Ayarlar", href: "/admin/content", icon: Settings },
];

// Sayfa başlıkları
const PAGE_TITLES: Record<string, string> = {
    "/admin": "Kontrol Paneli",
    "/admin/products": "Ürün Yönetimi",
    "/admin/categories": "Kategori Yönetimi",
    "/admin/orders": "Sipariş Yönetimi",
    "/admin/customers": "Müşteri Yönetimi",
    "/admin/featured": "Öne Çıkanlar",
    "/admin/coupons": "Kupon Yönetimi",
    "/admin/pages/discover": "Sokağın Ritmi",
    "/admin/pages/campaigns": "Kampanyalar",
    "/admin/pages/policy": "Sözleşmeler",
    "/admin/seo": "SEO Yönetimi",
    "/admin/finance": "Finans",
    "/admin/audit-log": "Etkinlik Logu",
    "/admin/email-templates": "E-posta Şablonları",
    "/admin/backup": "Veritabanı Yedekleme",
    "/admin/content": "Site Ayarları",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [openSubnavs, setOpenSubnavs] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleSubnav = (name: string) => {
        setOpenSubnavs(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isLoginPage = pathname === "/admin/login";

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // JWT Auth Check
    useEffect(() => {
        if (isLoginPage) return;

        fetch("/api/auth/verify")
            .then(res => {
                setIsAuthenticated(res.ok);
                setIsLoading(false);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setIsLoading(false);
            });
    }, [pathname, isLoginPage]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
    };

    // Get page title
    const getPageTitle = () => {
        for (const [path, title] of Object.entries(PAGE_TITLES)) {
            if (pathname === path || (path !== "/admin" && pathname.startsWith(path))) return title;
        }
        return "Sistem Kontrol Paneli";
    };

    if (pathname === "/admin/login") {
        return <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">{children}</div>;
    }

    if (isLoading) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-display text-2xl tracking-widest">SİSTEM YÜKLENİYOR...</div>;
    }

    if (!isAuthenticated) {
        if (typeof window !== "undefined") {
            router.push("/admin/login");
        }
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex overflow-hidden">
            {/* Mobile Overlay Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                ${collapsed ? "w-16" : "w-64"} bg-[#111111] border-r border-white/10
                flex flex-col shrink-0
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                {/* Admin Brand Header */}
                <div className={`h-16 lg:h-20 flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"} border-b border-white/10`}>
                    {!collapsed && (
                        <Link href="/admin" className="font-display font-bold text-xl tracking-tighter">
                            <span className="italic">CHASE</span> <span className="text-danger italic mx-1">&</span> <span className="italic">CHAIN</span>
                            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-normal text-white/50 block mt-0.5">
                                Sistem Kontrolü
                            </span>
                        </Link>
                    )}
                    {collapsed && (
                        <Link href="/admin" className="font-display font-bold text-lg text-danger italic">
                            C
                        </Link>
                    )}
                    {/* Mobile close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className={`flex-1 overflow-y-auto py-4 lg:py-6 flex flex-col gap-1 ${collapsed ? "px-2" : "px-3 lg:px-4"}`}>
                    {ADMIN_NAVIGATION.map((item) => {
                        const Icon = item.icon;
                        const isSubnavActive = item.subnav?.some(sub => pathname.startsWith(sub.href));
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) || isSubnavActive;
                        const isOpen = openSubnavs[item.name] || isSubnavActive;

                        return (
                            <div key={item.name} className="flex flex-col">
                                {item.subnav ? (
                                    collapsed ? (
                                        <Link
                                            href={item.href}
                                            className={`flex items-center justify-center px-2 py-2.5 lg:py-3 rounded-md transition-all duration-300 font-medium text-sm lg:text-base ${isActive
                                                ? "bg-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                                }`}
                                            title={item.name}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                        </Link>
                                    ) : (
                                    <button
                                        onClick={() => toggleSubnav(item.name)}
                                        className={`flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 rounded-md transition-all duration-300 font-medium text-sm lg:text-base ${isActive
                                            ? "text-white bg-white/5"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-danger" : ""}`} />
                                            {item.name}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    )
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-2" : "px-3 lg:px-4"} py-2.5 lg:py-3 rounded-md transition-all duration-300 font-medium text-sm lg:text-base ${isActive && !item.subnav
                                            ? "bg-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        {!collapsed && item.name}
                                    </Link>
                                )}

                                {/* Sub-navigation Items */}
                                {item.subnav && !collapsed && (
                                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[200px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                                        <div className="flex flex-col gap-1 pl-11 pr-2 py-1 relative before:content-[''] before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                            {item.subnav.map(subItem => {
                                                const isCurrentSubnav = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                                                return (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className={`py-2 px-3 rounded-md text-sm transition-colors relative ${isCurrentSubnav
                                                            ? "text-white bg-white/10 font-bold"
                                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                                            }`}
                                                    >
                                                        {isCurrentSubnav && (
                                                            <span className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-2 h-px bg-danger" />
                                                        )}
                                                        {subItem.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className={`${collapsed ? "p-2" : "p-3 lg:p-4"} border-t border-white/10`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-2" : "px-3 lg:px-4"} py-2.5 lg:py-3 w-full text-left rounded-md text-white/60 hover:text-danger hover:bg-danger/10 transition-colors font-medium text-sm lg:text-base`}
                        title={collapsed ? "Sistemden Çıkış" : undefined}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && "Sistemden Çıkış"}
                    </button>
                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(prev => !prev)}
                        className={`hidden lg:flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-2" : "px-3 lg:px-4"} py-2.5 w-full text-left rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors text-xs mt-1`}
                        title={collapsed ? "Genişlet" : "Daralt"}
                    >
                        {collapsed ? <PanelLeft className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /><span>Daralt</span></>}
                    </button>
                    {!collapsed && (
                        <div className="mt-3 px-3 lg:px-4 text-[10px] text-white/30 uppercase tracking-widest font-mono">
                            v1.2.0
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a] relative w-full">
                {/* Subtle Grid Background */}
                <div
                    className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                {/* Topbar */}
                <header className="h-14 lg:h-20 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-[#0a0a0a]/80 backdrop-blur-md z-20 shrink-0 relative">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors -ml-1"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Mobile brand */}
                        <span className="lg:hidden font-display font-bold text-base tracking-tighter">
                            <span className="italic">C</span><span className="text-danger italic">&</span><span className="italic">C</span>
                        </span>

                        <h2 className="hidden lg:block font-display text-xl uppercase tracking-widest text-white/80">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs uppercase font-mono tracking-widest text-primary-400 hover:text-primary-300 transition-colors border border-primary-900/50 px-3 py-1.5 rounded-sm">
                            <Globe className="w-3 h-3" />
                            <span className="hidden md:inline">Siteyi Görüntüle</span>
                        </Link>
                        <NotificationBell />
                        <div className="w-8 h-8 rounded-full bg-danger/20 border border-danger flex items-center justify-center text-danger font-bold text-xs uppercase">
                            AD
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
