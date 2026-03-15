"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchOverlay from "@/components/ui/SearchOverlay";

interface DropdownLink {
    id: string;
    label: string;
    link: string;
}

interface ExtraLink {
    id: string;
    label: string;
    link: string;
}

interface DropdownVisual {
    id: string;
    type: "large" | "small";
    title: string;
    subtitle?: string;
    image: string;
    link: string;
}

const DEFAULT_DROPDOWN: DropdownLink[] = [
    { id: "dl-1", label: "T-SHIRTS", link: "/collections/t-shirts" },
    { id: "dl-2", label: "BOTTOMS", link: "/collections/bottoms" },
    { id: "dl-3", label: "OUTWEAR", link: "/collections/outwear" },
    { id: "dl-4", label: "KNITWEAR", link: "/collections/knitwear" },
    { id: "dl-5", label: "DENIM STUDIO", link: "/collections/denim-studio" },
];

const DEFAULT_EXTRA: ExtraLink[] = [
    { id: "el-1", label: "CAMPAIGNS", link: "/campaigns" },
    { id: "el-2", label: "Sokağın Ritmi", link: "/discover" },
];

const DEFAULT_VISUALS: DropdownVisual[] = [
    { id: "dv-1", type: "large", title: "OUTWEAR", subtitle: "FEATURED DROP", image: "/category-outwear.png", link: "/collections/outwear" },
    { id: "dv-2", type: "small", title: "ACCESSORIES", image: "/category-accessories.png", link: "/collections/accessories" },
    { id: "dv-3", type: "small", title: "HEADWEAR", image: "/category-headwear.png", link: "/collections/headwear" },
];

