"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import Link from "next/link";
import {
    Phone,
    MapPin,
    Mail,
    ShieldCheck,
    Truck,
    ChevronDown,
    Facebook,
    Instagram,
    Youtube,
    Music2,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

type FooterMenuCategory = {
    name: string;
    slug: string;
};

const PAYMENT_METHODS = [
    {
        label: "Visa",
        icon: (
            <div className="flex items-center justify-center pt-0.5">
                <span className="text-[#1434CB] font-black italic text-[18px] sm:text-[20px] tracking-tighter leading-none" style={{ fontFamily: "Arial, sans-serif", transform: "scaleX(1.05)" }}>
                    VISA
                </span>
            </div>
        ),
    },
    {
        label: "Mastercard",
        icon: (
            <svg viewBox="0 0 38 24" className="h-5 sm:h-6 w-auto">
              <circle cx="12" cy="12" r="12" fill="#EA001B"/>
              <circle cx="26" cy="12" r="12" fill="#FFA200"/>
              <path d="M19 21.05C16.5 19.5 15 16 15 12C15 8 16.5 4.5 19 2.95C21.5 4.5 23 8 23 12C23 16 21.5 19.5 19 21.05Z" fill="#FF5E00"/>
            </svg>
        ),
    },
    {
        label: "American Express",
        icon: (
            <div className="bg-[#2671B9] rounded-[4px] px-2 flex items-center justify-center h-[22px] sm:h-6">
                <span className="text-white font-[900] text-[10px] sm:text-[11px] tracking-[0.06em] leading-none" style={{ fontFamily: "Arial, sans-serif" }}>
                    AMEX
                </span>
            </div>
        ),
    },
    {
        label: "Apple Pay",
        icon: (
             <div className="flex items-center gap-1.5 pt-0.5">
                <svg viewBox="0 0 384 512" className="h-[14px] sm:h-[16px] w-auto fill-slate-800">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <span className="text-slate-800 font-[700] tracking-tight text-[12px] sm:text-[14px] leading-none">Pay</span>
            </div>
        ),
    },
];



export default function Footer() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const { t } = useLanguage();

    const [supportPhone, setSupportPhone] = useState(process.env.NEXT_PUBLIC_SITE_SUPPORT_PHONE || "+1 402-315-8105");
    const [supportEmail, setSupportEmail] = useState(process.env.NEXT_PUBLIC_SITE_SUPPORT_EMAIL || "tranquocvu3011@gmail.com");
    const [supportAddress, setSupportAddress] = useState(process.env.NEXT_PUBLIC_SITE_ADDRESS || "Omaha, NE 68136, United States");
    const [socialUrls, setSocialUrls] = useState({
        facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/profile.php?id=100076170558548",
        instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/likefood",
        tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
        youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
    });
    const [websiteCategories, setWebsiteCategories] = useState<FooterMenuCategory[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const { getPublicSettings } = await import("@/lib/public-settings");
                const [data, categoriesRes] = await Promise.all([
                    getPublicSettings(),
                    fetch("/api/categories/menu").catch(() => null),
                ]);

                if (data.SITE_SUPPORT_PHONE) setSupportPhone(data.SITE_SUPPORT_PHONE);
                if (data.SITE_SUPPORT_EMAIL) setSupportEmail(data.SITE_SUPPORT_EMAIL);
                if (data.SITE_ADDRESS) setSupportAddress(data.SITE_ADDRESS);
                setSocialUrls((prev) => ({
                    facebook: data.FACEBOOK_URL || prev.facebook,
                    instagram: data.INSTAGRAM_URL || prev.instagram,
                    tiktok: data.TIKTOK_URL || prev.tiktok,
                    youtube: data.YOUTUBE_URL || prev.youtube,
                }));

                if (categoriesRes?.ok) {
                    const payload = (await categoriesRes.json()) as {
                        categories?: Array<{ name?: string; slug?: string }>;
                    };
                    const nextCategories = Array.isArray(payload.categories)
                        ? payload.categories
                            .filter((c) => c?.name && c?.slug)
                            .map((c) => ({ name: String(c.name), slug: String(c.slug) }))
                        : [];
                    setWebsiteCategories(nextCategories);
                }
            } catch {
                // Keep defaults
            }
        };
        void load();
    }, []);

    const dynamicCategoryLinks = websiteCategories.slice(0, 8).map((cat) => ({
        label: t(`categories.${cat.name}` as any) !== `categories.${cat.name}` ? t(`categories.${cat.name}` as any) : cat.name,
        href: `/products?category=${encodeURIComponent(cat.slug)}`,
    }));


    /* ── Link data ── */
    const linksList = [
        { label: t("footer.aboutUs"), href: "/about" },
        { label: t("footer.brandStory"), href: "/about#story" },
        { label: t("footer.posts"), href: "/posts" },
        { label: t("footer.shippingPolicy"), href: "/policies/shipping" },
        { label: t("footer.returnPolicy"), href: "/policies/return" },
        { label: t("footer.faq"), href: "/faq" },
    ];

    const categoriesList =
        dynamicCategoryLinks.length > 0
            ? dynamicCategoryLinks
            : [
                { label: t("footer.allProducts"), href: "/products" },
                { label: t("footer.featuredProducts"), href: "/products?featured=true" },
                { label: t("footer.driedSeafood"), href: "/products?category=dried-seafood" },
                { label: t("footer.traditionalSpices"), href: "/products?category=spices" },
                { label: t("footer.gifts"), href: "/products?category=gifts" },
                { label: t("footer.flashSale"), href: "/flash-sale" },
            ];

    /* ── Mobile accordion state ── */
    const [openCol, setOpenCol] = useState<string | null>(null);

    const MobileAccordion = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
        <div className="lg:hidden">
            <button
                className="w-full flex items-center justify-between py-3 border-b border-emerald-200/50 text-left"
                onClick={() => setOpenCol(openCol === id ? null : id)}
                aria-expanded={openCol === id}
            >
                <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/80">{title}</span>
                <motion.span animate={{ rotate: openCol === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-emerald-700/40" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {openCol === id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="py-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <footer ref={ref} className="text-slate-800">
            {/* ═══════════ MAIN 4-COLUMN SECTION ═══════════ */}
            <div className="bg-[#DFF0E0]">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-[6%] pt-10 pb-1 lg:py-12">
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* ── COL 1: Brand + Description + Social ── */}
                        <div className="space-y-4">
                            <Link href="/" aria-label="LIKEFOOD">
                                <motion.img
                                    src="/logo.png?v=2"
                                    alt="LIKEFOOD"
                                    className="h-10 w-auto object-contain"
                                    whileHover={{ scale: 1.03 }}
                                />
                            </Link>

                            <p className="text-[13px] text-emerald-900/55 leading-relaxed font-medium">
                                {t("footer.description")}
                            </p>

                            {/* Social Icons */}
                            <div className="flex gap-3 pt-2">
                                {Object.entries(socialUrls).map(([key, url]) => {
                                    if (!url) return null;
                                    let Icon: React.ElementType | null = null;
                                    if (key === 'facebook') Icon = Facebook;
                                    else if (key === 'instagram') Icon = Instagram;
                                    else if (key === 'youtube') Icon = Youtube;
                                    else if (key === 'tiktok') Icon = Music2;
                                    
                                    if (!Icon) return null;
                                    
                                    return (
                                        <a
                                            key={key}
                                            href={url}
                                            aria-label={key}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white/70 border border-emerald-200/50 flex items-center justify-center text-emerald-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <Icon className="w-5 h-5 stroke-[1.5]" />
                                        </a>
                                    );
                                })}
                                <a
                                    href={`mailto:${supportEmail}`}
                                    aria-label="Email"
                                    className="w-10 h-10 rounded-full bg-white/70 border border-emerald-200/50 flex items-center justify-center text-emerald-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Mail className="w-5 h-5 stroke-[1.5]" />
                                </a>
                            </div>
                        </div>

                        {/* ── COL 2: Links (Desktop) ── */}
                        <div className="hidden lg:block">
                            <h4 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/80 mb-4">
                                {t("footer.company")}
                            </h4>
                            <ul className="space-y-2.5">
                                {linksList.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── COL 3: Categories (Desktop) ── */}
                        <div className="hidden lg:block">
                            <h4 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/80 mb-4">
                                {t("common.categories")}
                            </h4>
                            <ul className="space-y-2.5">
                                {categoriesList.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── COL 4: Contact + Payment (Desktop) ── */}
                        <div className="hidden lg:block space-y-5">
                            <div>
                                <h4 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/80 mb-4">
                                    {t("footer.contactUs")}
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <a href="https://maps.app.goo.gl/rhG6HVGDXcAwKb7E9" target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors">
                                            {supportAddress}
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <a href={`tel:${supportPhone.replace(/[^0-9+]/g, "")}`} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors">
                                            {supportPhone}
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <a href={`mailto:${supportEmail}`} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors truncate">
                                            {supportEmail}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Payment Methods — Real logos */}
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/50 mb-2.5">
                                    {t("footer.payment")}
                                </p>
                                <div className="grid grid-cols-2 gap-2.5 w-max">
                                    {PAYMENT_METHODS.map((p) => (
                                        <div key={p.label} title={p.label} className="w-[110px] h-[48px] bg-white rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                                            <div className="scale-110 origin-center flex justify-center">
                                                {p.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── MOBILE: Accordion for Col 2, 3, 4 ── */}
                        <div className="lg:hidden space-y-0 sm:col-span-1">
                            <MobileAccordion id="links" title={t("footer.company")}>
                                <ul className="space-y-2.5">
                                    {linksList.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </MobileAccordion>

                            <MobileAccordion id="categories" title={t("common.categories")}>
                                <ul className="space-y-2.5">
                                    {categoriesList.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </MobileAccordion>

                            <MobileAccordion id="contact" title={t("footer.contactUs")}>
                                <ul className="space-y-3 mb-4">
                                    <li className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <a href="https://maps.app.goo.gl/rhG6HVGDXcAwKb7E9" target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 transition-colors">
                                            {supportAddress}
                                        </a>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <a href={`tel:${supportPhone.replace(/[^0-9+]/g, "")}`} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900">{supportPhone}</a>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <a href={`mailto:${supportEmail}`} className="text-[13px] font-medium text-emerald-900/55 hover:text-emerald-900 truncate">{supportEmail}</a>
                                    </li>
                                </ul>
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-900/50 mb-2">
                                    {t("footer.payment")}
                                </p>
                                <div className="grid grid-cols-4 gap-1.5 w-full">
                                    {PAYMENT_METHODS.map((p) => (
                                        <div key={p.label} title={p.label} className="w-full h-[36px] bg-white rounded-md flex items-center justify-center border border-emerald-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                                            <div className="scale-[0.75] origin-center flex justify-center">
                                                {p.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </MobileAccordion>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════ COPYRIGHT BAR ═══════════ */}
            <div className="bg-[#DFF0E0] border-t border-emerald-200/60">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-[6%] py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-[12px] font-medium text-emerald-800/50">
                            © 2026 <span className="font-bold text-emerald-900/70">LIKEFOOD</span> by <span className="font-semibold">Trần Quốc Vũ</span>
                        </p>
                        <div className="flex items-center gap-3 flex-wrap justify-center text-[11px] text-emerald-800/50 font-medium">
                            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600/60" /><span>{t("footer.qualityStandard")}</span></div>
                            <div className="w-px h-3 bg-emerald-300/30" />
                            <div className="flex items-center gap-1"><Truck className="w-3 h-3 text-emerald-600/60" /><span>{t("footer.shipNationwide")}</span></div>
                            <div className="w-px h-3 bg-emerald-300/30" />
                            <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600/60" /><span>{t("footer.quickSupport")}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ GOOGLE MAPS — FULL WIDTH ═══════════ */}
            <div className="w-full">
                <iframe
                    title="LIKEFOOD location map"
                    src="https://maps.google.com/maps?cid=17525169677230232503&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-[220px] sm:h-[280px] md:h-[320px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </footer>
    );
}
