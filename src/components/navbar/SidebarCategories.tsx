"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import PriceDisplay from "@/components/ui/price-display";
import { useLanguage } from "@/lib/i18n/context";

// Standard types
interface MenuProduct {
    id: number;
    slug: string;
    name: string;
    price: number;
    salePrice: number | null;
    originalPrice: number | null;
    image: string | null;
}

interface MenuCategory {
    id: number;
    name: string;
    slug: string;
    products: MenuProduct[];
}

const getCategoryImage = (slug: string, name: string) => {
    const s = slug.toLowerCase();
    const n = name.toLowerCase();

    if (s.includes('ca-kho') || n.includes('cá khô') || n.includes('hải sản')) return '/cakho.jpeg';
    if (s.includes('trai-cay') || n.includes('trái cây') || n.includes('mứt') || n.includes('say')) return '/traicaysay.jpeg';
    if (s.includes('banh-keo') || n.includes('bánh kẹo')) return '/banhkeo.jpeg';
    if (s.includes('tra') || n.includes('trà') || n.includes('thức uống') || n.includes('cafe')) return '/tra.jpeg';
    if (s.includes('gia-vi') || n.includes('gia vị') || n.includes('nước chấm')) return '/giavi.jpeg';
    if (s.includes('hat-dinh-duong') || n.includes('hạt')) return '/hatdinhduong.jpeg';
    if (s.includes('do-an-vat') || n.includes('ăn vặt')) return '/doanvat.jpeg';
    if (s.includes('suc-khoe') || n.includes('sức khỏe') || n.includes('thực dưỡng')) return '/suckhoe.jpeg';
    
    return '/logo.png'; // default fallback
};

export default function SidebarCategories() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/categories/menu")
            .then((r) => r.ok ? r.json() : { categories: [] })
            .then((data: { categories: MenuCategory[] }) => {
                if (Array.isArray(data.categories) && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            })
            .catch(() => {});
    }, []);

    const activeCategory = activeIdx !== null ? categories[activeIdx] : null;

    return (
        <div 
            className="relative w-full h-full flex flex-col bg-white text-black border-x border-b border-t lg:border-t-0 border-slate-200 rounded-b-xl shadow-sm z-[50]"
            onMouseLeave={() => setActiveIdx(null)}
        >
            <ul className="py-2 flex-1 flex flex-col justify-evenly">
                {categories.map((cat, i) => {
                    const isActive = i === activeIdx;
                    return (
                        <li key={cat.id} className="relative px-2">
                            <Link
                                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                onMouseEnter={() => setActiveIdx(i)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                                    isActive ? "bg-white text-red-600 shadow-sm" : "hover:bg-white text-slate-700"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-md overflow-hidden relative border border-slate-200 shadow-sm flex-shrink-0 bg-white text-black">
                                        <Image src={getCategoryImage(cat.slug, cat.name)} alt={cat.name} fill className="object-cover" />
                                    </div>
                                    <span className={`text-[13px] font-semibold ${isActive ? "text-red-600" : "text-slate-700"}`}>
                                        {t(`categories.${cat.name}` as any) === `categories.${cat.name}` ? cat.name : t(`categories.${cat.name}` as any)}
                                    </span>
                                </div>
                            </Link>

                            {/* Flyout Menu Rendered Relative to Row */}
                            {isActive && cat.products && cat.products.length > 0 && (
                                <div 
                                    className="absolute top-0 left-full ml-1 w-[700px] bg-white text-black border border-slate-200 rounded-lg shadow-xl p-5 z-[100]"
                                >
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                {t(`categories.${cat.name}` as any) === `categories.${cat.name}` ? cat.name : t(`categories.${cat.name}` as any)}
                                            </h3>
                                        </div>
                                        <Link
                                            href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                            className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            {t("common.viewAll") || "Xem tất cả"} <ArrowRight className="w-4 h-4"/>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        {cat.products.slice(0, 4).map(product => {
                                           const isOnSale = product.salePrice != null && product.salePrice < product.price;
                                           const displayPrice = isOnSale ? product.salePrice! : product.price;
                                           return (
                                                <Link 
                                                    key={product.id} 
                                                    href={`/products/${product.slug}`}
                                                    className="group flex flex-col items-center text-center p-2 rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm"
                                                >
                                                    <div className="relative w-28 h-28 mb-2">
                                                        {product.image ? (
                                                            <Image src={product.image} fill sizes="100px" alt={product.name} className="object-cover rounded-md group-hover:scale-105 transition-transform"/>
                                                        ) : (
                                                            <div className="w-full h-full bg-white rounded-md flex items-center justify-center">
                                                                
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[13px] font-semibold text-slate-700 line-clamp-2 leading-snug group-hover:text-red-600">
                                                        {t(`products.${product.slug}` as any) === `products.${product.slug}` ? product.name : t(`products.${product.slug}` as any)}
                                                    </p>
                                                    <PriceDisplay
                                                        currentPrice={displayPrice}
                                                        originalPrice={isOnSale ? product.price : undefined}
                                                        isOnSale={isOnSale}
                                                        size="xs"
                                                        className="mt-0.5"
                                                    />
                                                </Link>
                                           );
                                        })}
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
