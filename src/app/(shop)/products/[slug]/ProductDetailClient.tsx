"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Product Detail Page — Compact Premium Layout
 * Copyright (c) 2026 LIKEFOOD Team
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { analytics } from "@/lib/analytics/sdk";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
    Star, Heart, Share2, ShoppingCart, Truck, 
    Loader2, Flame, Zap, ChevronRight, Package, ShoppingBag,
    ChevronDown, Shield, RefreshCw, CreditCard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/product/ProductCard";
import ImageGallery from "@/components/product/ImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import Link from "next/link";
import { toast } from "sonner";
import { RelatedProduct } from "@/types/product";
import { logger } from "@/lib/logger";

import ProductStructuredData from "@/components/seo/ProductStructuredData";
import { useLanguage } from "@/lib/i18n/context";
import { formatPrice, formatVndEquivalent } from "@/lib/currency";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import QuantitySelector from "@/components/ui/quantity-selector";
import { Badge } from "@/components/ui/badge";
import PriceDisplay from "@/components/ui/price-display";
import { WriteReviewButton } from "@/components/review/WriteReviewButton";

const ReviewSummaryAI = dynamic(() => import("@/components/product/ReviewSummaryAI"), {
    loading: () => <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />,
    ssr: false,
});
const FrequentlyBoughtTogether = dynamic(() => import("@/components/product/FrequentlyBoughtTogether"), {
    loading: () => <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />,
    ssr: false,
});

import { FREE_SHIPPING_THRESHOLD_USD } from "@/lib/commerce";

import StickyBuyBar from "@/components/product/StickyBuyBar";


interface ProductVariant {
    id: number;
    weight?: string | null;
    flavor?: string | null;
    priceAdjustment: number;
    stock: number;
    isActive: boolean;
}

interface ProductImage {
    id: number;
    imageUrl: string;
    altText?: string | null;
    order: number;
    isPrimary: boolean;
}

interface Product {
    id: number;
    slug?: string | null;
    name: string;
    nameEn?: string | null;
    description: string;
    descriptionEn?: string | null;
    price: number;
    image?: string | null;
    category: string;
    weight?: string | null;
    weightEn?: string | null;
    inventory: number;
    avgRating: number;
    reviewCount: number;
    ratingAvg?: number | null;
    ratingCount?: number;
    reviews?: Review[];
    variants?: ProductVariant[];
    images?: ProductImage[];
    soldCount?: number;
    isFlashSale?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    salePrice?: number | null;
    originalPrice?: number | null;
}

interface Review {
    id: number;
    rating: number;
    comment?: string | null;
    createdAt: string;
    user: {
        id?: number;
        name: string | null;
        image?: string | null;
    };
}

export interface ProductDetailClientProps {
    initialProduct?: Product | null;
    initialRelated?: RelatedProduct[];
}



