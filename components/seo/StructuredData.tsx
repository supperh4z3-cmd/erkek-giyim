"use client";

import { useEffect, useState } from "react";

interface SitelinkItem {
    label: string;
    url: string;
}

export default function StructuredData() {
    const [sitelinks, setSitelinks] = useState<SitelinkItem[]>([]);
    const [siteName, setSiteName] = useState("CHASE & CHAIN");

    useEffect(() => {
        fetch("/api/seo")
            .then(r => r.json())
            .then(data => {
                if (data._sitelinks) setSitelinks(data._sitelinks.filter((s: SitelinkItem) => s.label && s.url));
            })
            .catch(() => {});

        fetch("/api/settings")
            .then(r => r.json())
            .then(data => {
                if (data.general?.siteName) setSiteName(data.general.siteName);
            })
            .catch(() => {});
    }, []);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://chaseandchain.com";

    // Organization + WebSite + SiteNavigationElement
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${baseUrl}/#organization`,
                "name": siteName,
                "url": baseUrl,
                "logo": `${baseUrl}/logo.png`,
            },
            {
                "@type": "WebSite",
                "@id": `${baseUrl}/#website`,
                "url": baseUrl,
                "name": siteName,
                "publisher": { "@id": `${baseUrl}/#organization` },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${baseUrl}/collections?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                },
            },
            ...(sitelinks.length > 0 ? [{
                "@type": "SiteNavigationElement",
                "@id": `${baseUrl}/#sitenavigation`,
                "name": sitelinks.map(s => s.label),
                "url": sitelinks.map(s => `${baseUrl}${s.url}`),
            }] : []),
            ...(sitelinks.map(s => ({
                "@type": "WebPage",
                "name": s.label,
                "url": `${baseUrl}${s.url}`,
                "description": ("description" in s ? (s as { description?: string }).description : "") || "",
                "isPartOf": { "@id": `${baseUrl}/#website` },
            }))),
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
