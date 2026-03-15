"use client";

import { SIZE_GUIDE_DATA } from "@/lib/constants/policy-data";
import { motion } from "framer-motion";

export default function SizeGuidePage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-danger selection:text-white px-4 md:px-8 pb-32 pt-32">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-20 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter mb-4"
                    >
                        {SIZE_GUIDE_DATA.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-danger font-bold tracking-widest text-sm uppercase"
                    >
                        {SIZE_GUIDE_DATA.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {SIZE_GUIDE_DATA.categories.map((category, catIndex) => (
                        <motion.section
                            key={catIndex}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: catIndex * 0.2 }}
                        >
                            <h2 className="text-2xl font-display font-bold uppercase tracking-widest mb-8 flex items-center gap-4">
                                <span className="text-danger h-px w-8 inline-block" />
                                {category.name}
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr>
                                            {category.columns.map((col, idx) => (
                                                <th
                                                    key={idx}
                                                    className="p-4 border-b border-[#333] font-bold text-xs uppercase tracking-[0.2em] text-white/50 bg-[#0a0a0a]"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.rows.map((row, rowIdx) => (
                                            <tr
                                                key={rowIdx}
                                                className="group hover:bg-[#111] transition-colors border-b border-[#222]"
                                            >
                                                {row.map((cell, cellIdx) => (
                                                    <td
                                                        key={cellIdx}
                                                        className={`p-4 font-medium text-lg ${cellIdx === 0 ? "font-bold text-white group-hover:text-danger transition-colors" : "text-white/70"}`}
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>
                    ))}
                </div>

            </div>
        </main>
    );
}
