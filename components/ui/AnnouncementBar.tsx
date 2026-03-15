"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AnnouncementItem {
    text: string;
    link?: string;
}

interface AnnouncementData {
    isActive: boolean;
    // Yeni format: items dizisi
    items?: AnnouncementItem[];
    // Eski format uyumluluğu
    text?: string;
    link?: string;
}

export default function AnnouncementBar() {
    const pathname = usePathname();
    const [items, setItems] = useState<AnnouncementItem[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => {
                if (data.announcement) {
                    const ann: AnnouncementData = data.announcement;
                    setIsActive(ann.isActive);

                    // Yeni format (items dizisi)
                    if (ann.items && ann.items.length > 0) {
                        setItems(ann.items.filter(i => i.text));
                    }
                    // Eski format uyumluluğu (tek text)
                    else if (ann.text) {
                        setItems([{ text: ann.text, link: ann.link }]);
                    }
                }
            })
            .catch(() => {});
    }, []);

    // Döngülü geçiş (4 saniyede bir)
    const nextItem = useCallback(() => {
        if (items.length <= 1) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
            setIsAnimating(false);
        }, 400);
    }, [items.length]);

    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(nextItem, 4000);
        return () => clearInterval(interval);
    }, [items.length, nextItem]);

    if (pathname?.startsWith("/admin")) return null;
    if (!isActive || items.length === 0) return null;

    const current = items[currentIndex];
    if (!current) return null;

    const content = (
        <div className="w-full bg-black text-white text-[10px] md:text-xs py-2 px-4 text-center font-bold tracking-widest uppercase z-50 relative overflow-hidden">
            <div
                className="transition-all duration-400 ease-in-out"
                style={{
                    opacity: isAnimating ? 0 : 1,
                    transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
                }}
            >
                {current.text}
            </div>
        </div>
    );

    if (current.link) {
        return <Link href={current.link}>{content}</Link>;
    }

    return content;
}
