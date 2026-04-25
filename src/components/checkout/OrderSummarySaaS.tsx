"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 *
 * OrderSummarySaaS – Premium SaaS-style order summary panel
 */

import Image from "next/image";
import { ShieldCheck, Lock, ChevronDown, Tag, Coins, Package, Star } from "lucide-react";
import { POINTS_PER_DOLLAR } from "@/lib/commerce";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PriceDisplay from "@/components/ui/price-display";

interface OrderSummarySaaSProps {
    items: any[];
    totalPrice: number;
    shippingFee: number;
    pointsUsed: number;
    pointsDiscount: number;
    finalTotal: number;
    selectedVoucher: any | null;
    language: string;
    t: (key: string) => string;
    isMobile?: boolean;
    /** "lightBlue" = nền xanh nước nhạt cho cột sản phẩm (Stripe-style) */
    summaryBg?: "default" | "lightBlue";
}

export default function OrderSummarySaaS({
    items,
    totalPrice,
    shippingFee,
    pointsUsed,
    pointsDiscount,
    finalTotal,
    selectedVoucher,
    language,
    t,
    isMobile = false,
    summaryBg = "default",
}: OrderSummarySaaSProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const vi = language === "vi";
    const discount = selectedVoucher?.discountAmount || 0;

    function SummaryBody() {
        return (
            <div className="space-y-6 px-4 sm:px-8 pb-10 pt-6">
                {/* Section Title: Subtle Upper */}
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {vi ? "Sản phẩm chọn mua" : "Items in bag"}
                    </p>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                        {items.length} {vi ? "món" : "items"}
                    </span>
                </div>

                {/* Items list: Optimized spacing */}
                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {items.map((item, index) => (
                        <div key={item.id || item.productId || `item-${index}`} className="flex items-center gap-4 group">
                            {/* Thumbnail: High-end border & shadow */}
                            <div className="relative flex-shrink-0 w-16 h-16 rounded-[14px] overflow-hidden bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                {(item.image || item.product?.image) ? (
                                    <Image
                                        src={item.image || item.product?.image}
                                        alt={item.name || item.product?.name || "Product"}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <Package className="w-5 h-5 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-900/5">
                                    {item.quantity}
                                </div>
                            </div>

                            {/* Name & price block */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        {item.name || item.product?.name || "Sản phẩm"}
                                    </p>
                                    <div className="text-xs font-black text-slate-900 tabular-nums">
                                        <PriceDisplay currentPrice={(item.price || item.product?.price || 0) * item.quantity} size="sm" showDiscountBadge={false} />
                                    </div>
                                </div>
                                {(item.variant || item.category) && (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                        {item.variant?.weight || item.variant?.flavor || item.category}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Costs: Modern breakdown */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-3.5 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{vi ? "Tạm tính" : "Subtotal"}</span>
                        <span className="font-extrabold text-slate-900 tabular-nums">
                            <PriceDisplay currentPrice={totalPrice} size="xs" showDiscountBadge={false} />
                        </span>
                    </div>

                    {selectedVoucher && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                <Tag className="w-3 h-3 flex-shrink-0" />
                                <span>{vi ? "Ưu đãi" : "Promo"}</span>
                                <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase">
                                    {selectedVoucher.code}
                                </span>
                            </span>
                            <span className="font-extrabold text-emerald-600 tabular-nums">
                                -<PriceDisplay currentPrice={discount} size="xs" showDiscountBadge={false} />
                            </span>
                        </div>
                    )}

                    {pointsUsed > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                                <Coins className="w-3 h-3 flex-shrink-0" />
                                <span>{vi ? "Dùng Xu" : "Reward Points"}</span>
                            </span>
                            <span className="font-extrabold text-amber-600 tabular-nums">
                                -<PriceDisplay currentPrice={pointsDiscount} size="xs" showDiscountBadge={false} />
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{vi ? "Giao hàng" : "Shipping"}</span>
                        {shippingFee > 0 ? (
                            <span className="font-extrabold text-slate-900 tabular-nums">
                                <PriceDisplay currentPrice={shippingFee} size="xs" showDiscountBadge={false} />
                            </span>
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                {vi ? "Miễn phí" : "Free"}
                            </span>
                        )}
                    </div>

                    {/* Total row: Grand finish */}
                    <div className="pt-4 mt-2 border-t border-slate-200/60 transition-all">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    {vi ? "Thanh toán" : "Total due"}
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                                    {vi ? "Đã bao gồm phí và thuế" : "Includes all taxes and fees"}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tighter leading-none">
                                    <PriceDisplay currentPrice={finalTotal} showDiscountBadge={false} size="lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rewards CTA: Premium Banner */}
                {(() => {
                    const earnedPoints = Math.floor(totalPrice * POINTS_PER_DOLLAR);
                    if (earnedPoints <= 0) return null;
                    return (
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-900 rounded-3xl p-4 sm:p-5 relative overflow-hidden group cursor-default"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all" />
                            <div className="flex items-center gap-3 sm:gap-4 relative z-10 font-sans">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                                        {vi ? "Ưu đãi đặc quyền" : "Elite Reward"}
                                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400" />
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5 sm:mt-1">
                                        <span className="text-primary">+{earnedPoints} xu</span> {vi ? " tích lũy" : " earned"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Trust Footer */}
                <div className="pt-4 flex items-center justify-center gap-4 opacity-40">
                    <div className="h-[1px] flex-1 bg-slate-200" />
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <div className="h-[1px] flex-1 bg-slate-200" />
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div className="bg-white border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 text-sm"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                            <Package className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "scale-110" : ""}`} />
                        </div>
                        <div className="text-left leading-tight">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {isExpanded ? (vi ? "Thu gọn" : "Collapse") : (vi ? "Chi tiết" : "Details")}
                            </p>
                            <p className="text-xs font-extrabold text-slate-900">
                                {items.length} {vi ? "sản phẩm" : "items"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 tracking-tight">
                                <PriceDisplay currentPrice={finalTotal} showDiscountBadge={false} />
                            </p>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/30"
                        >
                            <div className="px-1 border-t border-slate-100">
                                <SummaryBody />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Minimal Sub-header: Fixed in container */}
            <div className="shrink-0 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">
                    {vi ? "Chi tiết đơn hàng" : "Order Summary"}
                </h2>
                <div className="flex -space-x-2">
                    {items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm relative z-[3-i]">
                             {(item.image || item.product?.image) ? (
                                 <Image src={item.image || item.product?.image} alt="" fill className="object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                     <Package className="w-3 h-3 text-slate-300" />
                                 </div>
                             )}
                        </div>
                    ))}
                    {items.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-black z-0">
                            +{items.length - 3}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <SummaryBody />
            </div>
        </div>
    );
}
