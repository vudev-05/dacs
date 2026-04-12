"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * FlashSaleSection — Homepage Flash Sale carousel
 * Hiển thị 5 sản phẩm mỗi lượt, mũi tên trái/phải cuộn sản phẩm.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, Flame } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "@/contexts/CartContext";

/* ── Types ──────────────────────────────────── */

interface FlashSaleProduct {
    id: number;
    slug: string;
    name: string;
    originalPrice: number;
    salePrice: number | null;
    discount: number;
    image: string | null;
    category: string;
    inventory: number;
    soldCount: number;
    badgeText: string | null;
    saleEndAt: string | null;
    isHot: boolean;
}

/* ── Countdown Hook ─────────────────────────── */

function useCountdown() {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: true });

    useEffect(() => {
        const getNextMilestone = () => {
            const now = new Date();
            const hours = now.getHours();
            const nextMilestoneHour = Math.floor(hours / 6) * 6 + 6;
            const milestone = new Date(now);
            milestone.setHours(nextMilestoneHour, 0, 0, 0);
            return milestone.getTime();
        };

        const calcTimeLeft = () => {
            const target = getNextMilestone();
            const diff = target - Date.now();

            if (diff <= 0) return { h: 6, m: 0, s: 0, expired: false };
            return {
                h: Math.floor(diff / (1000 * 60 * 60)),
                m: Math.floor((diff / (1000 * 60)) % 60),
                s: Math.floor((diff / 1000) % 60),
                expired: false,
            };
        };

        setTimeLeft(calcTimeLeft());
        const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    return timeLeft;
}

/* ── Countdown Digit ────────────────────────── */

function CountdownDigit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/10">
                <span className="text-white text-sm sm:text-base font-black tabular-nums">
                    {String(value).padStart(2, "0")}
                </span>
                {/* Separator line */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-wider">{label}</span>
        </div>
    );
}

/* ── Sold Progress Bar ──────────────────────── */