export default function Header() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [dropdownLinks, setDropdownLinks] = useState<DropdownLink[]>(DEFAULT_DROPDOWN);
    const [extraLinks, setExtraLinks] = useState<ExtraLink[]>(DEFAULT_EXTRA);
    const [dropdownVisuals, setDropdownVisuals] = useState<DropdownVisual[]>(DEFAULT_VISUALS);
    const { toggleCart, totalItems } = useCart();
    const { customer } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.dropdown) setDropdownLinks(data.dropdown);
                if (data.extraLinks) setExtraLinks(data.extraLinks);
                if (data.dropdownVisuals && data.dropdownVisuals.length > 0) setDropdownVisuals(data.dropdownVisuals);
            })
            .catch(() => {});
    }, []);

    // Check for data-dark-page attribute (set by 404 and other dynamic dark pages)
    const [forceDark, setForceDark] = useState(false);
    useEffect(() => {
        const check = () => setForceDark(document.documentElement.getAttribute("data-dark-page") === "true");
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-dark-page"] });
        return () => observer.disconnect();
    }, [pathname]);

    if (pathname?.startsWith("/admin")) return null;
    const darkPages = ["/collections", "/discover", "/campaigns", "/about", "/shipping", "/returns", "/faq", "/contact", "/size-guide", "/login", "/register", "/account", "/terms", "/privacy", "/new", "/checkout"];

    const isLightThemePage = !forceDark && pathname !== "/" && !darkPages.some(p => pathname.startsWith(p));
    const isDarkText = isLightThemePage && !activeMenu && !mobileMenuOpen;

    return (
        <>
            <motion.header
                onMouseLeave={() => setActiveMenu(null)}
                initial={{ backgroundColor: "rgba(10, 10, 10, 0)" }}
                animate={{
                    backgroundColor: activeMenu ? "rgba(10, 10, 10, 1)" : "rgba(10, 10, 10, 0)"
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 z-50 w-full pt-8"
            >
                <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">

                    {/* Mobile Menu Button - Visible only on mobile */}
                    <div className="flex-1 md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className={`p-2 -ml-2 transition-colors relative z-[60] ${isDarkText ? "text-primary-900 hover:text-danger" : "text-white hover:text-danger"}`}
                            aria-label="Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Logo - Centered for Drill aesthetic on desktop, left on mobile */}
                    <div className="flex-1 flex justify-center md:flex-none md:justify-start z-50">
                        <Link href="/" className={`font-display font-bold text-lg sm:text-2xl md:text-3xl tracking-tighter whitespace-nowrap flex items-center ${isDarkText ? "text-primary-900" : "text-white"}`}>
                            <span className="italic">CHASE</span> <span className="text-danger italic mx-1">&</span> <span className="italic">CHAIN</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center justify-center gap-10 flex-1 h-full z-50">
                        <Link href="/new" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkText ? "text-primary-900 hover:text-danger" : "text-white hover:text-danger"}`}>
                            NEW SEASON
                        </Link>

                        {/* Collections Dropdown Trigger */}
                        <div
                            className="relative h-full flex items-center"
                            onMouseEnter={() => setActiveMenu("collections")}
                        >
                            <button className={`text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group ${isDarkText ? "text-primary-900/80 hover:text-primary-900" : "text-white/80 hover:text-white"}`}>
                                COLLECTIONS
                            </button>
                        </div>

                        <Link href="/campaigns" className={`text-sm font-medium uppercase tracking-widest transition-colors ${isDarkText ? "text-primary-900/80 hover:text-primary-900" : "text-white/80 hover:text-white"}`}>
                            CAMPAIGNS
                        </Link>
                        <Link href="/about" className={`text-sm font-medium uppercase tracking-widest transition-colors ${isDarkText ? "text-primary-900/80 hover:text-primary-900" : "text-white/80 hover:text-white"}`}>
                            ABOUT
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className={`flex items-center justify-end gap-5 flex-1 md:flex-none z-50 ${isDarkText ? "text-primary-900" : "text-white"}`}>
                        <button onClick={() => setSearchOpen(true)} className="hover:text-danger transition-colors" aria-label="Search">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link href={customer ? "/account" : "/login"} className="hidden sm:block hover:text-danger transition-colors" aria-label="Account">
                            <User className="w-5 h-5" />
                        </Link>
                        <button onClick={toggleCart} className="relative hover:text-danger transition-colors" aria-label="Cart">
                            <ShoppingBag className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Asymmetrical Mega Menu using Framer Motion */}
                <AnimatePresence>
                    {activeMenu === "collections" && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeInOut" } }}
                            transition={{
                                duration: 0.5,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className={`absolute top-full left-0 w-full border-y shadow-2xl overflow-hidden ${isLightThemePage ? "bg-background border-primary-900/10" : "bg-[#0a0a0a] border-white/10"}`}
                        >
                            <div className="container mx-auto px-4 lg:px-8 py-12 relative">
                                {/* --- Asymmetric Neon Glow (Taşma / Işık Süzmesi) --- */}
                                {isLightThemePage && (
                                    <>
                                        {/* Top Right Red Bleed */}
                                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 blur-[160px] rounded-full pointer-events-none transform translate-x-1/4 -translate-y-1/3" />
                                        {/* Top Right Blue Bleed */}
                                        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none transform -translate-y-1/2" />
                                        {/* Bottom Left Blue Bleed */}
                                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none transform -translate-x-1/4 translate-y-1/4" />
                                    </>
                                )}

                                <div className="flex gap-12 relative z-10">
                                    {/* Left Side: Navigation Links (Narrow) */}
                                    <div className="w-1/3 flex flex-col gap-8">
                                        <div>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2 ${isLightThemePage ? "text-primary-900/50 border-primary-900/10" : "text-white/50 border-white/10"}`}>
                                                READY TO WEAR
                                            </h4>
                                            <ul className="flex flex-col gap-1">
                                                {dropdownLinks.map((item) => (
                                                    <li key={item.id}>
                                                        <Link href={item.link} className={`font-display text-lg uppercase tracking-tighter hover:translate-x-2 transition-transform inline-block py-1 ${isLightThemePage ? "text-primary-900/80 hover:text-primary-900" : "text-white/80 hover:text-white"}`}>
                                                            {item.label}
                                                        </Link>
                                                    </li>
                                                ))}

                                                <li className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                                                    {extraLinks.map((el) => (
                                                        <Link
                                                            key={el.id}
                                                            href={el.link}
                                                            className={`font-display text-lg uppercase tracking-tighter hover:translate-x-2 transition-transform inline-block py-1 ${el.link === "/discover" ? "hover-strobe-pause font-black" : ""} ${isLightThemePage ? "text-primary-900/80 hover:text-primary-900" : "text-white/80 hover:text-white"}`}
                                                            style={el.link === "/discover" ? { "--strobe-pause-color": isLightThemePage ? "#0a0a0a" : "#ffffff" } as React.CSSProperties : undefined}
                                                        >
                                                            {el.label} {el.link === "/discover" && <span className="text-[10px] tracking-[0.3em] font-sans ml-2 opacity-50 relative -top-1">DISCOVER</span>}
                                                        </Link>
                                                    ))}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Right Side: Asymmetrical Featured Visuals (Wide) */}
                                    <div className="w-2/3 grid grid-cols-2 gap-4 h-[400px]">
                                        {/* Big Featured Item */}
                                        {dropdownVisuals.filter(v => v.type === "large").slice(0, 1).map(v => (
                                            <Link key={v.id} href={v.link} className="group relative w-full h-full bg-white border border-border cursor-pointer overflow-hidden block">
                                                <Image
                                                    src={v.image || "/category-outwear.png"}
                                                    alt={v.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                                                    <div>
                                                        {v.subtitle && <p className="text-xs font-bold tracking-widest uppercase mb-1 text-white/70">{v.subtitle}</p>}
                                                        <h3 className="text-3xl font-display uppercase leading-none">{v.title}</h3>
                                                    </div>
                                                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm group-hover:bg-danger transition-colors">
                                                        <ArrowRight className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {/* Smaller Featured Items Stacked */}
                                        <div className="flex flex-col gap-4 h-full">
                                            {dropdownVisuals.filter(v => v.type === "small").map(v => (
                                                <Link key={v.id} href={v.link} className="group relative flex-1 w-full bg-white border border-border cursor-pointer overflow-hidden block">
                                                    <Image
                                                        src={v.image || "/category-accessories.png"}
                                                        alt={v.title}
                                                        fill
                                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500" />
                                                    <h3 className="absolute bottom-4 left-4 text-white text-xl font-display uppercase">{v.title}</h3>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fullscreen Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: "-100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "-100%" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col"
                        >
                            {/* Mobile Menu Header */}
                            <div className="container mx-auto px-4 h-20 flex items-center justify-between border-b border-white/10">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-white hover:text-danger p-2 -ml-2 transition-colors"
                                >
                                    <X className="w-8 h-8" />
                                </button>
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-xl tracking-tighter text-white flex items-center">
                                    <span className="italic">CHASE</span> <span className="text-danger italic mx-1">&</span> <span className="italic">CHAIN</span>
                                </Link>
                                <div className="w-8" /> {/* Spacer to center logo */}
                            </div>

                            {/* Mobile Menu Links */}
                            <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col gap-8">
                                <Link href="/new" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-display uppercase tracking-tighter text-white hover:text-danger transition-colors">
                                    NEW SEASON
                                </Link>
                                <Link href="/campaigns" onClick={() => setMobileMenuOpen(false)} className="text-4xl font-display uppercase tracking-tighter text-white hover:text-danger transition-colors">
                                    CAMPAIGNS
                                </Link>

                                <div className="flex flex-col gap-4 border-y border-white/10 py-8">
                                    <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest">COLLECTIONS</h4>
                                    {dropdownLinks.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.link}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-3xl font-display uppercase tracking-tighter text-white/80 hover:text-white transition-colors flex items-center justify-between group"
                                        >
                                            <span>{item.label}</span>
                                            <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-danger transition-colors" />
                                        </Link>
                                    ))}
                                    {/* Mobile Discover Link */}
                                    <Link
                                        href="/discover"
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{ "--strobe-pause-color": "#ffffff" } as React.CSSProperties}
                                        className="mt-4 pt-4 border-t border-white/10 text-3xl font-display uppercase tracking-tighter text-white transition-colors flex items-center justify-between group hover-strobe-pause"
                                    >
                                        <span>Sokağın Ritmi <span className="text-[10px] tracking-[0.3em] font-sans ml-2 opacity-50 relative -top-1">DISCOVER</span></span>
                                        <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-danger transition-colors" />
                                    </Link>
                                </div>

                                <Link href={customer ? "/account" : "/login"} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-display uppercase tracking-tighter text-white hover:text-danger transition-colors">
                                    {customer ? "Hesabım" : "Giriş Yap"}
                                </Link>
                            </div>

                            {/* Mobile Menu Footer */}
                            <div className="p-6 border-t border-white/10 text-center">
                                <p className="text-white/30 text-xs tracking-widest uppercase font-medium">© {new Date().getFullYear()} CHASE & CHAIN</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Search Overlay */}
            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
