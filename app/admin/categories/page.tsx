"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, GripVertical, Loader2 } from "lucide-react";
import SingleFileUploader from "@/components/admin/SingleFileUploader";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CategoryItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
}

interface DropdownItem {
    id: string;
    label: string;
    link: string;
}

interface DropdownVisualBlock {
    id: string;
    type: "large" | "small";
    title: string;
    subtitle?: string;
    image: string;
    link: string;
}

// Sortable Category Block
function SortableCategoryBlock({
    cat,
    index,
    updateCategory,
}: {
    cat: CategoryItem;
    index: number;
    updateCategory: (id: string, field: keyof CategoryItem, value: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto" as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-4 p-4 border border-white/10 rounded-md bg-[#0a0a0a]">
            <div {...attributes} {...listeners} className="mt-2 text-white/20 cursor-grab hover:text-white/60 active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/30">
                    <span>Blok {index + 1}</span>
                    <span>{cat.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => updateCategory(cat.id, "title", e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-sm placeholder:text-white/20 focus:border-white/30 outline-none"
                            placeholder="Koleksiyon Adı"
                        />
                        <input
                            type="text"
                            value={cat.subtitle}
                            onChange={(e) => updateCategory(cat.id, "subtitle", e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-xs placeholder:text-white/20 focus:border-white/30 outline-none font-mono uppercase tracking-widest"
                            placeholder="Alt Başlık"
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={cat.link}
                            onChange={(e) => updateCategory(cat.id, "link", e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-xs placeholder:text-white/20 focus:border-white/30 outline-none font-mono"
                            placeholder="Yönlendirme Linki"
                        />
                    </div>
                </div>
                <SingleFileUploader
                    value={cat.image}
                    onChange={(url) => updateCategory(cat.id, "image", url)}
                    accept="image/*"
                    label="Blok Görseli"
                    placeholder="Görsel yükleyin veya URL yapıştırın"
                />
            </div>
        </div>
    );
}

// Sortable Dropdown Link
function SortableDropdownLink({
    item,
    updateLink,
    removeLink,
}: {
    item: DropdownItem;
    updateLink: (id: string, field: keyof DropdownItem, value: string) => void;
    removeLink: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto" as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-3 p-3 border border-white/10 rounded bg-[#0a0a0a] items-center group">
            <div {...attributes} {...listeners} className="text-white/20 cursor-grab hover:text-white/60 active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
                <input type="text" value={item.label} onChange={(e) => updateLink(item.id, "label", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1.5 rounded text-xs placeholder:text-white/20 focus:border-white/30 outline-none uppercase font-bold" placeholder="Görünen İsim" />
                <input type="text" value={item.link} onChange={(e) => updateLink(item.id, "link", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1.5 rounded text-xs placeholder:text-white/20 focus:border-white/30 outline-none font-mono" placeholder="URL Link" />
            </div>
            <button onClick={() => removeLink(item.id)} className="text-white/20 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1">&times;</button>
        </div>
    );
}

export default function CategoriesManagementPage() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [dropdownLinks, setDropdownLinks] = useState<DropdownItem[]>([]);
    const [extraLinks, setExtraLinks] = useState<DropdownItem[]>([]);
    const [dropdownVisuals, setDropdownVisuals] = useState<DropdownVisualBlock[]>([]);
    const [activeTab, setActiveTab] = useState<0 | 1>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                setCategories(data.homepage || []);
                setDropdownLinks(data.dropdown || []);
                setExtraLinks(data.extraLinks || []);
                const visuals = data.dropdownVisuals || [];
                if (visuals.length === 0) {
                    setDropdownVisuals([
                        { id: `dv-${Date.now()}-1`, type: "large" as const, title: "Outwear", subtitle: "Featured Drop", image: "/category-outwear.png", link: "/collections/outwear" },
                        { id: `dv-${Date.now()}-2`, type: "small" as const, title: "Accessories", subtitle: "", image: "/category-accessories.png", link: "/collections/accessories" },
                        { id: `dv-${Date.now()}-3`, type: "small" as const, title: "Headwear", subtitle: "", image: "/category-headwear.png", link: "/collections/headwear" },
                    ]);
                } else {
                    setDropdownVisuals(visuals);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch("/api/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    homepage: categories,
                    dropdown: dropdownLinks,
                    extraLinks,
                    dropdownVisuals,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            setSaveError("Kaydetme sırasında bir hata oluştu!");
            setTimeout(() => setSaveError(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
        );
    }

    const updateCategory = (id: string, field: keyof CategoryItem, value: string) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, [field]: value } : cat
        ));
    };

    const updateDropdownLink = (id: string, field: keyof DropdownItem, value: string) => {
        setDropdownLinks(dropdownLinks.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addDropdownLink = () => {
        setDropdownLinks([...dropdownLinks, { id: `dl-${Date.now()}`, label: "Yeni Kategori", link: "/collections/yeni" }]);
    };

    const removeDropdownLink = (id: string) => {
        setDropdownLinks(dropdownLinks.filter(item => item.id !== id));
    };

    const updateExtraLink = (id: string, field: keyof DropdownItem, value: string) => {
        setExtraLinks(extraLinks.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const updateDropdownVisual = (id: string, field: keyof DropdownVisualBlock, value: string) => {
        setDropdownVisuals(dropdownVisuals.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addDropdownVisual = (type: "large" | "small") => {
        setDropdownVisuals([...dropdownVisuals, {
            id: `dv-${Date.now()}`, type, title: type === "large" ? "Yeni Büyük Blok" : "Yeni Küçük Blok",
            subtitle: "", image: "", link: "/collections/all",
        }]);
    };

    const removeDropdownVisual = (id: string) => {
        setDropdownVisuals(dropdownVisuals.filter(item => item.id !== id));
    };

    // Drag-and-drop handlers
    const handleCategoryDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDropdownDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDropdownLinks((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="space-y-6 max-w-6xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl uppercase tracking-tighter text-white mb-1">Kategori Yönetimi</h1>
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Anasayfa Koleksiyon Grid&apos;lerini Düzenle
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saved ? "Kaydedildi ✓" : saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </button>
                    {saveError && <span className="text-red-400 text-xs font-bold">{saveError}</span>}
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex bg-[#111111] p-1 rounded-md border border-white/5 max-w-sm">
                <button
                    onClick={() => setActiveTab(0)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 0 ? 'bg-white text-primary-900' : 'text-white/50 hover:text-white'}`}
                >
                    Anasayfa Blokları
                </button>
                <button
                    onClick={() => setActiveTab(1)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 1 ? 'bg-white text-primary-900' : 'text-white/50 hover:text-white'}`}
                >
                    Açılır Menü (Dropdown)
                </button>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden p-6 py-8">
                {activeTab === 0 && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="border-b border-white/5 pb-4 mb-6">
                            <p className="text-white/80 text-sm font-bold font-mono uppercase tracking-widest mb-1">Anasayfa Grid Yönetimi</p>
                            <p className="text-xs text-white/40 font-mono">Anasayfadaki 6 parçalı fotoğraf/kategori bloklarının (Archive Index üstü) içeriklerini düzenler. Sürükleyerek sıralayabilirsiniz.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Management List */}
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-4">
                                        {categories.map((cat, index) => (
                                            <SortableCategoryBlock
                                                key={cat.id}
                                                cat={cat}
                                                index={index}
                                                updateCategory={updateCategory}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {/* Live Preview — Matches Homepage Layout */}
                            <div className="bg-[#050505] border border-white/10 p-4 rounded-md">
                                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-3 text-center">Önizleme (Anasayfa Düzeni)</p>
                                <div className="flex flex-col border border-white/10">
                                    {/* Row 1: 2 eşit — categories[0-1] */}
                                    <div className="grid grid-cols-2">
                                        {categories.slice(0, 2).map((cat) => (
                                            <div key={`pv-${cat.id}`} className="relative aspect-square bg-[#111111] overflow-hidden border-r last:border-r-0 border-white/10">
                                                {cat.image && <Image src={cat.image} alt={cat.title} fill className="object-cover opacity-30" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-0 left-0 w-full p-2 text-center">
                                                    <div className="text-[6px] text-white/50 uppercase tracking-widest">{cat.subtitle}</div>
                                                    <div className="text-[9px] text-white font-bold uppercase tracking-wider">{cat.title}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Row 2: 2 eşit — categories[2-3] */}
                                    <div className="grid grid-cols-2 border-t border-white/10">
                                        {categories.slice(2, 4).map((cat) => (
                                            <div key={`pv-${cat.id}`} className="relative aspect-square bg-[#111111] overflow-hidden border-r last:border-r-0 border-white/10">
                                                {cat.image && <Image src={cat.image} alt={cat.title} fill className="object-cover opacity-30" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-0 left-0 w-full p-2 text-center">
                                                    <div className="text-[6px] text-white/50 uppercase tracking-widest">{cat.subtitle}</div>
                                                    <div className="text-[9px] text-white font-bold uppercase tracking-wider">{cat.title}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Row 3: Asimetrik 2:1 — categories[4-5] */}
                                    <div className="grid grid-cols-3 border-t border-white/10">
                                        {categories.slice(4, 6).map((cat, i) => (
                                            <div key={`pv-${cat.id}`} className={`relative bg-[#111111] overflow-hidden border-r last:border-r-0 border-white/10 ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-[1/2]'}`}>
                                                {cat.image && <Image src={cat.image} alt={cat.title} fill className="object-cover opacity-30" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-0 left-0 w-full p-2 text-center">
                                                    <div className="text-[5px] text-white/50 uppercase tracking-widest">{cat.subtitle}</div>
                                                    <div className={`text-white font-bold uppercase tracking-wider ${i === 0 ? 'text-[10px]' : 'text-[8px]'}`}>{cat.title}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Row 4: 3 eşit — categories[6-8] */}
                                    {categories.length > 6 && (
                                        <div className="grid grid-cols-3 border-t border-white/10">
                                            {categories.slice(6, 9).map((cat) => (
                                                <div key={`pv-${cat.id}`} className="relative aspect-[3/4] bg-[#111111] overflow-hidden border-r last:border-r-0 border-white/10">
                                                    {cat.image && <Image src={cat.image} alt={cat.title} fill className="object-cover opacity-30" />}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                    <div className="absolute bottom-0 left-0 w-full p-1.5 text-center">
                                                        <div className="text-[5px] text-white/50 uppercase tracking-widest">{cat.subtitle}</div>
                                                        <div className="text-[7px] text-white font-bold uppercase tracking-wider">{cat.title}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="animate-in fade-in duration-300">
                        <div className="border-b border-white/5 pb-4 mb-8">
                            <p className="text-white/80 text-sm font-bold font-mono uppercase tracking-widest mb-1">Navbar (Header) Mega Menü Yönetimi</p>
                            <p className="text-xs text-white/40 font-mono">Sitenin üst menüsündeki &quot;Collections&quot; linkine basılınca açılan paneli (Kategoriler, Ekstra Linkler ve Sağdaki Görsel Bloklar) düzenler. Sürükleyerek sıralayabilirsiniz.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Sol Taraf: Linkler */}
                            <div className="space-y-8">
                                {/* Ready to Wear Links */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Kategori Linkleri (Ready to Wear)</h3>
                                        <button onClick={addDropdownLink} className="text-[10px] font-mono uppercase bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors text-white">
                                            + Ekle
                                        </button>
                                    </div>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDropdownDragEnd}>
                                        <SortableContext items={dropdownLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-3">
                                                {dropdownLinks.map((item) => (
                                                    <SortableDropdownLink
                                                        key={item.id}
                                                        item={item}
                                                        updateLink={updateDropdownLink}
                                                        removeLink={removeDropdownLink}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>

                                {/* Ekstra Linkler */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Ekstra Linkler</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {extraLinks.map((item) => (
                                            <div key={item.id} className="flex gap-3 p-3 border border-white/10 rounded bg-[#0a0a0a] items-center">
                                                <div className="text-white/20"><GripVertical className="w-4 h-4 opacity-50" /></div>
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <input type="text" value={item.label} onChange={(e) => updateExtraLink(item.id, "label", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1.5 rounded text-xs focus:border-white/30 outline-none uppercase font-bold" />
                                                    <input type="text" value={item.link} onChange={(e) => updateExtraLink(item.id, "link", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-2 py-1.5 rounded text-xs focus:border-white/30 outline-none font-mono" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sağ Taraf: Görsel Bloklar */}
                            <div>
                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Sağ Görsel Blokları</h3>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => addDropdownVisual("large")} className="text-[10px] font-mono uppercase bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors text-white">+ Büyük</button>
                                        <button type="button" onClick={() => addDropdownVisual("small")} className="text-[10px] font-mono uppercase bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors text-white">+ Küçük</button>
                                    </div>
                                </div>

                                {dropdownVisuals.length === 0 && (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-md">
                                        <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Henüz görsel blok yok</p>
                                        <p className="text-white/20 text-[10px] mt-1">Yukarıdaki butonlarla ekleyebilirsiniz.</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {dropdownVisuals.map((block) => (
                                        <div key={block.id} className="p-4 border border-white/10 rounded-md bg-[#0a0a0a] space-y-4 group relative">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{block.type === 'large' ? 'Büyük Sol Görsel (Featured Drop)' : 'Küçük Sağ Blok'}</p>
                                                <button type="button" onClick={() => removeDropdownVisual(block.id)} className="text-white/20 hover:text-danger transition-colors text-xs opacity-0 group-hover:opacity-100">&times; Sil</button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-mono text-white/40 uppercase">Başlık</label>
                                                    <input type="text" value={block.title} onChange={(e) => updateDropdownVisual(block.id, "title", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-xs focus:border-white/30 outline-none uppercase font-bold" />
                                                </div>
                                                {block.type === "large" && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-mono text-white/40 uppercase">Alt Başlık</label>
                                                        <input type="text" value={block.subtitle || ""} onChange={(e) => updateDropdownVisual(block.id, "subtitle", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-xs focus:border-white/30 outline-none font-mono" />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-mono text-white/40 uppercase">Yönlendirme Linki</label>
                                                    <input type="text" value={block.link} onChange={(e) => updateDropdownVisual(block.id, "link", e.target.value)} className="w-full bg-[#111111] border border-white/10 text-white px-3 py-2 rounded text-xs focus:border-white/30 outline-none font-mono" />
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <SingleFileUploader
                                                    value={block.image}
                                                    onChange={(url) => updateDropdownVisual(block.id, "image", url)}
                                                    accept="image/*"
                                                    label="Blok Görseli"
                                                    placeholder="Görsel yükleyin"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
