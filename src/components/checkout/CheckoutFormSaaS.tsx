"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 *
 * CheckoutFormSaaS – Single-step checkout: fill address → pay with Stripe
 */

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ShippingForm from "./ShippingForm";

interface CheckoutFormSaaSProps {
    step: number;
    language: string;
    t: (key: string) => string;
    checkout: any;
}

export default function CheckoutFormSaaS({
    step,
    language,
    t,
    checkout,
}: CheckoutFormSaaSProps) {
    const vi = language === "vi";
    const isPickup = checkout.formData?.shippingMethod === "pickup";

    return (
        <div className="max-w-[580px] mx-auto px-4 py-8 sm:px-8 lg:py-10">

            {/* Header: Status and Brand Alignment */}
            <div className="flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-1.5">
                    <div className="h-[2px] rounded-full bg-primary w-12" />
                    <div className="h-[2px] rounded-full bg-slate-100 w-4 group-hover:bg-primary/30 transition-colors" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5 px-4 py-1.5 bg-white border border-slate-200/60 rounded-full shadow-sm"
                >
                    <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {checkout.paymentMethod === "STRIPE" ? (
                            isPickup
                                ? (vi ? "Nhận hàng • Stripe" : "Pickup • Stripe")
                                : (vi ? "Stripe / Checkout" : "Stripe Checkout")
                        ) : checkout.paymentMethod === "MOMO" ? (
                            vi ? "Ví MoMo" : "MoMo E-Wallet"
                        ) : checkout.paymentMethod === "COD" ? (
                            vi ? "Thanh toán khi nhận" : "Cash on Delivery"
                        ) : (
                            vi ? "Thanh toán VNPay" : "VNPay"
                        )}
                    </span>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key="checkout-body"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
                >
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {isPickup
                                ? (vi ? "Thông tin liên hệ" : "Contact Details")
                                : (vi ? "Thông tin giao hàng" : "Shipping Details")}
                        </h1>
                        <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-2">
                            <span className="text-primary font-bold mr-1">*</span>
                            {vi ? "Vui lòng nhập địa chỉ chính xác để giao hàng nhanh nhất." : "Please provide accurate details for prompt delivery."}
                        </p>
                    </div>

                    {/* The Core Form Component */}
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-1 sm:p-2">
                        <ShippingForm
                            language={language}
                            t={t}
                            formData={checkout.formData}
                            updateField={checkout.updateField}
                            saveInfo={checkout.saveInfo}
                            setSaveInfo={checkout.setSaveInfo}
                            isLoggedIn={!!checkout.session?.user}
                            addresses={checkout.addresses}
                            isLoadingAddresses={checkout.isLoadingAddresses}
                            selectedAddressId={checkout.selectedAddressId}
                            selectAddress={checkout.selectAddress}
                            selectedVoucher={checkout.selectedVoucher}
                            setSelectedVoucher={checkout.setSelectedVoucher}
                            showVoucherModal={checkout.showVoucherModal}
                            setShowVoucherModal={checkout.setShowVoucherModal}
                            userPoints={checkout.userPoints}
                            usePoints={checkout.usePoints}
                            pointsToUse={checkout.pointsToUse}
                            togglePoints={checkout.togglePoints}
                            totalPrice={checkout.totalPrice}
                            formErrors={checkout.formErrors}
                            onNext={checkout.handleOrder}
                            isSubmitting={checkout.isSubmitting}
                            paymentMethod={checkout.paymentMethod}
                            setPaymentMethod={checkout.setPaymentMethod}
                        />
                    </div>

                    {/* Order Notes Section: Elegant and Discrete */}
                    <div className="mt-8 group">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-focus-within:border-primary/30 group-focus-within:bg-primary/5 transition-all">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {vi ? "Yêu cầu đặc biệt" : "Special Requests"}
                            </span>
                        </div>
                        <div className="relative">
                            <textarea
                                value={checkout.orderNotes || ""}
                                onChange={(e) => checkout.setOrderNotes?.(e.target.value)}
                                placeholder={vi
                                    ? "Ghi chú cho shipper hoặc lời nhắn tặng quà..."
                                    : "Notes for delivery or a gift message..."}
                                rows={2}
                                maxLength={500}
                                className="w-full text-sm text-slate-700 placeholder:text-slate-300 bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 resize-none shadow-sm transition-all"
                            />
                            <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-300 uppercase">
                                {checkout.orderNotes?.length || 0} / 500
                            </div>
                        </div>
                    </div>

                    {/* Submitting Loading State: High-end Overlay */}
                    <AnimatePresence>
                        {checkout.isSubmitting && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="mt-8 flex items-center justify-center gap-4 py-6 bg-slate-900 rounded-[20px] shadow-2xl shadow-slate-900/40 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                                <span className="text-sm font-bold text-white relative z-10 tracking-wide">
                                    {checkout.paymentMethod === "STRIPE"
                                        ? (vi ? "Đang kết nối tới Stripe Secure..." : "Connecting to Stripe Secure...")
                                        : (vi ? "Hệ thống đang xử lý đơn hàng..." : "Optimizing your order data...")}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>

            {/* Footer Trust Bar: Clean and Minimal */}
            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {vi ? "Bảo mật tuyệt đối" : "Strictly Secure"}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium">SSL Encrypted • PCI Compliant</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-[10px] text-slate-300 font-medium text-center sm:text-right">
                        {vi
                            ? "Mọi giao dịch đều được bảo vệ bởi chương trình LIKEFOOD Trust"
                            : "Your purchase is protected by the LIKEFOOD Trust Guarantee"}
                    </p>
                </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width={32} height={12} className="h-4 w-auto" />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={28} height={12} className="h-5 w-auto" />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={48} height={12} className="h-4 w-auto" />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" width={40} height={12} className="h-4 w-auto" />
            </div>
        </div>
    );
}