function SoldBar({ soldCount, inventory, t }: { soldCount: number; inventory: number; t: (k: string) => string }) {
    const total = soldCount + inventory;
    const percent = total > 0 ? Math.min((soldCount / total) * 100, 100) : 0;
    const isAlmostGone = percent >= 70;

    return (
        <div className="mt-2">
            <div className="relative h-[6px] bg-red-100 rounded-full overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                        isAlmostGone
                            ? "bg-gradient-to-r from-red-500 to-orange-400"
                            : "bg-gradient-to-r from-red-400 to-rose-400"
                    }`}
                    style={{ width: `${Math.max(percent, 5)}%` }}
                />
                {isAlmostGone && (
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-400 to-orange-300 animate-pulse opacity-40"
                        style={{ width: `${percent}%` }}
                    />
                )}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1 text-center">
                {t("shop.sold")} {soldCount}/{total} {t("shop.productsCount")}
            </p>
        </div>
    );
}

/* ── Product Card ───────────────────────────── */

function FlashSaleCard({ product, t }: { product: FlashSaleProduct; t: (k: string) => string }) {
    const { addItem } = useCart();
    const effectivePrice = product.salePrice ?? product.originalPrice;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: effectivePrice,
            originalPrice: product.originalPrice,
            salePrice: product.salePrice ?? undefined,
            isOnSale: true,
            image: product.image ?? undefined,
            inventory: product.inventory,
            category: product.category,
        });
    };

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group flex-shrink-0 w-[calc((100%-4rem)/5)] min-w-[180px] bg-white rounded-xl border border-slate-100 overflow-hidden
                       hover:shadow-lg hover:shadow-red-500/8 hover:border-red-200 transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-red-50 to-orange-50">
                        🔥
                    </div>
                )}

                {/* Discount badge */}
                {product.discount > 0 && (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30">
                            -{product.discount}%
                        </div>
                    </div>
                )}

                {/* Hot badge */}
                {product.isHot && (
                    <div className="absolute top-2 right-2 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-1.5 shadow-lg">
                            <Flame className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2 flex flex-col flex-1">
                <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-0.5 group-hover:text-red-600 transition-colors">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-base sm:text-lg font-black bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                        {formatPrice(effectivePrice)}
                    </span>
                    {product.discount > 0 && (
                        <span className="text-[10px] font-medium text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-2">
                    {/* Sold progress */}
                    <SoldBar soldCount={product.soldCount} inventory={product.inventory} t={t} />

                    {/* Quick add */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider
                                   bg-gradient-to-r from-red-500 to-rose-500 text-white
                                   hover:from-red-600 hover:to-rose-600
                                   active:scale-[0.97] transition-all duration-200
                                   shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
                    >
                        {t("shop.addToCart")}
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ── Main Component ─────────────────────────── */

export default function FlashSaleSection() {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState<FlashSaleProduct[]>([]);
    const [countdown, setCountdown] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Fetch flash sale products (with fallback to sale products)
    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                const res = await fetch("/api/products/flash-sale", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        setProducts(data.products);
                        setCountdown(data.countdown || null);
                        return;
                    }
                }
                // Fallback: lấy sản phẩm đang sale hoặc sản phẩm mới nhất
                const fallbackRes = await fetch("/api/products?limit=15&sort=newest", { cache: "no-store" });
                if (fallbackRes.ok) {
                    const fallbackData = await fallbackRes.json();
                    const rawProducts = fallbackData.products || fallbackData || [];
                    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
                        const mapped: FlashSaleProduct[] = rawProducts.map((p: Record<string, unknown>) => {
                            const price = Number(p.price) || 0;
                            const salePrice = p.salePrice ? Number(p.salePrice) : null;
                            const originalPrice = p.originalPrice ? Number(p.originalPrice) : price;
                            const hasDiscount = salePrice != null && salePrice < price;
                            const discount = hasDiscount
                                ? Math.round(((price - salePrice!) / price) * 100)
                                : originalPrice > price
                                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                                    : 0;
                            return {
                                id: Number(p.id),
                                slug: String(p.slug || p.id),
                                name: String(p.name || ""),
                                originalPrice: originalPrice || price,
                                salePrice: hasDiscount ? salePrice : null,
                                discount,
                                image: (p.image as string) || null,
                                category: String(p.category || ""),
                                inventory: Number(p.inventory) || 10,
                                soldCount: Number(p.soldCount) || 0,
                                badgeText: null,
                                saleEndAt: null,
                                isHot: discount >= 30,
                            };
                        });
                        setProducts(mapped.slice(0, 15));
                    }
                }
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        };
        fetchFlashSale();
    }, []);

    // Check scroll position
    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, products]);

    // Scroll by one "page" (5 cards)
    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.clientWidth / 5;
        const scrollAmount = cardWidth * 5;
        el.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    const time = useCountdown();

    // Don't render if no products or loading
    if (isLoading) {
        return (
            <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-4">
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {/* Skeleton header */}
                    <div className="h-14 bg-gradient-to-r from-red-500 to-rose-500 animate-pulse" />
                    {/* Skeleton cards */}
                    <div className="p-4 flex gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-1 min-w-[180px]">
                                <div className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
                                <div className="mt-3 h-4 bg-slate-100 rounded animate-pulse" />
                                <div className="mt-2 h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                                <div className="mt-3 h-8 bg-slate-100 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* ── HEADER BAR ───────────────────────────── */}
                <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-4 sm:px-6 py-3 flex items-center justify-between overflow-hidden">
                    {/* Animated background streaks */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-12" />
                        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -rotate-12" />
                    </div>

                    {/* Left: Title */}
                    <div className="relative flex items-center gap-3 z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    Flash Sale
                                    <span className="hidden sm:inline-block text-[10px] font-bold bg-yellow-400 text-red-700 px-2 py-0.5 rounded-md uppercase">
                                        {language === "vi" ? "Giá sốc" : "Hot Deal"}
                                    </span>
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Center: Countdown */}
                    {!time.expired && (
                        <div className="relative flex items-center gap-2 z-10">
                            <span className="text-white/80 text-xs font-bold uppercase tracking-wider hidden sm:block">
                                {language === "vi" ? "Kết thúc sau" : "Ends in"}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <CountdownDigit value={time.h} label={t("shop.hours")} />
                                <span className="text-white/60 font-black text-lg -mt-3">:</span>
                                <CountdownDigit value={time.m} label={t("shop.minutes")} />
                                <span className="text-white/60 font-black text-lg -mt-3">:</span>
                                <CountdownDigit value={time.s} label={t("shop.seconds")} />
                            </div>
                        </div>
                    )}

                    {/* Right: View all */}
                    <Link
                        href="/flash-sale"
                        className="relative z-10 text-white/90 text-xs sm:text-sm font-bold hover:text-white transition-colors flex items-center gap-1 group"
                    >
                        {t("common.viewAll")}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* ── PRODUCT CAROUSEL ──────────────────────── */}
                <div className="relative group/carousel">
                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll("left")}
                            aria-label="Sản phẩm trước"
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                                       w-10 h-10 sm:w-11 sm:h-11 rounded-full
                                       bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-900/15
                                       border border-slate-200
                                       flex items-center justify-center
                                       hover:bg-white hover:scale-110 hover:shadow-2xl
                                       active:scale-95 transition-all duration-200"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll("right")}
                            aria-label="Sản phẩm tiếp theo"
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                                       w-10 h-10 sm:w-11 sm:h-11 rounded-full
                                       bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-900/15
                                       border border-slate-200
                                       flex items-center justify-center
                                       hover:bg-white hover:scale-110 hover:shadow-2xl
                                       active:scale-95 transition-all duration-200"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-700" />
                        </button>
                    )}

                    {/* Fade edges */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    )}

                    {/* Scrollable container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 p-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    >
                        {products.map((product) => (
                            <FlashSaleCard
                                key={product.id}
                                product={product}
                                t={t}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
