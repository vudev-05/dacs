"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    language: string;
}

export default function DepositModal({ isOpen, onClose, userId, language }: DepositModalProps) {
    const vi = language === "vi";
    const [amount, setAmount] = useState<number>(100000);
    const [method, setMethod] = useState<"BANK" | "MOMO">("BANK");
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateQR = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/payments/qr?type=${method}&amount=${amount}&orderId=NAP ${userId}`);
            if (res.ok) {
                const data = await res.json();
                setQrCode(data.qrCode);
                setStep(2);
            } else {
                toast.error(vi ? "Lỗi tạo mã QR" : "Failed to generate QR");
            }
        } catch (err) {
            toast.error(vi ? "Lỗi kết nối" : "Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    const paymentContent = `LIKEFOOD NAP ${userId}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative"
                    >
                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                                {vi ? "Nạp tiền vào ví" : "Top-up Wallet"}
                            </h2>
                            <p className="text-sm text-slate-500 mb-8">
                                {vi ? "Nạp tiền để thanh toán nhanh chóng hơn" : "Deposit funds for faster checkout"}
                            </p>

                            {step === 1 ? (
                                <div className="space-y-6">
                                    {/* Amount input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            {vi ? "Số tiền nạp (VND)" : "Amount (VND)"}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full text-2xl font-black px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none transition-all"
                                                placeholder="50.000"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 cursor-default uppercase">VND</span>
                                        </div>
                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                                            {[50000, 100000, 200000, 500000].map((val) => (
                                                <button 
                                                    key={val}
                                                    onClick={() => setAmount(val)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                                        amount === val ? "bg-primary text-slate-900" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {val.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Method selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            {vi ? "Phương thức nạp" : "Payment Method"}
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => setMethod("BANK")}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                                    method === "BANK" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200"
                                                }`}
                                            >
                                                <CreditCard className={`w-6 h-6 ${method === "BANK" ? "text-blue-500" : "text-slate-400"}`} />
                                                <span className="text-xs font-bold text-slate-900">{vi ? "Ngân hàng" : "Bank Transfer"}</span>
                                            </button>
                                            <button 
                                                onClick={() => setMethod("MOMO")}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                                    method === "MOMO" ? "border-[#A50064] bg-[#A50064]/5" : "border-slate-100 hover:border-slate-200"
                                                }`}
                                            >
                                                <QrCode className={`w-6 h-6 ${method === "MOMO" ? "text-[#A50064]" : "text-slate-400"}`} />
                                                <span className="text-xs font-bold text-slate-900">Ví MoMo</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerateQR}
                                        disabled={isLoading || amount < 10000}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (vi ? "Tiếp tục" : "Continue")}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl ring-1 ring-slate-100 flex items-center justify-center mb-6">
                                             {qrCode && <Image src={qrCode} alt="Payment QR" width={180} height={180} className="rounded-lg" />}
                                        </div>
                                        
                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vi ? "Số tiền" : "Amount"}</span>
                                                <span className="text-lg font-black text-slate-900">{amount.toLocaleString()} VND</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vi ? "Nội dung" : "Content"}</span>
                                                <span className="text-sm font-black text-primary uppercase font-mono tracking-wider">{paymentContent}</span>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                                            <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <p className="text-xs text-emerald-700 leading-relaxed italic">
                                                {vi 
                                                    ? "Vui lòng nhập ĐÚNG nội dung để tiền được nạp vào tài khoản tự động sau 1-3 phút." 
                                                    : "Please enter the EXACT reference content for auto-deposit (1-3 mins)."}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => setStep(1)}
                                            className="mt-8 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            {vi ? "Quay lại" : "Back"}
                                        </button>
                                        
                                        <button 
                                            onClick={onClose}
                                            className="mt-3 w-full py-4 bg-primary text-slate-900 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {vi ? "Tôi đã nạp tiền" : "Done"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
