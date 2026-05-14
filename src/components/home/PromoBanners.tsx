import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Tag } from "lucide-react";

export default function PromoBanners() {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      {/* Promo 1 */}
      <Link
        href="/flash-sale"
        className="relative flex-1 rounded-xl overflow-hidden shadow-sm group block h-full"
      >
        <div className="absolute inset-0">
          <Image
            src="/traicaysay.jpeg"
            alt="Freeship promotion"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-800/40" />
        </div>
        <div className="relative h-full flex flex-col justify-center p-5 sm:p-6 text-white z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Truck className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium uppercase tracking-wider text-green-300">Giao Hàng Siêu Tốc</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-2">Miễn Phí Vận Chuyển</h3>
          <p className="text-sm opacity-90 mb-4 max-w-[200px]">Cho mọi đơn hàng từ $500 trên toàn nước Mỹ.</p>
          <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold hover:text-green-300 transition-colors">
            Mua sắm ngay <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Promo 2 */}
      <Link
        href="/vouchers"
        className="relative flex-1 rounded-xl overflow-hidden shadow-sm group block h-full"
      >
        <div className="absolute inset-0">
          <Image
            src="/cakho.jpeg"
            alt="Discount voucher"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 to-amber-800/40" />
        </div>
        <div className="relative h-full flex flex-col justify-center p-5 sm:p-6 text-white z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Tag className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-medium uppercase tracking-wider text-amber-300">Ưu Đãi Đặc Biệt</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-2">Giảm Đến 20%</h3>
          <p className="text-sm opacity-90 mb-4 max-w-[200px]">Áp dụng cho hải sản khô và các loại mắm.</p>
          <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold hover:text-amber-300 transition-colors">
            Lấy mã ngay <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}
