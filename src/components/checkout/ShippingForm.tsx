"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 *
 * ShippingForm – Contact & shipping information (SaaS-style redesign)
 */

import { Sparkles, ChevronRight, CheckCircle2, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CheckoutAddressSkeleton from "./CheckoutAddressSkeleton";
import VoucherAndPoints from "./VoucherAndPoints";
import type { CheckoutAddress, CheckoutFormData, CheckoutVoucher } from "@/hooks/useCheckout";
import {
    FREE_SHIPPING_THRESHOLD_USD,
    EXPRESS_SHIPPING_FEE_USD,
    OVERNIGHT_SHIPPING_FEE_USD,
    getShippingFeeUsd,
    STORE_ADDRESS as DEFAULT_STORE_ADDRESS,
    STORE_GOOGLE_MAPS_URL as DEFAULT_STORE_MAPS_URL,
} from "@/lib/commerce";

interface ShippingFormProps {
    language: string;
    t: (key: string) => string;
    formData: CheckoutFormData;
    updateField: (field: keyof CheckoutFormData, value: string) => void;
    saveInfo: boolean;
    setSaveInfo: (v: boolean) => void;
    isLoggedIn: boolean;
    addresses: CheckoutAddress[];
    isLoadingAddresses: boolean;
    selectedAddressId: number | null;
    selectAddress: (addr: CheckoutAddress) => void;
    selectedVoucher: CheckoutVoucher | null;
    setSelectedVoucher: (v: CheckoutVoucher | null) => void;
    showVoucherModal: boolean;
    setShowVoucherModal: (v: boolean) => void;
    userPoints: number;
    usePoints: boolean;
    pointsToUse: number;
    togglePoints: () => void;
    totalPrice: number;
    formErrors: Record<string, string>;
    onNext: () => void;
    isSubmitting?: boolean;
    paymentMethod: "STRIPE" | "MOMO" | "BANK" | "PICKUP";
    setPaymentMethod: (v: "STRIPE" | "MOMO" | "BANK" | "PICKUP") => void;
}

const inputBase =
    "w-full border rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";

const US_STATES = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida",
    "Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
    "Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska",
    "Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
    "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
    "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1">{msg}</p>;
}

