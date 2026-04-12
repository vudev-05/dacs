"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import { logger } from "@/lib/logger";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export default function RecommendedProductsSection() {
    const { isVietnamese } = useLanguage();
    const [recommendedProducts, setRecommendedProducts] = useState<ProductCardProduct[]>([]);
    const [loadingRecommended, setLoadingRecommended] = useState(true);

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                // Đọc category đã xem từ localStorage
                let recentCategory = "";
                if (typeof window !== "undefined") {
                    try {
                        const stored = localStorage.getItem("likefood_recent_categories");
                        if (stored) {
                            const categories = JSON.parse(stored);
                            if (categories.length > 0) {
                                recentCategory = categories[0]; // Lấy category quan tâm nhất
                            }
                        }
                    } catch(e) {}
                }

                // Nếu có lịch sử, fetch theo category đó + best selling. Nếu không, mặc định toàn hệ thống.
                const apiUrl = recentCategory
                    ? `/api/products?limit=20&sort=best-selling&category=${encodeURIComponent(recentCategory)}`
                    : '/api/products?limit=20&sort=best-selling';

                let res = await fetch(apiUrl, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch recommended products');
                let data = await res.json();
                
                // Nếu fetch theo category trả về quá ít sản phẩm (< 5 cái), tự động fallback lấy toàn site
                if (!data.products || data.products.length < 5) {
                     res = await fetch('/api/products?limit=20&sort=best-selling', { cache: 'no-store' });
                     data = await res.json();
                }

                if (data.products) {
                    // Lấy ra random hoặc slice một khoảng khác để đảm bảo không bị trùng lắp hoàn toàn với các block khác
                    const shuffled = data.products
                        .sort(() => 0.5 - Math.random()) // Randomize slightly from the best sellers
                        .slice(0, 10);
                    setRecommendedProducts(shuffled);
                }
            } catch (error) {
                logger.error('Failed to fetch recommended products', error as Error, { context: 'recommended-products-section' });
            } finally {
                setLoadingRecommended(false);
            }
        };

        fetchRecommendedProducts();
    }, []);

    // Không render section nếu không đang load và không có sản phẩm
    if (!loadingRecommended && recommendedProducts.length === 0) return null;

    return (
        <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
                        {isVietnamese ? "Gợi Ý Hôm Nay" : "Today's Recommendations"}
                    </h2>
                </div>
            </div>

            {loadingRecommended ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-slate-50 rounded-xl border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {recommendedProducts.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
