"use client";

import { useEffect, useState } from "react";
import { PolicyLayout } from "@/components/ui/PolicyLayout";
import { Loader2 } from "lucide-react";

export default function TermsPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("/api/policies")
            .then(res => res.json())
            .then(d => setData(d.terms))
            .catch(() => {});
    }, []);

    if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/30 animate-spin" /></div>;

    return <PolicyLayout data={data} />;
}
