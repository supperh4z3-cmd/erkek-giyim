import DiscoverFeed from "@/components/discover/DiscoverFeed";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Story | CHASE & CHAIN",
    description: "Discover the premium streetwear lookbook.",
};

export default function DiscoverPage() {
    return (
        <main className="bg-black text-white min-h-screen">
            <DiscoverFeed />
        </main>
    );
}
