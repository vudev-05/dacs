"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, Sparkles, Check } from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import PriceDisplay from "@/components/ui/price-display";
import { formatPrice, formatVndEquivalent } from "@/lib/currency";

interface Product {
    id: number;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    isOnSale?: boolean;
    image?: string;
    inventory: number;
}

interface FrequentlyBoughtTogetherProps {
    currentProduct: Product;
}

function getEffectivePrice(p: Product) {
    return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
}

export default function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { addItem } = useCart();
    const { language } = useLanguage();
    const vi = language === "vi";
    const [isAddingAll, setIsAddingAll] = useState(false);

    useEffect(() => {
        const fetchFBT = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/products/recommendations/fbt?product=${currentProduct.slug}`);
                if (!res.ok) throw new Error("Failed to fetch FBT");
                const data = await res.json();
                // Ensure exactly 4 recommended products (total 5 with current)
                const limited = (data as Product[]).slice(0, 4);
                setRecommended(limited);
                setSelectedIds(limited.map((p: Product) => p.id));
            } catch (err) {
                console.error("FBT Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentProduct.slug) {
            fetchFBT();
        }
    }, [currentProduct.slug]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(Number(id))
                ? prev.filter(i => String(i) !== String(id))
                : [...prev, Number(id)]
        );
    };

    const handleAddAll = async () => {
        setIsAddingAll(true);
        const selectedProducts = recommended.filter(p => selectedIds.includes(p.id));

        if (selectedProducts.length === 0) {
            toast.error(vi ? "Vui lòng chọn ít nhất 1 sản phẩm để thêm vào giỏ hàng" : "Please select at least 1 product");
            setIsAddingAll(false);
            return;
        }

        let addedCount = 0;

        // 1. Add current product first
        const currentEffective = getEffectivePrice(currentProduct);
        const currentOriginal = currentProduct.originalPrice && currentProduct.originalPrice > currentEffective ? currentProduct.originalPrice : undefined;
        const addedCurrent = addItem({
            productId: currentProduct.id,
            slug: currentProduct.slug,
            name: currentProduct.name,
            price: currentEffective,
            originalPrice: currentOriginal,
            salePrice: currentOriginal ? currentEffective : undefined,
            isOnSale: !!currentOriginal,
            image: currentProduct.image,
            quantity: 1,
            inventory: currentProduct.inventory,
        });
        if (addedCurrent) addedCount++;

        // 2. Add selected recommended products
        for (const p of selectedProducts) {
            const effectivePrice = getEffectivePrice(p);
            const originalPrice = p.originalPrice && p.originalPrice > effectivePrice ? p.originalPrice : undefined;
            const added = addItem({
                productId: p.id,
                slug: p.slug,
                name: p.name,
                price: effectivePrice,
                originalPrice,
                salePrice: originalPrice ? effectivePrice : undefined,
                isOnSale: !!originalPrice,
                image: p.image,
                quantity: 1,
                inventory: p.inventory,
            });
            if (added) addedCount++;
        }

        if (addedCount > 0) {
            toast.success(vi ? `Đã thêm ${addedCount} sản phẩm vào giỏ hàng!` : `Added ${addedCount} items to cart!`);
        }
        setIsAddingAll(false);
    };

    if (isLoading) return null;
    if (recommended.length === 0) return null;

    // Total price includes current product + selected recommended
    const currentPrice = getEffectivePrice(currentProduct);
    const selectedTotal = recommended
        .filter(p => selectedIds.includes(p.id))
        .reduce((sum, p) => sum + getEffectivePrice(p), 0);
    const totalPrice = currentPrice + selectedTotal;

    return (
        <section className="mb-24">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter font-outfit text-slate-900">
                        {vi ? "Gợi ý Combo Hoàn Hảo" : "Perfect Combo Deals"}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1">
                        {vi ? "Tiết kiệm hơn khi mua trọn bộ tinh hoa" : "Save more when buying the essence bundle"}
                    </p>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-8 sm:p-12 border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col items-center gap-12 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/30 blur-[120px] rounded-full -mr-32 -mt-32 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/30 blur-[100px] rounded-full -ml-24 -mb-24 opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-emerald-50/10 via-transparent to-amber-50/10 pointer-events-none" />

                {/* Product List - Centered Row */}
                <div className="w-full relative z-10 flex flex-wrap items-start justify-center gap-y-10 gap-x-6 sm:gap-x-10">
                    {/* Current Product - The Core Luxury Item */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative group/main">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] p-1 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl transition-transform duration-700 hover:scale-105">
                                <div className="w-full h-full rounded-[2.35rem] overflow-hidden bg-white relative">
                                    <ImageWithFallback
                                        src={currentProduct.image}
                                        alt={currentProduct.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 96px, 128px"
                                    />
                                </div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl z-20">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                            </div>
                        </div>
                        <div className="mt-5 text-center w-24 sm:w-32">
                            <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight truncate mb-1">{currentProduct.name}</p>
                            <PriceDisplay currentPrice={currentPrice} size="sm" className="justify-center" showDiscountBadge={false} />
                        </div>
                    </div>

                    {/* Recommendations with Plus signs */}
                    {recommended.map((product) => (
                        <div key={product.id} className="flex items-start gap-4 sm:gap-10 shrink-0">
                            <div className="flex items-center self-start pt-10 sm:pt-14 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-white/80 shadow-inner flex items-center justify-center border border-white">
                                    <span className="text-slate-300 font-black text-lg">+</span>
                                </div>
                            </div>
                            
                            <div
                                className={`flex flex-col items-center shrink-0 transition-all duration-700 cursor-pointer ${
                                    selectedIds.includes(product.id) ? "opacity-100 scale-100" : "opacity-40 grayscale-[0.8] scale-95 hover:opacity-80 hover:grayscale-0"
                                }`}
                                onClick={() => toggleSelection(String(product.id))}
                            >
                                <div className="relative group/rec">
                                    <div className={`absolute -inset-1 rounded-[2.5rem] blur-lg transition-all duration-700 ${
                                        selectedIds.includes(product.id) ? "bg-emerald-500/30 opacity-100" : "opacity-0"
                                    }`} />
                                    
                                    <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] p-1 bg-gradient-to-br transition-all duration-700 ${
                                        selectedIds.includes(product.id) 
                                            ? "from-emerald-400 to-teal-500 shadow-xl" 
                                            : "from-slate-200/50 to-slate-100/50"
                                    }`}>
                                        <div className="w-full h-full rounded-[2.35rem] overflow-hidden bg-white relative">
                                            <ImageWithFallback
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 96px, 128px"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={`absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 border-white shadow-xl z-20 transition-all duration-500 ${
                                        selectedIds.includes(product.id) ? "bg-emerald-500 text-white scale-100 rotate-0" : "bg-slate-100 text-slate-400 scale-0 rotate-45"
                                    }`}>
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                                    </div>
                                </div>
                                <div className="mt-5 text-center w-24 sm:w-32">
                                    <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight truncate mb-1">{product.name}</p>
                                    <PriceDisplay currentPrice={getEffectivePrice(product)} size="sm" className="justify-center" showDiscountBadge={false} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card - Now Below for Ultimate Logic Flow */}
                <div className="w-full max-w-4xl relative z-20">
                    <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group/card border border-white/5">
                        {/* Interactive Sparkle Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-32 -mt-32 group-hover/card:bg-emerald-500/20 transition-colors duration-700" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-50">{vi ? "ƯU ĐÃI COMBO" : "ULTIMATE BUNDLE"}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500">
                                        {selectedIds.length + 1} TOTAL ITEMS
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{vi ? "TỔNG GIÁ TRỊ COMBO" : "BUNDLE MARKET VALUE"}</p>
                                    <div className="flex flex-col items-center md:items-start">
                                        <span className="text-5xl sm:text-6xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400">
                                            {formatPrice(totalPrice)}
                                        </span>
                                        <div className="text-[11px] font-black text-emerald-400/90 uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                            ≈ {formatVndEquivalent(totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex flex-col items-center gap-4">
                                <Button
                                    onClick={handleAddAll}
                                    disabled={isAddingAll}
                                    className="h-20 px-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-[2rem] border-0 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-500 hover:scale-105 active:scale-95 group/btn overflow-hidden relative min-w-[300px]"
                                >
                                    {isAddingAll ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center justify-center gap-4">
                                            <ShoppingCart className="w-6 h-6 transition-transform group-hover/btn:scale-110" />
                                            <span className="text-lg font-black uppercase tracking-widest">{vi ? "CHỐT COMBO NGAY" : "GET THIS BUNDLE"}</span>
                                        </div>
                                    )}
                                    <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                </Button>
                                <p className="text-center text-[9px] font-black text-slate-500/60 uppercase tracking-widest">
                                    {vi ? "* CÀNG MUA CÀNG GIẢM - TIẾT KIỆM TỐI ĐA" : "* MORE ITEMS, MORE SAVINGS"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
