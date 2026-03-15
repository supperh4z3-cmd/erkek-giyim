"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CartDrawer() {
    const { isCartOpen, setIsCartOpen, items, removeItem, updateQuantity, subtotal } = useCart();
    const pathname = usePathname();
    if (pathname?.startsWith("/admin")) return null;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#0a0a0a] border-l border-[#1a1a1a] shadow-2xl z-[110] flex flex-col"
                    >
                        {/* Animated Neon Glows */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-l-2xl">
                            <motion.div
                                animate={{
                                    top: ["-20%", "100%", "-20%"],
                                    backgroundColor: ["#ff0000", "#2563eb", "#ff0000"],
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute -left-12 w-24 h-64 opacity-60 blur-[60px] rounded-full"
                            />
                            <motion.div
                                animate={{
                                    bottom: ["-20%", "100%", "-20%"],
                                    backgroundColor: ["#2563eb", "#ff0000", "#2563eb"],
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute -right-12 w-24 h-64 opacity-60 blur-[60px] rounded-full"
                            />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a] relative z-10">
                            <h2 className="font-display text-white text-3xl uppercase tracking-tighter">
                                SEPETİM <span className="text-danger">.</span>
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cart Items Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative z-10">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.size}-${item.color}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-4 group"
                                    >
                                        <div className="relative w-24 h-32 flex-none bg-[#111] overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-1 justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <Link href={`/product/${item.slug || item.id}`} onClick={() => setIsCartOpen(false)}>
                                                        <h3 className="font-bold text-white uppercase text-sm leading-tight hover:text-danger transition-colors line-clamp-2">
                                                            {item.name}
                                                        </h3>
                                                    </Link>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.size, item.color)}
                                                        className="text-white/30 hover:text-danger transition-colors mt-0.5"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-white/50 text-[10px] font-mono tracking-widest uppercase mt-2">
                                                    {item.size} / {item.color}
                                                </p>
                                            </div>

                                            <div className="flex items-end justify-between mt-4">
                                                {/* Quantity Adjuster */}
                                                <div className="flex items-center border border-[#1a1a1a] bg-[#050505]">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-white text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="font-display text-white text-lg">
                                                    ₺{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center mt-10">
                                    <div className="w-16 h-16 border border-[#1a1a1a] flex items-center justify-center mb-6 opacity-30">
                                        <ShoppingBag className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-white/50 font-mono tracking-widest text-xs uppercase mb-6">Sepetiniz şu an boş.</p>
                                    <Link
                                        href="/collections"
                                        onClick={() => setIsCartOpen(false)}
                                        className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-danger hover:text-white transition-colors"
                                    >
                                        KOLEKSİYONLARI KEŞFET
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Footer (Subtotal & Checkout) */}
                        {items.length > 0 && (
                            <div className="mt-auto p-6 bg-[#050505] border-t border-[#1a1a1a] relative z-10">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Ara Toplam:</span>
                                    <span className="font-display text-white text-3xl">₺{subtotal.toFixed(2)}</span>
                                </div>
                                <p className="text-[#fcfcfc]/30 text-[10px] font-mono mb-6 leading-relaxed">
                                    Kargo ve vergiler ödeme adımında hesaplanacaktır.
                                </p>
                                <Link
                                    href="/checkout"
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-full relative group overflow-hidden bg-white text-black px-8 py-5 font-bold uppercase tracking-widest text-xs flex justify-between items-center transition-colors hover:text-white block text-center"
                                >
                                    <div className="absolute inset-0 bg-danger transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                                    <span className="relative z-10 flex items-center gap-2">
                                        GÜVENLİ ÖDEME
                                    </span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
