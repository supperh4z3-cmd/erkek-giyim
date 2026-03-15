import type { Metadata } from "next";
import { Inter, Kanit, Caveat } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import StructuredData from "@/components/seo/StructuredData";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const kanit = Kanit({
    variable: "--font-kanit",
    weight: ["400", "500", "700", "800"],
    subsets: ["latin"],
    display: "swap",
});

const caveat = Caveat({
    variable: "--font-caveat",
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "CHASE & CHAIN | Premium Streetwear",
    description: "Premium oversize streetwear, hoodies, and denim crafted for the modern drill aesthetic.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className="dark" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${kanit.variable} ${caveat.variable} font-sans antialiased bg-primary-900 text-foreground min-h-screen flex flex-col`}
                suppressHydrationWarning
            >
                <AuthProvider>
                <CartProvider>
                    <AnnouncementBar />
                    <StructuredData />
                    <Header />

                    <main className="flex-1 w-full relative">
                        {children}
                    </main>

                    <Footer />

                    {/* Slide-over Cart Drawer (Globally available) */}
                    <CartDrawer />
                </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