export default function ShippingForm({
    language,
    t,
    formData,
    updateField,
    saveInfo,
    setSaveInfo,
    isLoggedIn,
    addresses,
    isLoadingAddresses,
    selectedAddressId,
    selectAddress,
    selectedVoucher,
    setSelectedVoucher,
    showVoucherModal,
    setShowVoucherModal,
    userPoints,
    usePoints,
    pointsToUse,
    togglePoints,
    totalPrice,
    formErrors,
    onNext,
    isSubmitting = false,
    paymentMethod,
    setPaymentMethod,
}: ShippingFormProps) {
    const vi = language === "vi";

    // Fetch dynamic store address from admin settings
    const [storeAddress, setStoreAddress] = useState(DEFAULT_STORE_ADDRESS);
    const [storeMapsUrl, setStoreMapsUrl] = useState(DEFAULT_STORE_MAPS_URL);
    useEffect(() => {
        fetch("/api/public/store-address")
            .then(res => res.json())
            .then(data => {
                if (data.address) setStoreAddress(data.address);
                if (data.mapsUrl) setStoreMapsUrl(data.mapsUrl);
            })
            .catch(() => {});
    }, []);

    const shippingMethods = [
        {
            id: "pickup",
            name: vi ? "Nhận tại cửa hàng" : "In-store Pickup",
            time: vi ? "Nhận hàng nhanh chóng" : "Quick collection",
            price: 0,
            free: true,
            estimatedDays: 0,
            isPickup: true,
        },
        {
            id: "standard",
            name: vi ? "Giao hàng tiêu chuẩn" : "Standard Shipping",
            time: vi ? "Từ 3-5 ngày" : "3-5 business days",
            price:
                totalPrice >= FREE_SHIPPING_THRESHOLD_USD
                    ? 0
                    : getShippingFeeUsd(totalPrice, "standard"),
            free: totalPrice >= FREE_SHIPPING_THRESHOLD_USD,
            estimatedDays: 4,
            isPickup: false,
        },
        {
            id: "express",
            name: vi ? "Giao hàng nhanh" : "Priority Express",
            time: vi ? "Từ 1-2 ngày" : "1-2 business days",
            price: EXPRESS_SHIPPING_FEE_USD,
            free: false,
            estimatedDays: 2,
            isPickup: false,
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">

            {/* Guest notice */}
            {!isLoggedIn && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-amber-50/50 border border-amber-100/50"
                >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs font-black text-amber-900 uppercase tracking-wider">
                            {vi ? "Chế độ khách hàng" : "Guest Checkout"}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-amber-700/70 font-medium mt-0.5 sm:mt-1 leading-relaxed">
                            {vi ? "Hãy nhập email để theo dõi đơn hàng dễ dàng hơn. " : "Enter your email to receive real-time order tracking. "}
                            <Link href="/login" className="text-amber-800 underline decoration-amber-300 underline-offset-2 font-bold hover:text-amber-900">
                                {vi ? "Đăng nhập ngay" : "Sign in now"}
                            </Link>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Saved addresses */}
            {isLoggedIn && (
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {vi ? "Địa chỉ giao hàng" : "Shipping address"}
                        </p>
                        <Link
                            href="/profile"
                            className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                        >
                            {vi ? "Thay đổi" : "Change"} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {isLoadingAddresses ? (
                        <CheckoutAddressSkeleton />
                    ) : (
                        <div className="grid gap-3">
                            {addresses.length > 0 ? (
                                addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        type="button"
                                        onClick={() => selectAddress(addr)}
                                        className={`group relative w-full text-left p-5 rounded-[22px] border-2 transition-all ${
                                            selectedAddressId === addr.id
                                                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                                : "border-slate-100 hover:border-slate-200 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                    selectedAddressId === addr.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                                }`}>
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {addr.fullName}
                                                        </p>
                                                        {addr.isDefault && (
                                                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-900 text-white">
                                                                {vi ? "Mặc định" : "Default"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                        {addr.address}<br/>
                                                        {addr.city}, {addr.state} {addr.zipCode}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-wide">{addr.phone}</p>
                                                </div>
                                            </div>
                                            <div className={`shrink-0 transition-all ${selectedAddressId === addr.id ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 text-center">
                                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-500">
                                        {vi ? "Chưa có địa chỉ nào" : "No saved addresses"}
                                    </p>
                                    <Link href="/profile" className="text-xs font-black text-primary uppercase tracking-widest mt-4 inline-block hover:underline decoration-2 underline-offset-4">
                                        {vi ? "+ Thêm ngay" : "+ Add new address"}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Contact Information Form ── */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            {vi ? "Tên người nhận" : "Recipient name"}
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => updateField("fullName", e.target.value)}
                            placeholder={vi ? "Nhập họ và tên..." : "e.g. John Doe"}
                            className={`${inputBase} ${formErrors.fullName ? "border-red-400 ring-4 ring-red-50" : ""}`}
                        />
                        <FieldError msg={formErrors.fullName} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="hello@example.com"
                            className={`${inputBase} ${formErrors.email ? "border-red-400 ring-4 ring-red-50" : ""}`}
                        />
                        <FieldError msg={formErrors.email} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">
                            {vi ? "Số điện thoại" : "Phone number"}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className={`${inputBase} ${formErrors.phone ? "border-red-400 ring-4 ring-red-50" : ""}`}
                        />
                        <FieldError msg={formErrors.phone} />
                    </div>
                </div>
            </div>

            {/* ── Street Address for Guests ── */}
            {formData.shippingMethod !== "pickup" && !selectedAddressId && (
                <div className="space-y-6 pt-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        {vi ? "Địa chỉ chi tiết" : "Full Address"}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-12">
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                placeholder={vi ? "Số nhà, tên đường..." : "123 Main St, Apt 4"}
                                className={inputBase}
                            />
                        </div>
                        <div className="sm:col-span-6">
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => updateField("city", e.target.value)}
                                placeholder={vi ? "Thành phố" : "City"}
                                className={inputBase}
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <select
                                value={formData.state || ""}
                                onChange={(e) => updateField("state", e.target.value)}
                                className={inputBase}
                            >
                                <option value="">ST</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => updateField("zipCode", e.target.value)}
                                placeholder="ZIP"
                                className={inputBase}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Rewards & Coupons ── */}
            <div className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100">
                <VoucherAndPoints
                    language={language}
                    t={t}
                    selectedVoucher={selectedVoucher}
                    setSelectedVoucher={setSelectedVoucher}
                    setShowVoucherModal={setShowVoucherModal}
                    userPoints={userPoints}
                    usePoints={usePoints}
                    pointsToUse={pointsToUse}
                    togglePoints={togglePoints}
                />
            </div>

            {/* ── Shipping Methods ── */}
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                    {vi ? "Dịch vụ vận chuyển" : "Delivery Service"}
                </p>
                <div className="grid gap-3">
                    {shippingMethods.map((method) => {
                        const isSelected = formData.shippingMethod === method.id;
                        return (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => updateField("shippingMethod", method.id)}
                                className={`group flex items-center justify-between p-5 rounded-[22px] border-2 transition-all text-left ${
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-slate-100 hover:border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        isSelected ? "border-primary" : "border-slate-200 group-hover:border-slate-300"
                                    }`}>
                                        {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            {method.isPickup && <MapPin className="w-3.5 h-3.5 text-primary" />}
                                            {method.name}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{method.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${method.free ? "text-emerald-500" : "text-slate-900"}`}>
                                        {method.free ? (vi ? "MIỄN PHÍ" : "FREE") : `$${method.price.toFixed(2)}`}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Payment Methods ── */}
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                    {vi ? "Phương thức thanh toán" : "Payment approach"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { id: "STRIPE", label: "Credit Card", icon: "💳", color: "from-[#635BFF] to-[#8f88ff]" },
                        { id: "MOMO", label: "Ví MoMo", icon: "💓", color: "from-[#A50064] to-[#d40080]" },
                        { id: "BANK", label: vi ? "Chuyển khoản" : "Bank Transfer", icon: "🏦", color: "from-blue-600 to-blue-400" },
                        { id: "COD", label: vi ? "Tiền mặt (COD)" : "Cash (COD)", icon: "🏠", color: "from-orange-500 to-amber-500" },
                    ].map((m) => {
                        const isSelected = paymentMethod === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={`group flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all text-left relative overflow-hidden ${
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-100 hover:border-slate-200 bg-white"
                                }`}
                            >
                                {isSelected && (
                                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${m.color} opacity-10 rounded-bl-[40px]`} />
                                )}
                                <div className="text-xl">{m.icon}</div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">{m.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        {isSelected ? (vi ? "Đang chọn" : "Selected") : (vi ? "Lựa chọn" : "Select")}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Submit Button ── */}
            <div className="pt-4">
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isSubmitting}
                    className={`w-full h-16 rounded-[22px] text-white font-[950] text-base uppercase tracking-[0.1em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] ${
                        paymentMethod === "STRIPE" ? "bg-[#635BFF] hover:bg-[#5347FE]" :
                        paymentMethod === "MOMO" ? "bg-[#A50064] hover:bg-[#8e0056]" :
                        "bg-slate-900 hover:bg-black"
                    }`}
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {paymentMethod === "STRIPE" 
                                ? (vi ? "Thanh toán Stripe Safe" : "Pay with Stripe Safe")
                                : (vi ? "Hoàn tất đặt hàng" : "Complete Purchase")}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
                     <Lock className="w-3 h-3" />
                     <span className="text-[10px] font-black uppercase tracking-widest">PCI DSS Compliant & End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
}
