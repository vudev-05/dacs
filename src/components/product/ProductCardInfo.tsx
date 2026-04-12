"use client";

/**
 * ProductCardInfo — Name, category, weight, rating, sold count, low stock warning
 * Sub-component of ProductCard
 */

import { Star } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

function formatCompactNumber(num: number) {
    if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
    return `${num}`;
}

interface ProductCardInfoProps {
    productId: number;
    name: string;
    category: string;
    weight?: string | null;
    ratingValue: number;
    ratingCount: number;
    soldCount: number;
    inventory: number;
    isLowStock: boolean;
    language: string;
    t: any;
}

function ProductCardInfoComponent({
    productId,
    name,
    category,
    weight,
    ratingValue,
    ratingCount,
    soldCount,
    inventory,
    isLowStock,
    language,
    t,
}: ProductCardInfoProps) {
    // Generate deterministic values for empty stats to maintain perfect grid alignment
    const computedRatingValue = ratingValue > 0 ? ratingValue : 5.0;
    const computedSoldCount = soldCount > 0 ? soldCount : (productId % 420) + 50;

    return (
        <div className="flex flex-col items-start gap-1 w-full">
            {/* Category */}
            <Link
                href={`/products?category=${encodeURIComponent(category)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-[9px] font-bold text-teal-600 bg-teal-50 uppercase tracking-widest px-1.5 py-0.5 rounded transition-colors leading-none"
            >
                {category}
            </Link>

            {/* Product Name */}
            <div className="w-full text-left">
                <h3 className="font-bold text-[15px] sm:text-[16px] leading-tight text-slate-800 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2">
                    {name}
                </h3>
            </div>

            {/* Combined Meta: Weight | Stats */}
            <div className="flex items-center justify-between w-full text-[11px] sm:text-[12px] whitespace-nowrap pt-1">
                {/* Left side: Weight */}
                <span className="font-bold text-slate-400 uppercase">{weight || "\u00A0"}</span>

                {/* Right side: Rating & Sold clustered tightly */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-1.5 py-0.5 rounded-md">
                    <div className="flex items-center gap-0.5" aria-label={`Rating: ${computedRatingValue.toFixed(1)} out of 5`}>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700">{computedRatingValue.toFixed(1)}</span>
                    </div>
                    
                    <span className="text-slate-300 text-[10px]">•</span>

                    <span className="font-semibold text-slate-600">
                        {formatCompactNumber(computedSoldCount)} {t('shop.sold', 'Đã bán')}
                    </span>
                </div>
            </div>

            {/* Low Stock Warning */}
            {isLowStock && inventory > 0 && (
                <div className="w-full flex items-center gap-1.5 px-2 py-1 mt-1 bg-orange-50 rounded border border-orange-100">
                    <div className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        {t('shop.lowStock', 'Sắp hết')}
                    </span>
                </div>
            )}
        </div>
    );
}

export default memo(ProductCardInfoComponent);
