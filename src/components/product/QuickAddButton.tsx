"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartActions } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

interface QuickAddButtonProps {
    product: {
        id: number;
        slug?: string;
        name: string;
        price: number;
        originalPrice?: number | null;
        salePrice?: number | null;
        isOnSale?: boolean;
        image?: string | null;
        inventory: number;
    };
    fullWidth?: boolean;
}

export default function QuickAddButton({ product, fullWidth = false }: QuickAddButtonProps) {
    const { addItem } = useCartActions();
    const [isAdded, setIsAdded] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleQuickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.inventory <= 0) return;

        addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice ?? undefined,
            salePrice: product.salePrice ?? undefined,
            isOnSale: product.isOnSale,
            quantity: 1,
            image: product.image || undefined,
        });

        setIsAdded(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <button
            onClick={handleQuickAdd}
            disabled={product.inventory <= 0}
            aria-label={isAdded ? t('shop.addedToCartAria') : t('shop.addToCartAria')}
            className={`
                relative flex items-center justify-center transition-all duration-300 font-bold overflow-hidden
                ${fullWidth ? 'w-full py-2 rounded-xl text-[12px] uppercase tracking-wide gap-2' : 'w-9 h-9 rounded-xl p-2'}
                ${product.inventory <= 0
                    ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                    : isAdded
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : fullWidth
                            ? "bg-[#DFF0E0] hover:bg-[#d0ebd1] text-emerald-800 border border-[#DFF0E0]/50 hover:border-[#cbe8ce]"
                            : "bg-slate-100 text-slate-600 hover:bg-[#DFF0E0] hover:text-emerald-800"
                }
            `}
        >
            <AnimatePresence mode="wait">
                {isAdded ? (
                    <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        className="flex items-center justify-center gap-1.5"
                    >
                        <Check className={fullWidth ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
                        {fullWidth && <span>{t('shop.added')}</span>}
                    </motion.span>
                ) : (
                    <motion.span
                        key="add"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center justify-center gap-1.5"
                    >
                        <ShoppingCart className={`${fullWidth ? 'w-4 h-4' : 'w-3.5 h-3.5'} transition-transform duration-300`} />
                        {fullWidth && <span>{t('shop.addToCart')}</span>}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
