"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { useState, useCallback, useEffect } from "react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/lib/i18n/context";
import { createPortal } from "react-dom";

interface ProductImage {
    id: number;
    imageUrl: string;
    altText?: string | null;
    order: number;
    isPrimary: boolean;
}

interface ImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const { t } = useLanguage();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [direction, setDirection] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.order - b.order;
    });

    const currentImage = sortedImages[selectedIndex];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isLightboxOpen || typeof document === "undefined") return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isLightboxOpen]);

    const handlePrevious = useCallback(() => {
        setDirection(-1);
        setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    }, [sortedImages.length]);

    const handleNext = useCallback(() => {
        setDirection(1);
        setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    }, [sortedImages.length]);

    useEffect(() => {
        if (!isLightboxOpen || typeof window === "undefined") return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "Escape") setIsLightboxOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isLightboxOpen, handlePrevious, handleNext]);

    const slideVariants: any = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
            }
        },
        exit: (direction: number) => ({
            x: direction > 0 ? "-100%" : "100%",
            opacity: 0,
            scale: 0.95,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        }),
    };

    return (
        <div className="space-y-3">
            {/* Main Image Container */}
            <div
                className="aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100/50 relative group cursor-zoom-in touch-none"
                onClick={() => setIsLightboxOpen(true)}
            >
                {/* Main Image View */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {currentImage && (
                        <ImageWithFallback
                            src={currentImage.imageUrl}
                            alt={currentImage.altText || productName}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] select-none"
                            priority
                            sizes="(max-width: 768px) 100vw, 420px"
                        />
                    )}
                </div>

                {/* Navigation Arrows - Glassmorphism Style */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/80 hover:scale-110 active:scale-95 transition-all duration-300 z-20 border border-white/40"
                            aria-label={t("imageGallery.previousImage")}
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-800" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/80 hover:scale-110 active:scale-95 transition-all duration-300 z-20 border border-white/40"
                            aria-label={t("imageGallery.nextImage")}
                        >
                            <ChevronRight className="w-5 h-5 text-slate-800" />
                        </button>
                    </>
                )}

                {/* Image counter pill */}
                {sortedImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[11px] font-bold z-20">
                        {selectedIndex + 1} / {sortedImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Strip - VIP Style */}
            {sortedImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1 mt-6">
                    {sortedImages.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => { setDirection(idx > selectedIndex ? 1 : -1); setSelectedIndex(idx); }}
                            className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all duration-500 shrink-0 flex-shrink-0 group/thumb ${idx === selectedIndex
                                    ? "border-emerald-500 shadow-xl shadow-emerald-500/20 scale-105"
                                    : "border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100"
                                }`}
                            aria-label={`${t("imageGallery.viewImage")} ${idx + 1}`}
                        >
                            <ImageWithFallback
                                src={img.imageUrl}
                                alt={img.altText || `${productName} ${idx + 1}`}
                                fill
                                className={`object-cover transition-transform duration-500 ${idx === selectedIndex ? 'scale-110' : 'group-hover/thumb:scale-110'}`}
                                sizes="96px"
                            />
                            {idx === selectedIndex && (
                                <div className="absolute inset-0 ring-4 ring-emerald-500/10 inset-[-2px] rounded-3xl" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {isMounted && createPortal(
                isLightboxOpen && (
                    <div
                        onClick={() => setIsLightboxOpen(false)}
                        className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-4"
                    >
                            {/* Close */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                                className="absolute top-5 right-5 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-20"
                                aria-label={t("common.close")}
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* Navigation */}
                            {sortedImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-20"
                                        aria-label={t("imageGallery.previousImage")}
                                    >
                                        <ChevronLeft className="w-6 h-6 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-20"
                                        aria-label={t("imageGallery.nextImage")}
                                    >
                                        <ChevronRight className="w-6 h-6 text-white" />
                                    </button>
                                </>
                            )}

                            {/* Image only */}
                            <div className="relative w-[min(96vw,1400px)] h-[92vh]" onClick={(e) => e.stopPropagation()}>
                                {currentImage && (
                                    <ImageWithFallback
                                        src={currentImage.imageUrl}
                                        alt={currentImage.altText || productName}
                                        fill
                                        className="object-contain"
                                        quality={100}
                                        sizes="100vw"
                                    />
                                )}
                            </div>
                        </div>
                    ),
                    document.body
                )}
        </div>
    );
}
