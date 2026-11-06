"use client";

/**
 * LIKEFOOD - Admin Refund & Returns Management
 * Enterprise Dark Style
 */

import { useCallback, useEffect, useState } from "react";
import {
  RotateCcw, CheckCircle2, XCircle, Clock,
  RefreshCw, DollarSign, AlertCircle, Eye,
  MessageSquare, Loader2, Check, X, Building
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { AdminCard, AdminPageContainer, AdminTableContainer } from "@/components/admin/AdminPageContainer";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface RefundItem {
  id: number;
  orderId: number;
  reason: string;
  amount: number;
  status: string;
  adminNote?: string | null;
  refundMethod?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone?: string | null;
  };
  order: {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    orderItems: Array<{
      id: number;
      quantity: number;
      price: number;
      product: {
        id: number;
        name: string;
        image?: string | null;
      };
    }>;
  };
}

const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Đã hoàn tiền" },
  { value: "REJECTED", label: "Đã từ chối" },
];

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Note modal / inline note state
  const [activeModalRefund, setActiveModalRefund] = useState<RefundItem | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/refunds?page=${page}&status=${statusFilter}`);
      if (!res.ok) throw new Error("Không thể tải danh sách đổi trả");
      const data = await res.json();
      setRefunds(data.refunds || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  const updateRefundStatus = async (id: number, nextStatus: string, note?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, adminNote: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không thể cập nhật trạng thái");
      }
      toast.success(`Đã cập nhật trạng thái: ${nextStatus}`);
      setActiveModalRefund(null);
      void loadRefunds();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    pending: refunds.filter(r => r.status === "PENDING").length,
    approved: refunds.filter(r => r.status === "APPROVED").length,
    completed: refunds.filter(r => r.status === "COMPLETED").length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.status !== "REJECTED" ? r.amount : 0), 0),
  };

  return (
    <AdminPageContainer
      title="Quản lý Đổi / Trả Hàng & Hoàn Tiền"
      subtitle="Xem xét, duyệt hoặc từ chối các yêu cầu khiếu nại, hoàn tiền từ khách hàng."
      action={
        <button
          onClick={() => void loadRefunds()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      }
    >
      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <AdminCard className="p-5 border-zinc-800 bg-zinc-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Yêu cầu chờ duyệt</p>
          <p className="mt-2 text-2xl font-black text-amber-400">{stats.pending}</p>
        </AdminCard>
        <AdminCard className="p-5 border-zinc-800 bg-zinc-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Đã duyệt (Chờ hoàn)</p>
          <p className="mt-2 text-2xl font-black text-blue-400">{stats.approved}</p>
        </AdminCard>
        <AdminCard className="p-5 border-zinc-800 bg-zinc-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Đã hoàn thành</p>
          <p className="mt-2 text-2xl font-black text-emerald-400">{stats.completed}</p>
        </AdminCard>
        <AdminCard className="p-5 border-zinc-800 bg-zinc-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Tổng tiền hoàn</p>
          <p className="mt-2 text-2xl font-black text-zinc-100">{formatPrice(stats.totalAmount)}</p>
        </AdminCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${statusFilter === f.value
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <AdminTableContainer>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-4">Mã / Ngày</th>
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4">Đơn hàng / Món</th>
              <th className="px-5 py-4">Lý do & Số tiền</th>
              <th className="px-5 py-4">Nhận tiền qua</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400 mb-2" />
                  Đang tải dữ liệu khiếu nại & hoàn tiền...
                </td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-zinc-500">
                  <RotateCcw className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
                  Không có yêu cầu đổi trả nào trong mục này.
                </td>
              </tr>
            ) : (
              refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono font-bold text-zinc-200">#{refund.id}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {new Date(refund.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-zinc-200">{refund.user?.name || "Khách hàng"}</p>
                    <p className="text-[11px] text-zinc-400">{refund.user?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`/admin/orders/${refund.orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      Đơn #{refund.orderId}
                    </a>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {refund.order?.orderItems?.length || 0} sản phẩm
                    </p>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="font-extrabold text-emerald-400 text-sm">{formatPrice(refund.amount)}</p>
                    <p className="text-zinc-400 mt-1 line-clamp-2 italic bg-zinc-900/50 p-1.5 rounded border border-zinc-800/50">
                      "{refund.reason}"
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {refund.bankAccount ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400">
                          <Building className="w-3 h-3" /> {refund.bankName || "Ngân hàng"}
                        </span>
                        <p className="font-mono font-semibold text-zinc-300">{refund.bankAccount}</p>
                      </div>
                    ) : (
                      <span className="text-zinc-400">Phương thức gốc (Stripe/COD)</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <RefundBadge status={refund.status} />
                    {refund.adminNote && (
                      <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[130px]" title={refund.adminNote}>
                        Ghi chú: {refund.adminNote}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {refund.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateRefundStatus(refund.id, "APPROVED")}
                            disabled={updatingId === refund.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-[11px] font-bold"
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setActiveModalRefund(refund);
                              setNoteInput(refund.adminNote || "");
                            }}
                            disabled={updatingId === refund.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold"
                          >
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </>
                      )}
                      {refund.status === "APPROVED" && (
                        <button
                          onClick={() => updateRefundStatus(refund.id, "COMPLETED")}
                          disabled={updatingId === refund.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất tiền
                        </button>
                      )}
                      {(refund.status === "COMPLETED" || refund.status === "REJECTED") && (
                        <span className="text-[11px] text-zinc-500">Đã xong</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <AdminPagination page={page} setPage={setPage} pageSize={15} total={total} itemLabel="yêu cầu" />
      </AdminTableContainer>

      {/* Reject/Note Modal */}
      {activeModalRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111113] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Từ chối yêu cầu đổi/trả #{activeModalRefund.id}
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Vui lòng nhập lý do từ chối để thông báo cho khách hàng:
            </p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ví dụ: Sản phẩm đã quá hạn 7 ngày đổi trả hoặc không có lỗi từ nhà sản xuất..."
              rows={3}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 outline-none focus:border-red-500"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModalRefund(null)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Hủy
              </button>
              <button
                onClick={() => updateRefundStatus(activeModalRefund.id, "REJECTED", noteInput)}
                disabled={updatingId === activeModalRefund.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700 flex items-center gap-1.5"
              >
                {updatingId === activeModalRefund.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageContainer>
  );
}

function RefundBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; style: string }> = {
    PENDING: { label: "Chờ duyệt", style: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    APPROVED: { label: "Đã duyệt", style: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    PROCESSING: { label: "Đang xử lý", style: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    COMPLETED: { label: "Đã hoàn tất", style: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    REJECTED: { label: "Đã từ chối", style: "bg-red-500/15 text-red-400 border-red-500/30" },
  };

  const item = map[status] || { label: status, style: "bg-zinc-700/30 text-zinc-400 border-zinc-700" };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.style}`}>
      {item.label}
    </span>
  );
}

