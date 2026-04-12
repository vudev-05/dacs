"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export default function FeaturedProductsSection() {
    const { t, isVietnamese } = useLanguage();
    const [products, setProducts] = useState<ProductCardProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch best-selling or featured products (limit 20)
                const res = await fetch('/api/products?limit=20&featured=true', { cache: 'no-store' });
                const data = await res.json();
                
                if (data.products && data.products.length > 0) {
                    setProducts(data.products);
                } else {
                    // Fallback to newly added if no featured products
                    const fallbackRes = await fetch('/api/products?limit=20&sort=newest', { cache: 'no-store' });
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.products) {
                        setProducts(fallbackData.products);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch featured products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-8 mb-8">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-5"></div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`aspect-[3/4] bg-slate-50 rounded-xl border border-slate-100 animate-pulse ${i >= 10 ? 'hidden lg:block' : ''}`}></div>
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    const translate = (key: string, viText: string, enText: string) => {
        const value = t(`shop.${key}`);
        return value === `shop.${key}` || value.includes(".") ? (isVietnamese ? viText : enText) : value;
    };

    return (
        <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-8 mb-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2.5">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-800">
                        {translate("featuredProducts", "SẢN PHẨM NỔI BẬT", "FEATURED PRODUCTS")}
                    </h2>
                </div>
                
                <Link 
                    href="/products?featured=true" 
                    className="hidden sm:flex group flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100 rounded-lg transition-all duration-300"
                >
                    <span className="text-sm font-bold text-slate-600 group-hover:text-teal-600 transition-colors">
                        {translate("viewAll", "Xem tất cả", "View all")}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Grid 5 cột (LG), 2 cột (Mobile) thẻ nhỏ gọn gap-3 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {products.map((product, index) => {
                    // On mobile, hide products past index 9 if not expanded
                    const isHiddenOnMobile = !isExpanded && index >= 10;
                    return (
                        <div 
                            key={product.id} 
                            className={`${isHiddenOnMobile ? 'hidden sm:block' : 'block'}`}
                        >
                            <ProductCard product={product} viewMode="grid" />
                        </div>
                    );
                })}
            </div>

            {/* Mobile View More Button */}
            {!isExpanded && products.length > 10 && (
                <div className="flex justify-center mt-5 sm:hidden">
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-bold text-sm tracking-wide rounded-full transition-colors w-full justify-center"
                    >
                        {translate("showMore", "Xem thêm", "Show more")}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {/* View All Button at bottom for Mobile when expanded */}
            {isExpanded && products.length > 10 && (
                <div className="flex justify-center mt-5 sm:hidden">
                    <Link 
                        href="/products?featured=true"
                        className="flex items-center gap-2 px-6 py-2.5 bg-teal-50 border border-teal-100 text-teal-700 font-bold text-sm tracking-wide rounded-full transition-colors w-full justify-center"
                    >
                        {translate("viewAll", "Xem tất cả", "View all")}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </section>
    );
}
