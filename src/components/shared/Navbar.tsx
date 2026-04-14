"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Heart, Phone, Home, Flame, Settings, FileText, ShoppingBag, Info, HelpCircle, Gift, UserPlus, MoreHorizontal } from "lucide-react";
import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { useCartState } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import MiniCart from "@/components/cart/MiniCart";
import UserDropdown from "@/components/navbar/UserDropdown";
import LanguageToggle from "@/components/navbar/LanguageToggle";
import SearchSuggestions from "@/components/navbar/SearchSuggestions";
import SidebarCategories from "@/components/navbar/SidebarCategories";
import { useLanguage } from "@/lib/i18n/context";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { useNavbarConfig } from "@/hooks/useNavbarConfig";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { useSearchHints } from "@/hooks/useSearchHints";
import { analytics } from "@/lib/analytics/sdk";

// ── Mobile inline search — expands in-header on tap, no drawer required
// ─────────────────────────────────────────────────────────────────────────────
// Mobile inline search — expands in-header on tap, no drawer required
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Main Navbar content (must be inside Suspense for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────
function NavbarContent() {
    const { t, dict } = useLanguage();
    const reduceMotion = useReducedMotion();

    // ── Custom hooks (replaces 15+ inline states) ─────────────────────────
    const { isScrolled, isHidden } = useNavbarScroll();
    const { supportPhone, navLinks, announcementEnabled, announcementText } = useNavbarConfig();
    const wishlistCount = useWishlistCount();

    // ── Local UI state only ───────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // ── i18n dynamic data ───────────────────────────────────────────────
    const TRENDING_KEYWORDS: string[] = Array.isArray((dict as any)?.common?.trendingKeywords)
        ? (dict as any).common.trendingKeywords
        : [];

    // ── Search history ────────────────────────────────────────────────────
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("searchHistory") || "[]");
            if (Array.isArray(stored)) setSearchHistory(stored);
        } catch {}
    }, []);

    const saveSearchHistory = useCallback((query: string) => {
        const q = query.trim();
        if (!q || q.length < 2) return;
        setSearchHistory(prev => {
            const next = [q, ...prev.filter(h => h !== q)].slice(0, 5);
            try { localStorage.setItem("searchHistory", JSON.stringify(next)); } catch {}
            return next;
        });
    }, []);

    const clearSearchHistory = useCallback(() => {
        setSearchHistory([]);
        try { localStorage.removeItem("searchHistory"); } catch {}
    }, []);

    // ── Search state ──────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileSearchActive, setMobileSearchActive] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const { suggestions, isLoading: isLoadingHints } = useSearchHints(searchQuery, showSuggestions || mobileSearchActive);

    const desktopSearchRef = useRef<HTMLInputElement>(null);
    const { totalItems, lastAddedId } = useCartState();
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isAdminUser = session?.user?.role === "ADMIN";

    // Close MegaMenu when navigating
    useEffect(() => {
        setIsMegaMenuOpen(false);
    }, [pathname]);

    const featuredCategories = [
        { name: t("navbar.driedFish"), icon: "🐟", color: "bg-blue-50", href: "/products?category=Cá khô" },
        { name: t("navbar.shrimpSquid"), icon: "🦐", color: "bg-rose-50", href: "/products?category=Tôm & Mực khô" },
        { name: t("navbar.fruits"), icon: "🥭", color: "bg-emerald-50", href: "/products?category=Trái cây sấy" },
        { name: t("navbar.spices"), icon: "🌶️", color: "bg-orange-50", href: "/products?category=Gia vị Việt" },
    ];

    const mobilePrimaryLinks = [
        { label: t("common.about"), href: "/about", icon: <Info className="w-5 h-5" /> },
        { label: t("common.flashSale"), href: "/flash-sale", icon: <Flame className="w-5 h-5" /> },
        { label: t("navbar.voucher"), href: "/vouchers", icon: <Gift className="w-5 h-5" /> },
        { label: t("navbar.posts"), href: "/posts", icon: <FileText className="w-5 h-5" /> },
        { label: t("common.faq"), href: "/faq", icon: <HelpCircle className="w-5 h-5" /> },
        { label: t("common.contact"), href: "/contact", icon: <Phone className="w-5 h-5" /> },
    ];

    const mobileAccountLinks = [
        { label: t("navbar.orderHistory"), href: "/profile/orders", icon: <ShoppingCart className="w-5 h-5" /> },
        { label: t("navbar.referral"), href: "/profile/referrals", icon: <UserPlus className="w-5 h-5" /> },
        { label: t("navbar.myVouchers"), href: "/profile/vouchers", icon: <Gift className="w-5 h-5" /> },
        { label: t("navbar.accountSettings"), href: "/profile", icon: <Settings className="w-5 h-5" /> },
    ];

    const announcementItems = useMemo(() => {
        const parsed = announcementText
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);

        if (parsed.length > 0) return parsed;

        return [
            "navbar.announcement1",
            "navbar.announcement2",
            "navbar.announcement3",
        ];
    }, [announcementText]);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) setSearchQuery(query);
    }, [searchParams]);

    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchQuery, showSuggestions]);

    const handleSearch = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        saveSearchHistory(q);
        // Track search query (Analytics DB)
        analytics.trackSearch(q, suggestions.length);
        setShowSuggestions(false);
        setMobileSearchActive(false);
        router.push(`/products?search=${encodeURIComponent(q)}`);
    }, [searchQuery, router, saveSearchHistory, suggestions.length]);

    const handleSuggestionClick = useCallback((slug: string | undefined, id: string) => {
        // Track search result click (Analytics DB)
        analytics.trackSearchResultClick(searchQuery, Number(id), 0);
        setShowSuggestions(false);
        setMobileSearchActive(false);
        // Reset search query after navigation to prevent stale state
        setTimeout(() => {
            setSearchQuery("");
        }, 100);
        router.push(`/products/${slug || id}`);
    }, [router, searchQuery]);

    const handleTrendingClick = useCallback((kw: string) => {
        saveSearchHistory(kw);
        setShowSuggestions(false);
        router.push(`/products?search=${encodeURIComponent(kw)}`);
        // Reset search query sau khi navigate
        setTimeout(() => {
            setSearchQuery("");
        }, 100);
    }, [router, saveSearchHistory]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;

        const navItemsCount = searchQuery.length < 1 
            ? TRENDING_KEYWORDS.length 
            : suggestions.length + 1; // +1 for "View All Results"

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1 >= navItemsCount ? 0 : prev + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev <= 0 ? navItemsCount - 1 : prev - 1));
        } else if (e.key === "Enter") {
            if (selectedIndex === -1) {
                handleSearch();
            } else {
                e.preventDefault();
                if (searchQuery.length < 1) {
                    handleTrendingClick(TRENDING_KEYWORDS[selectedIndex]);
                } else if (selectedIndex < suggestions.length) {
                    const item = suggestions[selectedIndex];
                    handleSuggestionClick(item.slug, String(item.id));
                } else {
                    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                    setShowSuggestions(false);
                }
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            desktopSearchRef.current?.blur();
        }
    };

    const renderMobileNavLink = (
        item: { label: string; href: string; icon: React.ReactNode },
        idx: number,
        baseDelay: number
    ) => (
        <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: baseDelay + idx * 0.05 }}
        >
            <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3.5 p-3 rounded-2xl transition-all border bg-slate-50 border-transparent hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
            >
                <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center transition-transform text-emerald-600 group-hover:scale-110">
                    {item.icon}
                </div>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">{item.label}</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300 group-hover:text-emerald-400 ml-auto transition-colors" />
            </Link>
        </motion.div>
    );


    return (
        <>
            <nav
                className="sticky top-0 z-[100] bg-white backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
            >
                {/* Skip to Content Link for Accessibility */}
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:p-4 focus:bg-white/10 focus:text-slate-900 focus:font-bold focus:rounded-br-2xl focus:shadow-xl top-0 left-0 transition-transform">
                    {t("common.skipToContent")}
                </a>

                {announcementEnabled && (
                    <div className="w-full border-b border-emerald-800/10 bg-[#DFF0E0] h-8" role="region" aria-label="Store announcements">
                        <div className="w-full px-4 sm:px-6 lg:px-[6%] flex items-center justify-between h-full">
                            <span className="sr-only">{announcementItems.join(" | ")}</span>
                            <div className="flex-1 overflow-hidden relative mr-4 h-full flex items-center">
                                <motion.div
                                    className="flex w-max whitespace-nowrap"
                                    aria-hidden="true"
                                    animate={reduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
                                    transition={reduceMotion ? { duration: 0 } : { duration: 40, ease: "linear", repeat: Infinity }}
                                >
                                    {/* Repeat content to create smooth marquee loop. */}
                                    {[...Array(4)].map((_, groupIdx) => (
                                        <div key={groupIdx} className="flex items-center">
                                            {announcementItems.map((msg, i) => (
                                                <div key={i} className="flex items-center">
                                                    <span className="mx-8 text-[11px] font-bold tracking-wide text-emerald-900/80 uppercase">
                                                        {t(msg as any) === msg && !msg.includes('.') ? msg : t(msg as any)}
                                                    </span>
                                                    <span className="text-emerald-700/25 text-[10px] mx-2">•</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                            
                            {/* Auth links mapped to Topbar */}
                            <div className="flex flex-shrink-0 items-center justify-end gap-3 text-[10px] font-black text-emerald-900/70 tracking-wider">
                                {!session && (
                                    <Link href="/login" className="hover:text-emerald-900 transition-colors uppercase">
                                        {t("common.login")}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== MAIN HEADER ========== */}
                <div className={`w-full px-4 sm:px-6 lg:px-[6%] bg-white border-b border-slate-100/60 transition-all duration-150 ease-out py-3 relative z-[70]`}>
                    <div className="flex items-center justify-between gap-4 lg:gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <motion.img
                                src="/logo.png?v=2"
                                alt="LIKEFOOD - Đặc sản Việt Nam tại Mỹ"
                                className={`w-auto object-contain transition-all duration-300 h-7 xs:h-9 sm:h-10`}
                                whileHover={{ scale: 1.03 }}
                            />
                        </Link>
                        {/* ========== SEARCH BAR ========== */}
                        <div className="flex flex-1 min-w-0 relative">
                            <form onSubmit={handleSearch} className="relative w-full">
                                <div className="relative flex items-center group">
                                    <div className="absolute left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors z-10">
                                        <Search className="w-5 h-5 opacity-70" />
                                    </div>
                                    <input
                                        ref={desktopSearchRef}
                                        type="text"
                                        placeholder={t("common.search")}
                                        value={searchQuery}
                                        onFocus={() => setShowSuggestions(true)}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        className="w-full h-[48px] pl-[48px] pr-4 md:pr-[120px] bg-white/90 hover:bg-white border-2 border-transparent focus:border-white focus:bg-white backdrop-blur-md rounded-full text-[14px] font-medium focus:ring-[4px] focus:ring-black/5 outline-none transition-all placeholder:text-slate-400 shadow-[0_4px_15px_rgba(0,0,0,0.04)] group-focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                                    />
                                    <div className="absolute right-1.5 flex items-center h-[36px]">
                                        <motion.button
                                            type="submit"
                                            className="hidden md:flex h-full px-4 md:px-6 bg-emerald-600 text-white rounded-full font-bold text-[11px] md:text-[12px] uppercase tracking-wide hover:bg-emerald-700 transition-colors shadow-sm items-center justify-center"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {t("common.search")}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Click outside overlay - PHẢI RENDER TRƯỚC dropdown để dropdown nằm trên */}
                                {showSuggestions && (
                                    <div 
                                        className="fixed inset-0 z-[55]" 
                                        onMouseDown={() => setShowSuggestions(false)}
                                    />
                                )}

                                {/* ========== SEARCH DROPDOWN ========== */}
                                <AnimatePresence>
                                       {showSuggestions && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-[60]"
                                        >
                                            <SearchSuggestions
                                                query={searchQuery}
                                                suggestions={suggestions}
                                                isLoading={isLoadingHints}
                                                selectedIndex={selectedIndex}
                                                trendingKeywords={TRENDING_KEYWORDS}
                                                translations={t}
                                                searchHistory={searchHistory}
                                                onClearHistory={clearSearchHistory}
                                                onSuggestionClick={handleSuggestionClick}
                                                onTrendingClick={handleTrendingClick}
                                                onViewAllClick={() => setShowSuggestions(false)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        {/* Mobile — 3 dots Menu Trigger */}
                        <div className="md:hidden ml-1.5 xs:ml-2 flex flex-shrink-0 items-center">
                            <motion.button
                                onClick={() => setIsOpen(true)}
                                aria-label="Menu"
                                className="p-2 xs:p-2.5 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors bg-slate-50 border border-slate-200 shadow-sm"
                                whileTap={{ scale: 0.9 }}
                            >
                                <MoreHorizontal className="w-5 h-5 text-emerald-700" />
                            </motion.button>
                        </div>

                        {/* ========== ACTION ICONS (Removed on Mobile) ========== */}
                        <div className={`hidden md:flex items-center gap-1.5 xs:gap-2`}>
                            {/* Language toggle — always visible, persistent after scroll */}
                            <div className="hidden sm:block">
                                <LanguageToggle />
                            </div>

                            {/* Wishlist - with count badge */}
                            <Link href="/profile/wishlist" aria-label={t("navbar.wishlist")} className="flex">
                                <motion.div
                                    whileHover={{
                                        y: -4,
                                        backgroundColor: "#f43f5e0d", // rgba(244, 63, 94, 0.05)
                                        borderColor: "#f43f5e33"      // rgba(244, 63, 94, 0.2)
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 bg-slate-50/50 hover:bg-white/70 border border-transparent rounded-2xl transition-all group relative"
                                >
                                    <Heart className="w-5 h-5 text-slate-600 group-hover:text-rose-500 transition-colors" />
                                    {isMounted && wishlistCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                        >
                                            {wishlistCount > 99 ? "99+" : wishlistCount}
                                        </motion.span>
                                    )}
                                </motion.div>
                            </Link>

                            {/* Cart */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
                                    aria-label={isMounted && totalItems > 0 ? `${t("common.cart")} (${totalItems > 99 ? '99+' : totalItems} ${t("cart.items")})` : t("common.cart")}
                                    animate={lastAddedId ? {
                                        x: [0, -4, 4, -4, 4, 0],
                                        scale: [1, 1.1, 1],
                                    } : {}}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{
                                        y: -4,
                                        backgroundColor: "#10b9810d", // rgba(16, 185, 129, 0.05)
                                        borderColor: "#10b98133"      // rgba(16, 185, 129, 0.2)
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 bg-slate-50/50 hover:bg-white/70 border border-transparent rounded-2xl transition-all group relative"
                                >
                                    <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                                    {isMounted && totalItems > 0 && (
                                        <motion.span
                                            className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-xl"
                                            initial={{ scale: 0, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            key={totalItems} // Trigger re-animation on count change
                                        >
                                            {totalItems > 99 ? "99+" : totalItems}
                                        </motion.span>
                                    )}
                                </motion.button>
                                <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
                            </div>

                            {/* User Avatar - Desktop only, Mobile uses Drawer */}
                            {session && (
                                <div className="hidden lg:block relative">
                                    <motion.button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        aria-label={t("navbar.accountSettings")}
                                        aria-expanded={isUserMenuOpen}
                                        className="relative w-10 h-10 bg-slate-50 hover:bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all shadow-sm"
                                        whileHover={{ y: -2 }}
                                    >
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="Avatar"
                                                fill
                                                className="object-cover rounded-2xl"
                                                sizes="40px"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                        )}
                                    </motion.button>
                                    <UserDropdown
                                        isOpen={isUserMenuOpen}
                                        onClose={() => setIsUserMenuOpen(false)}
                                        user={session.user}
                                    />
                                </div>
                            )}

                            {/* Mobile Menu Toggle (Glassmorphism style) */}
                            <motion.button
                                className={`lg:hidden p-2.5 rounded-2xl transition-all shadow-md ${isOpen
                                    ? "bg-primary text-white shadow-primary/20"
                                    : "bg-white/40 backdrop-blur-md text-slate-800 border border-slate-200/50"}`}
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label={isOpen ? t("common.close") : t("common.categories")}
                                aria-expanded={isOpen}
                                aria-controls="mobile-drawer"
                                whileTap={{ scale: 0.9 }}
                            >
                                <AnimatePresence mode="wait">
                                    {isOpen ? <X key="x" className="w-5 h-5" /> : <Menu key="m" className="w-6 h-6" />}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ========== QUICK NAV ROW ========== */}
                <div className="block bg-white z-[60] relative border-b border-slate-100">
                    <div className="w-full px-4 sm:px-6 lg:px-[6%] bg-white flex justify-between items-center py-2 lg:py-0">
                        {/* Category Button aligned to Sidebar */}
                                <div className="block w-full lg:w-[240px] xl:w-[260px] flex-shrink-0 relative group">
                                    <motion.button
                                        onClick={() => {
                                            if (window.innerWidth >= 1024 && pathname === "/") return;
                                            setIsMegaMenuOpen(!isMegaMenuOpen);
                                        }}
                                        className={`w-full rounded-lg lg:rounded-none h-[40px] md:h-[46px] flex items-center justify-between px-3 md:px-4 bg-[#7D9A6E] text-white hover:bg-[#728F63] transition-colors font-bold uppercase tracking-wider text-[12px] md:text-[13px] ${pathname !== "/" ? "cursor-pointer" : "cursor-pointer lg:cursor-default"}`}
                                    >
                                        <div className="flex items-center gap-2 md:gap-2.5">
                                            <Menu className="w-4 h-4 md:w-5 md:h-5 opacity-90"/>
                                            <span className="truncate">{t("navbar.categoryBtn") || "Danh mục"}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 md:w-4 md:h-4 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''} ${pathname === "/" ? "lg:hidden" : ""}`} />
                                    </motion.button>
                                    
                                    {/* Sidebar Categories Dropdown */}
                                    <AnimatePresence>
                                        {(isMegaMenuOpen) && (
                                            <>
                                                {/* Invisible overlay for clicking outside */}
                                                <div 
                                                    className="fixed inset-0 z-[90] lg:hidden" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsMegaMenuOpen(false);
                                                    }} 
                                                />
                                                {pathname !== "/" && (
                                                    <div 
                                                        className="fixed inset-0 z-[90] hidden lg:block" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsMegaMenuOpen(false);
                                                        }} 
                                                    />
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, scaleY: 0.95 }}
                                                    animate={{ opacity: 1, scaleY: 1 }}
                                                    exit={{ opacity: 0, scaleY: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    style={{ originY: 0 }}
                                                    className={`absolute top-full left-0 mt-1 lg:mt-0 w-full lg:w-[260px] z-[100] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] bg-white rounded-2xl lg:rounded-b-2xl border border-slate-100 lg:border-t-0 ${pathname === "/" ? "lg:hidden" : ""}`}
                                                >
                                                    <SidebarCategories />
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex-1 hidden lg:flex justify-end">
                                {navLinks ? (
                                    /* Admin override — use custom links from DB */
                                    <div className="w-full flex items-center justify-between px-2 xl:px-4 py-1">
                                        {navLinks.map((item) => (
                                            <Link key={item.href} href={item.href} className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${item.highlight ? "text-red-600 hover:text-red-700" : pathname === item.href ? "text-slate-900" : "text-slate-800 hover:text-slate-900"}`}>
                                                <span className="relative">{t(item.label as any) === item.label && !item.label.includes('.') ? item.label : t(item.label as any)}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-slate-700/30 rounded-full transition-all duration-300 ${pathname === item.href ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full flex items-center justify-start md:justify-between px-0 md:px-2 xl:px-4 py-1 overflow-x-auto whitespace-nowrap scrollbar-hide gap-1 md:gap-0">

                                        <Link href="/" className={`relative block px-2 md:px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname === "/" ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.home")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname === "/" ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/products" className={`relative block px-2 md:px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/products") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.products")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/products") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/about" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/about") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.about")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/about") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/flash-sale" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/flash-sale") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.flashSale")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/flash-sale") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/vouchers" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/vouchers") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("navbar.voucher")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/vouchers") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/posts" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/posts") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("navbar.posts")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/posts") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/faq" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/faq") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.faq")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/faq") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                        <Link href="/contact" className={`relative block px-2 py-2.5 text-[11px] lg:text-[12px] font-bold uppercase tracking-wider transition-colors group ${pathname.startsWith("/contact") ? "text-emerald-950" : "text-emerald-900/70 hover:text-emerald-950"}`}>
                                            <span className="relative">{t("common.contact")}<span className={`absolute -bottom-0.5 left-0 h-[2px] bg-emerald-900/30 rounded-full transition-all duration-300 ${pathname.startsWith("/contact") ? "w-full" : "w-0 group-hover:w-full"}`} /></span>
                                        </Link>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


            </nav>

            {/* ========== MOBILE MENU DRAWER (Moved outside for fixed positioning) ========== */}
            <AnimatePresence>
                {
                    isOpen && (
                        <>
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] lg:hidden"
                            />

                            {/* Drawer Content */}
                            <motion.div
                                id="mobile-drawer"
                                className="lg:hidden fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[160] overflow-y-auto shadow-2xl"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                            >
                                <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-emerald-800/10 z-10">
                                    <Link href="/" onClick={() => setIsOpen(false)}>
                                        <motion.img
                                            src="/logo.png?v=2"
                                            alt="LIKEFOOD - Đặc sản Việt Nam tại Mỹ"
                                            className="h-7 xs:h-8 sm:h-9 w-auto"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        />
                                    </Link>
                                    <motion.button
                                        onClick={() => setIsOpen(false)}
                                        aria-label={t("common.close")}
                                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-5 h-5 text-slate-800" />
                                    </motion.button>
                                </div>

                                <div className="p-4 space-y-6 pb-28">

                                    {/* Primary navigation synced with desktop */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t("navbar.discover")}</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {mobilePrimaryLinks.map((item, idx) => renderMobileNavLink(item, idx, 0.3))}
                                        </div>
                                    </div>

                                    {/* Account shortcuts */}
                                    {session && (
                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{t("navbar.member")}</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {mobileAccountLinks.map((item, idx) => renderMobileNavLink(item, idx, 0.45))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin portal for admin accounts */}
                                    {session && isAdminUser && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.58 }}
                                        >
                                            <Link
                                                href="/admin/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm"
                                            >
                                                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white shadow-sm flex items-center justify-center">
                                                    <Settings className="w-4.5 h-4.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-black uppercase tracking-wider text-emerald-700">{t("navbar.adminPortal")}</p>
                                                    <p className="text-[11px] font-semibold text-emerald-600/90">{t("navbar.dashboard") || "Dashboard"}</p>
                                                </div>
                                                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-emerald-500" />
                                            </Link>
                                        </motion.div>
                                    )}

                                    {/* Language toggle for mobile */}
                                    <div className="flex items-center justify-between py-3 px-1 border-t border-slate-100">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{t("navbar.language")}</span>
                                        <LanguageToggle />
                                    </div>

                                    {/* Hotline trực tiếp */}
                                    <motion.a
                                        href={`tel:${supportPhone}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.55 }}
                                        className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl"
                                    >
                                        <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">{t("footer.hotline") || "Hotline 24/7"}</p>
                                            <p className="text-[13px] font-bold text-emerald-800">{supportPhone}</p>
                                        </div>
                                    </motion.a>

                                    {/* Auth Actions for Mobile */}
                                    {!session && (
                                        <motion.div
                                            className="pt-6 border-t border-slate-100 space-y-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-[12px] uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all border-none">
                                                    {t("navbar.loginNow")}
                                                </Button>
                                            </Link>
                                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full h-11 rounded-2xl border-2 border-emerald-500 text-emerald-600 font-bold text-[12px] uppercase tracking-wider hover:bg-emerald-50 transition-all">
                                                    {t("navbar.createAccount")}
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    )}

                                    {/* Session Info if Logged In */}
                                    {session && (
                                        <motion.div
                                            className="p-4 bg-primary/5 rounded-3xl border border-primary/10 flex items-center gap-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 shadow-sm overflow-hidden p-0.5 relative">
                                                <Image
                                                    src={session.user.image || "/images/default-avatar.png"}
                                                    className="object-cover rounded-[14px]"
                                                    alt="User"
                                                    fill
                                                    sizes="48px"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t("navbar.member")}</p>
                                                <p className="text-[14px] font-bold text-slate-800 truncate max-w-[150px]">{session.user.name}</p>
                                            </div>
                                            <Link href="/profile" className="ml-auto" onClick={() => setIsOpen(false)}>
                                                <Button size="sm" variant="ghost" className="p-2 text-primary hover:bg-primary/10 rounded-2xl">
                                                    <Settings className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >
        </>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={
            <nav className="sticky top-0 z-[100] bg-[#DFF0E0] shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-[8%]">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-8 bg-white/20 animate-pulse rounded-lg" />
                            <div className="hidden md:block w-96 h-10 bg-white/15 animate-pulse rounded-full" />
                        </div>
                        <div className="flex items-center gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 bg-white/15 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        }>
            <NavbarContent />
        </Suspense>
    );
}
