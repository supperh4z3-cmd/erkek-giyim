import { PolicyData } from "@/lib/constants/policy-data";
import { motion } from "framer-motion";

export function PolicyLayout({ data }: { data: PolicyData }) {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-danger selection:text-white px-4 md:px-8 pb-32 pt-32">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">

                {/* Left Side: Sticky Title Area */}
                <div className="md:col-span-4 relative">
                    <div className="md:sticky md:top-32 space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter"
                        >
                            {data.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-danger font-bold tracking-widest text-sm uppercase"
                        >
                            {data.subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="h-px w-24 bg-white/20 origin-left"
                        />
                    </div>
                </div>

                {/* Right Side: Content Sections */}
                <div className="md:col-span-8 space-y-16">
                    {data.sections.map((section, index) => (
                        <motion.section
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <h2 className="text-2xl font-display uppercase font-bold mb-6 text-white/90">
                                <span className="text-danger/50 mr-3 text-sm">0{index + 1}</span>
                                {section.heading}
                            </h2>
                            <div className="space-y-4 text-white/60 text-base md:text-lg leading-relaxed font-medium">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>

            </div>
        </main>
    );
}
