"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, QrCode, Copy, Check, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

interface PaymentInvoiceProps {
    orderId: number;
    amount: number;
    method: "MOMO" | "VNPAY";
    language: string;
}

export default function PaymentInvoice({ orderId, amount, method, language }: PaymentInvoiceProps) {
    const vi = language === "vi";
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [bankInfo, setBankInfo] = useState({ name: "", account: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                setIsLoading(true);
                // Convert USD to VND (approx 25000) for local payments
                const vndAmount = Math.round(amount * 25450); 
                const res = await fetch(`/api/payments/qr?type=${method}&amount=${vndAmount}&orderId=${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setQrCode(data.qrCode);
                    if (method === "VNPAY") {
                        setBankInfo({ name: data.bankName, account: data.bankAccount });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch QR code", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQR();
    }, [method, amount, orderId]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleConfirm = () => {
        setIsConfirmed(true);
        toast.success(vi 
            ? "Đã ghi nhận yêu cầu xác nhận thanh toán! Chúng tôi sẽ kiểm tra và cập nhật đơn hàng trong ít phút." 
            : "Payment confirmation request received! We will verify and update your order shortly."
        );
    };

    const paymentContent = `LIKEFOOD ${orderId}`;

    return (
        <div className="mt-8 space-y-6">
            <div className={`p-6 rounded-3xl border-2 transition-all ${
                method === "MOMO" ? "border-[#A50064] bg-[#A50064]/5" : "border-blue-500 bg-blue-50/50"
            }`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        method === "MOMO" ? "bg-[#A50064] text-white" : "bg-blue-600 text-white"
                    }`}>
                        {method === "MOMO" ? <QrCode className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {vi ? "Hướng dẫn thanh toán" : "Payment Instructions"}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {vi ? `Vui lòng chuyển khoản chính xác số tiền bên dưới` : "Please transfer the exact amount below"}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* QR Code Column */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 bg-white p-3 rounded-2xl shadow-xl ring-1 ring-slate-100 flex items-center justify-center">
                            {isLoading ? (
                                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary rounded-full animate-spin" />
                            ) : qrCode ? (
                                <Image src={qrCode} alt="Payment QR" width={180} height={180} className="rounded-lg" />
                            ) : (
                                <div className="text-xs text-slate-400">{vi ? "Lỗi tải mã QR" : "QR Error"}</div>
                            )}
                        </div>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Download className="w-3 h-3" />
                            {vi ? "Quét mã để thanh toán" : "Scan to pay"}
                        </p>
                    </div>

                    {/* Info Column */}
                    <div className="space-y-4">
                        {/* Amount */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {vi ? "Số tiền" : "Amount"}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-black text-slate-900">
                                    {method === "MOMO" || method === "VNPAY"
                                        ? `${(amount * 25450).toLocaleString()} VND` 
                                        : formatPrice(amount)}
                                </span>
                                <button onClick={() => handleCopy((amount * 25450).toString(), "amount")} className="p-1.5 hover:bg-slate-50 rounded-lg text-primary transition-colors">
                                    {copied === "amount" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Content / Reference */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {vi ? "Nội dung chuyển khoản" : "Reference Content"}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-primary font-mono">{paymentContent}</span>
                                <button onClick={() => handleCopy(paymentContent, "content")} className="p-1.5 hover:bg-slate-50 rounded-lg text-primary transition-colors">
                                    {copied === "content" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {method === "VNPAY" && (
                            <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {vi ? "Ngân hàng" : "Bank Info"}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-900">{bankInfo.name}</p>
                                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-tighter">
                                        {vi ? "Hỗ trợ tất cả ngân hàng" : "All banks supported"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm font-black text-slate-900 font-mono italic">{bankInfo.account}</span>
                                    <button onClick={() => handleCopy(bankInfo.account, "account")} className="p-1.5 hover:bg-slate-50 rounded-lg text-primary transition-colors">
                                        {copied === "account" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-white/50 border border-slate-100 italic">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        {vi 
                            ? "⚠️ Chú ý: Vui lòng nhập ĐÚNG nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng sau 1-3 phút. Nếu quá thời gian chưa thấy cập nhật, vui lòng liên hệ CSKH." 
                            : "⚠️ Important: Please enter the EXACT reference content for auto-confirmation (in 1-3 mins). Contact support if your order isn't confirmed."}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={handleConfirm}
                disabled={isConfirmed}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                    isConfirmed 
                        ? "bg-emerald-500 text-white cursor-default shadow-emerald-500/20" 
                        : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
                }`}
            >
                 {isConfirmed 
                    ? (vi ? "Đã gửi thông báo" : "Notification sent")
                    : (vi ? "Tôi đã chuyển khoản" : "I have transferred the money")}
                 <Check className="w-4 h-4" />
            </button>
        </div>
    );
}
