"use client";

/**
 * ProductCardPrice — Price display using PriceDisplay design system component
 * Sub-component of ProductCard
 */

import PriceDisplay from "@/components/ui/price-display";
import QuickAddButton from "./QuickAddButton";
import { memo } from "react";

interface ProductCardPriceProps {
    currentPrice: number;
    originalPrice?: number | null;
    salePrice?: number | null;
    isOnSale?: boolean;
    hasDiscount: boolean;
    basePriceForDiscount: number;
    // Quick Add
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
}

function ProductCardPriceComponent({
    currentPrice,
    originalPrice,
    salePrice,
    isOnSale,
    hasDiscount,
    basePriceForDiscount,
    product,
}: ProductCardPriceProps) {
    const defaultPrice = hasDiscount ? (originalPrice ?? basePriceForDiscount) : currentPrice;
    const isDiscounted = hasDiscount && defaultPrice > currentPrice;
    const discountPercent = isDiscounted ? Math.round(((defaultPrice - currentPrice) / defaultPrice) * 100) : 0;

    return (
        <div className="flex items-end justify-between w-full mt-1">
            {/* Price Column */}
            <div className="flex flex-col gap-0.5">
                {/* 1. Old Price & Badge */}
                <div className="flex items-center gap-1.5 h-4">
                    {isDiscounted && (
                        <>
                            <span className="text-[11px] font-semibold text-slate-400 line-through leading-none">
                                ${defaultPrice}
                            </span>
                            {discountPercent > 0 && (
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 rounded-sm leading-none flex items-center h-full border border-rose-100">
                                    -{discountPercent}%
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* 2. Current Price */}
                <span className="font-black text-[16px] sm:text-[18px] text-rose-600 leading-none tracking-tight">
                    ${currentPrice}
                </span>
            </div>

            {/* Icon-only Add to Cart */}
            <QuickAddButton product={product} fullWidth={false} />
        </div>
    );
}

export default memo(ProductCardPriceComponent);