export default function ProductDetailClient({ initialProduct, initialRelated }: ProductDetailClientProps) {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { addItem } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>(initialRelated ?? []);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(!initialProduct);
    const [error, setError] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const [descExpanded, setDescExpanded] = useState(false);
    const { t, language } = useLanguage();

    // Auto-format description
    const descriptionSections = useMemo(() => {
        const descText = language === "en" && product?.descriptionEn ? product.descriptionEn : product?.description;
        if (!descText) return [];
        const text = descText;
        const sectionRegex = /(?:^|\s)([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}✅☑️🔥⭐️🎁💪🍃🌿🧂🌶️📦🎯🏷️💰🔒🚚👨‍🍳🧑‍🍳👩‍🍳🍴🥢🥄🍽️])\s*([A-ZÀ-Ỹa-zA-Z\s&]+):\s*/gu;
        const parts: { title: string; content: string; emoji: string }[] = [];
        const matches: { index: number; emoji: string; title: string; length: number }[] = [];
        let match;

        while ((match = sectionRegex.exec(text)) !== null) {
            matches.push({
                index: match.index,
                emoji: match[1],
                title: match[2].trim(),
                length: match[0].length,
            });
        }

        if (matches.length === 0) {
            return [{ title: "", content: text, emoji: "" }];
        }

        const preamble = text.slice(0, matches[0].index).trim();
        if (preamble) {
            parts.push({ title: "", content: preamble, emoji: "" });
        }

        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index + matches[i].length;
            const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
            const content = text.slice(start, end).trim();
            parts.push({ title: matches[i].title, content, emoji: matches[i].emoji });
        }

        return parts;
    }, [product?.description, product?.descriptionEn, language]);

    // ──── Analytics: track product view + time spent ────
    const viewStartRef = useRef<number>(0);

    useEffect(() => {
        if (!product) return;
        viewStartRef.current = Date.now();
        analytics.trackProductView(
            product.id,
            product.name,
            product.category,
            product.salePrice != null && product.salePrice < product.price
                ? product.salePrice
                : product.price,
            window.location.href
        );
        return () => {
            // Track time spent on product page when leaving
            if (viewStartRef.current > 0) {
                const durationMs = Date.now() - viewStartRef.current;
                const durationSec = Math.round(durationMs / 1000);
                if (durationSec >= 2) {
                    analytics.track("page_view", {
                        productId: product.id,
                        productName: product.name,
                        category: product.category,
                        durationSeconds: durationSec,
                        type: "product_detail_duration",
                    });
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.id]);

    useEffect(() => {
        if (initialProduct) {
            if (typeof window !== 'undefined' && initialProduct) {
                const viewed = localStorage.getItem("recentlyViewed");
                const viewedIds = viewed ? JSON.parse(viewed) : [];
                const newViewed = [
                    initialProduct.id,
                    ...viewedIds.filter((id: string) => String(id) !== String(initialProduct.id))
                ].slice(0, 10);
                localStorage.setItem("recentlyViewed", JSON.stringify(newViewed));
            }
            return;
        }

        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/products/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    if (typeof window !== 'undefined') {
                        const viewed = localStorage.getItem("recentlyViewed");
                        const viewedIds = viewed ? JSON.parse(viewed) : [];
                        const newViewed = [data.id, ...viewedIds.filter((id: string) => id !== data.id)].slice(0, 10);
                        localStorage.setItem("recentlyViewed", JSON.stringify(newViewed));
                    }
                } else if (res.status === 404) {
                    setError("not_found");
                    setTimeout(() => router.push("/products"), 2000);
                } else {
                    setError("load_error");
                }
            } catch (error) {
                logger.error("Failed to fetch product", error as Error, { context: "product-detail", slug });
                setError("network_error");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRelated = async () => {
            try {
                const res = await fetch(`/api/products/${slug}/related`);
                if (res.ok) {
                    const data = await res.json();
                    setRelatedProducts(data);
                }
            } catch (error) {
                logger.warn("Failed to fetch related products", { context: 'product-detail-page', error: error as Error });
            }
        };

        if (slug) {
            fetchProduct();
            fetchRelated();
        }
    }, [slug, router, initialProduct]);

    const getCurrentPrice = () => {
        if (!product) return 0;
        const hasSalePrice = product.salePrice != null && product.salePrice < product.price;
        const basePrice = (hasSalePrice ? product.salePrice : product.price) ?? product.price;
        const variantAdjustment = selectedVariant?.priceAdjustment || 0;
        return basePrice + variantAdjustment;
    };

    const getCurrentInventory = () => {
        if (selectedVariant) return selectedVariant.stock;
        return product?.inventory || 0;
    };

    const getOriginalPrice = () => {
        if (!product) return 0;
        const current = getCurrentPrice();
        if (product.originalPrice != null && product.originalPrice > current) return product.originalPrice;
        const hasSalePrice = product.salePrice != null && product.salePrice < product.price;
        return hasSalePrice ? product.price : current;
    };

    const hasDiscount = () => getOriginalPrice() > getCurrentPrice();
    const getDiscountPercent = () => {
        if (!hasDiscount()) return 0;
        return Math.round(((getOriginalPrice() - getCurrentPrice()) / getOriginalPrice()) * 100);
    };

    const buildCartItem = () => {
        if (!product) return null;
        const currentPrice = getCurrentPrice();
        const currentInventory = getCurrentInventory();
        if (currentInventory === 0) { toast.error(t("shop.productOutOfStock")); return null; }
        const onSale = hasDiscount();
        return {
            productId: Number(product.id),
            slug: product.slug || undefined,
            name: product.name + (selectedVariant ? ` - ${selectedVariant.weight || selectedVariant.flavor || ''}` : ''),
            price: currentPrice,
            originalPrice: onSale ? getOriginalPrice() : undefined,
            salePrice: onSale ? currentPrice : undefined,
            isOnSale: onSale,
            image: product.image || undefined,
            quantity,
            inventory: currentInventory,
            category: product.category ?? undefined,
        };
    };

    const handleAddToCart = () => {
        const item = buildCartItem();
        if (!item) return;
        setIsAddingToCart(true);
        addItem(item);
        setTimeout(() => setIsAddingToCart(false), 500);
    };

    const handleBuyNow = () => {
        const item = buildCartItem();
        if (!item) return;
        sessionStorage.setItem("buyNowItem", JSON.stringify(item));
        router.push("/checkout?buyNow=true");
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product?.name, text: product?.description, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success(t("shop.linkCopied"));
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error(t("shop.shareError"));
            }
        }
    };

    const soldPercentage = (product && product.soldCount && product.inventory > 0)
        ? Math.min((product.soldCount / (product.soldCount + product.inventory)) * 100, 100)
        : 0;

    if (isLoading) return <LoadingState fullPage text={t("shop.loadingProduct")} />;

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-6">
                <ErrorState
                    title="Oops!"
                    message={
                        error === "not_found" ? t("shop.productNotFound") :
                        error === "load_error" ? t("shop.errorLoadingProduct") :
                        error === "network_error" ? t("shop.errorTryAgain") :
                        error || t("shop.productNotFound")
                    }
                    onRetry={() => window.location.reload()}
                    retryLabel={t("common.back")}
                    className="max-w-md bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
                />
            </div>
        );
    }

    const localizedCategory = t(`categories.${product.category}` as any) !== `categories.${product.category}` ? t(`categories.${product.category}` as any) : product.category;
    const localizedName = language === "en" && product.nameEn ? product.nameEn : product.name;
    const localizedDescription = language === "en" && product.descriptionEn ? product.descriptionEn : product.description;
    const localizedWeight = language === "en" && product.weightEn ? product.weightEn : product.weight;

    return (
        <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
            {/* Mesh Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/50 blur-[120px] rounded-full -z-10 opacity-60" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-amber-50/40 blur-[100px] rounded-full -z-10 opacity-50" />
            
            <div className="pt-6 pb-20">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-[6%]">
                    {/* SEO */}
                    <ProductStructuredData
                        product={{
                            slug: product.slug,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            salePrice: product.salePrice,
                            images: product.image ? [product.image] : [],
                            stock: product.inventory,
                            category: product.category ? { name: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-') } : null,
                            avgRating: product.ratingAvg ?? product.avgRating ?? null,
                            reviewCount: product.ratingCount ?? product.reviewCount ?? 0,
                        }}
                    />

                    {/* Breadcrumbs — compact */}
                    

                    {/* ══════════ MAIN: Image + Info ══════════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        
                        {/* ─── Column 1: Media — 5 cols ─── */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-28">
                                <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 transition-transform duration-500 hover:scale-[1.01]">
                                    {(product.images && product.images.filter(img => img.imageUrl).length > 0) || product.image ? (
                                        <ImageGallery
                                            images={(() => {
                                                const gallery = [...(product.images || [])].filter(img => img.imageUrl && img.imageUrl.trim() !== '');
                                                if (product.image) {
                                                    const mainImageInGallery = gallery.find(img => img.imageUrl === product.image);
                                                    if (!mainImageInGallery) {
                                                        gallery.unshift({ id: -1, imageUrl: product.image, altText: product.name, order: -1, isPrimary: true });
                                                    } else {
                                                        gallery.sort((a) => (a.imageUrl === product.image ? -1 : 1));
                                                    }
                                                }
                                                return gallery;
                                            })()}
                                            productName={product.name}
                                        />
                                    ) : (
                                        <div className="aspect-square flex items-center justify-center bg-slate-50">
                                            <ShoppingBag className="w-20 h-20 text-slate-200" />
                                        </div>
                                    )}

                                    {/* Glassmorphism Badges */}
                                    <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                        {hasDiscount() && (
                                            <div className="backdrop-blur-xl bg-orange-500/90 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5 border border-white/20">
                                                <Flame className="w-4 h-4 fill-current animate-pulse" />
                                                <span className="font-bold text-sm">-{getDiscountPercent()}% OFF</span>
                                            </div>
                                        )}
                                        {product.isFlashSale && (
                                            <div className="backdrop-blur-xl bg-emerald-600/90 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5 border border-white/20">
                                                <Zap className="w-4 h-4 fill-current text-amber-300" />
                                                <span className="font-black text-sm uppercase tracking-tighter">FLASH DEAL</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {getCurrentInventory() === 0 && (
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-20">
                                            <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-3xl shadow-2xl">
                                                <span className="text-xl font-black text-slate-900 uppercase tracking-widest">{t("shop.outOfStock")}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Quick Guarantee Info Below Gallery */}
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Shield className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 leading-tight">FDA Certified & Premium Quality</span>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Truck className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 leading-tight">Express Shipping 2-3 Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Column 2: Info & Purchase — 7 cols ─── */}
                        <div className="lg:col-span-7 space-y-6 lg:pt-2">
                            {/* Brand / Collection Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/products?category=${encodeURIComponent(product.category)}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm transition-all hover:bg-slate-50"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">{localizedCategory}</span>
                                    </Link>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300 px-3 py-1 border border-slate-200 rounded-full">
                                        Collection 2026
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            isInWishlist(product.id) ? 'bg-red-50 text-red-500 ring-1 ring-red-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="space-y-2">
                                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight font-outfit uppercase">
                                    {localizedName}
                                </h1>
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-black text-slate-800 tracking-tighter">{product.avgRating.toFixed(1)}</span>
                                        <span className="text-slate-400 text-xs font-semibold">({product.reviewCount} {t("shop.reviews")})</span>
                                    </div>
                                    <div className="w-px h-5 bg-slate-200" />
                                    <div className="flex items-center gap-1.5">
                                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-bold text-slate-600">{product.soldCount?.toLocaleString()} {t("shop.sold")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* VIP Purchase Card */}
                            <div className="relative p-6 lg:p-8 rounded-[3rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/80 overflow-hidden">
                                {/* Decorative Gradient Blobs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    {/* Left: Pricing */}
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100/50 mb-1">
                                            <Flame className="w-3 h-3 fill-current" />
                                            PRICING
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-4xl lg:text-5xl font-black text-slate-900 font-outfit">
                                                    {formatPrice(getCurrentPrice())}
                                                </span>
                                                {hasDiscount() && (
                                                    <span className="text-lg text-slate-400 line-through font-medium">
                                                        {formatPrice(getOriginalPrice())}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                ≈ {formatVndEquivalent(getCurrentPrice())}
                                            </p>
                                        </div>
                                        
                                        {hasDiscount() && (
                                            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 inline-block">
                                                <p className="text-xs font-bold text-emerald-700">
                                                    🎉 Save {formatPrice(getOriginalPrice() - getCurrentPrice())} ({getDiscountPercent()}%)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Selectors */}
                                    <div className="space-y-4">
                                        {product.variants && product.variants.length > 0 && (
                                            <VariantSelector
                                                variants={product.variants}
                                                basePrice={product.price}
                                                selectedVariant={selectedVariant}
                                                onVariantChange={(variant) => { setSelectedVariant(variant); setQuantity(1); }}
                                            />
                                        )}
                                        
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("common.quantity")}</span>
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${getCurrentInventory() > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {getCurrentInventory() > 0 ? `${getCurrentInventory()} ${t("shop.available")}` : t("shop.outOfStock")}
                                                </div>
                                            </div>
                                            <QuantitySelector value={quantity} min={1} max={getCurrentInventory()} onChange={setQuantity} size="lg" />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="my-8 h-px bg-slate-100" />

                                {/* CTA Buttons */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={getCurrentInventory() === 0 || isAddingToCart}
                                            className="group flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:-translate-y-1 active:scale-[0.98] overflow-hidden relative"
                                        >
                                            {isAddingToCart ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    {t("shop.addToCart")}
                                                </div>
                                            )}
                                            <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        </Button>
                                        <Button
                                            onClick={handleBuyNow}
                                            disabled={getCurrentInventory() === 0}
                                            className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
                                        >
                                            <Zap className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                                            {t("shop.buyNow")}
                                        </Button>
                                    </div>

                                    {/* Free Shipping Progress Box */}
                                    <div className="p-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <Truck className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs font-black text-blue-900 uppercase tracking-widest">{t("cart.shippingTitle")}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">USA Domestic Express</span>
                                        </div>
                                        {getCurrentPrice() >= FREE_SHIPPING_THRESHOLD_USD ? (
                                            <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                                                <Shield className="w-4 h-4 fill-emerald-100" />
                                                {t("cart.freeShipping")} ✓
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-500">
                                                    {t("cart.addMoreForFreeShip").replace("{amount}", formatPrice(FREE_SHIPPING_THRESHOLD_USD - getCurrentPrice()))}
                                                </p>
                                                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                                    <div 
                                                        style={{ width: `${Math.min((getCurrentPrice() / FREE_SHIPPING_THRESHOLD_USD) * 100, 100)}%` }}
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trust Features Grid — Premium Style */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { icon: Shield, label: t("shop.qualityGuarantee"), sub: "FDA Certified", color: "text-emerald-500", bg: "bg-emerald-50/80" },
                                    { icon: RefreshCw, label: t("shop.easyReturn"), sub: "7-Day Policy", color: "text-blue-500", bg: "bg-blue-50/80" },
                                    { icon: CreditCard, label: t("shop.securePayment"), sub: "SSL Encrypted", color: "text-amber-500", bg: "bg-amber-50/80" },
                                    { icon: Package, label: t("shop.originalProduct"), sub: "Vietnam Origin", color: "text-rose-500", bg: "bg-rose-50/80" },
                                ].map((feature) => (
                                    <div key={feature.label} className={`group p-3 rounded-2xl ${feature.bg} backdrop-blur-sm border border-white transition-all hover:shadow-lg hover:-translate-y-0.5`}>
                                        <feature.icon className={`w-5 h-5 ${feature.color} mb-2 transition-transform group-hover:scale-110`} />
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight">{feature.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{feature.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ══════════ SECTION: Description & Specs ══════════ */}
                    <div className="mt-16 sm:mt-24">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter font-outfit">{t("shop.productDescription")}</h2>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-10 shadow-sm relative">
                                    <div className={`prose prose-slate max-w-none transition-all duration-700 ${!descExpanded && descriptionSections.length > 3 ? 'max-h-[500px] overflow-hidden' : ''}`}>
                                        <div className="space-y-8">
                                            {descriptionSections.map((section, idx) => (
                                                <div key={idx} className="group">
                                                    {section.title && (
                                                        <h3 className="flex items-center gap-3 text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">
                                                            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                                {section.emoji}
                                                            </span>
                                                            {section.title}
                                                        </h3>
                                                    )}
                                                    <div className="text-base text-slate-600 leading-[1.8] whitespace-pre-line pl-2 border-l-2 border-slate-50 group-hover:border-emerald-100 transition-colors">
                                                        {section.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {!descExpanded && descriptionSections.length > 3 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8 rounded-b-[2rem]">
                                            <Button
                                                variant="outline"
                                                onClick={() => setDescExpanded(true)}
                                                className="bg-white/80 backdrop-blur rounded-full px-8 py-6 font-black uppercase text-xs tracking-widest border-slate-200 hover:bg-slate-50 transition-all shadow-xl"
                                            >
                                                {t("common.showMore")}
                                                <ChevronDown className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {descExpanded && (
                                        <div className="mt-8 flex justify-center border-t border-slate-50 pt-8">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setDescExpanded(false)}
                                                className="font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-900"
                                            >
                                                {t("common.showLess")}
                                                <ChevronDown className="ml-2 w-4 h-4 rotate-180" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Sticky Sidebar Right - Upsell / Newsletter / Quick Specs */}
                            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <h3 className="font-black font-outfit uppercase tracking-wider">{t("shop.storeGuarantee")}</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {[
                                            "100% Authentic From Vietnam",
                                            "Export Standard Packaging",
                                            "Direct Support 24/7",
                                            "Secure Payment Gateway"
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 border-0 rounded-2xl text-[10px] font-black uppercase tracking-widest h-12">
                                        Learn More Services
                                    </Button>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/* ══════════ PERFECT COMBO SECTION - FULL WIDTH ══════════ */}
                    <div className="mt-16 sm:mt-24">
                        <FrequentlyBoughtTogether
                            currentProduct={{
                                id: product.id,
                                slug: product.slug || "",
                                name: product.name,
                                price: product.price,
                                originalPrice: product.originalPrice ?? undefined,
                                salePrice: product.salePrice ?? undefined,
                                isOnSale: product.isOnSale,
                                image: product.image || undefined,
                                inventory: product.inventory
                            }}
                        />
                    </div>

                    {/* ══════════ REVIEWS SECTION ══════════ */}
                    <div className="mt-16 sm:mt-24">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter font-outfit">{t("shop.customerReviews")}</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t("shop.reviewsDescription")}</p>
                            </div>
                            <WriteReviewButton
                                productId={product.id}
                                productName={product.name}
                                productImage={product.image || undefined}
                            />
                        </div>
                        <ReviewSummaryAI productId={product.id} />
                    </div>

                    {/* ══════════ RELATED PRODUCTS ══════════ */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 sm:mt-24">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter font-outfit">{t("shop.youMayAlsoLike")}</h2>
                                <Link href="/products" className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    {t("common.viewAll")}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {relatedProducts.map((rp) => (
                                    <ProductCard key={rp.id} product={rp} />
                                ))}
                            </div>
                        </div>
                    )}


                </div>
            </div>
            <StickyBuyBar
                productName={localizedName}
                price={getCurrentPrice()}
                originalPrice={hasDiscount() ? getOriginalPrice() : undefined}
                inStock={getCurrentInventory() > 0}
                isAddingToCart={isAddingToCart}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                t={t}
            />
        </div>
    );
}
