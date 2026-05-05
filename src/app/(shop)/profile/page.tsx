"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
 Loader2, Package, Sparkles, Ticket,
 LayoutDashboard, ChevronRight, RefreshCw, MapPin,
 Bell, Lock, Heart, User, Camera, Trash2, Mail, Phone, Edit, UserPlus, Wallet, History
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import {
 AddressList,
 AddressForm,
 NotificationSettings,
 PriceAlertList,
 SecuritySection
} from "@/components/profile";
import DepositModal from "@/components/profile/DepositModal";
import WalletOverview from "@/components/profile/WalletOverview";

interface Address {
 id: number;
 fullName: string;
 phone: string;
 address: string;
 city: string;
 state?: string | null;
 zipCode: string;
 country: string;
 isDefault: boolean;
}

type Tab = "overview" | "addresses" | "notifications" | "security" | "wallet";

export default function ProfilePage() {
 const { language } = useLanguage();
 const { data: session, status: sessionStatus, update } = useSession();
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<Tab>("overview");
 const [isEditing, setIsEditing] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
 const [addresses, setAddresses] = useState<Address[]>([]);
 const [showAddressForm, setShowAddressForm] = useState(false);
 const [editingAddress, setEditingAddress] = useState<Address | null>(null);
 const [orderCount, setOrderCount] = useState(0);
 const [voucherCount, setVoucherCount] = useState(0);
 const [userPoints, setUserPoints] = useState(0);
 const [userBalance, setUserBalance] = useState(0);
 const [transactions, setTransactions] = useState([]);
 const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

 // Initialize tab from URL if present
 useEffect(() => {
  if (typeof window !== "undefined") {
   const params = new URLSearchParams(window.location.search);
   const tab = params.get("tab") as Tab;
   if (tab && ["overview", "addresses", "notifications", "security", "wallet"].includes(tab)) {
    setActiveTab(tab);
   }
  }
 }, []);

 const [profileData, setProfileData] = useState({
  name: "",
  phone: "",
  image: "",
 });
 const [notificationPrefs, setNotificationPrefs] = useState({
  email: true,
  inApp: true,
 });
 const [priceAlerts, setPriceAlerts] = useState<Array<{
  productId: number;
  productSlug?: string;
  productName: string;
  productImage?: string;
  originalPrice: number;
  currentPrice: number;
  dropPercent: number;
 }>>([]);

 const profileT = (_key: string, viText: string, enText: string) => {
  return language === "vi" ? viText : enText;
 };

 useEffect(() => {
  if (sessionStatus === "unauthenticated") {
   router.push("/login?callbackUrl=/profile");
   return;
  }

  if (sessionStatus === "authenticated" && session) {
   setProfileData({
    name: session.user.name || "",
    phone: "",
    image: session.user.image || "",
   });

   Promise.all([
    fetchProfile(),
    fetchAddresses(),
    fetchPriceAlerts(),
    fetchPoints(),
    fetchBalance(),
    fetchOrderCount(),
    fetchVoucherCount(),
    fetchTransactions(),
   ]);

   const savedPrefs = localStorage.getItem("notification_preferences");
   if (savedPrefs) {
    try {
     setNotificationPrefs(JSON.parse(savedPrefs));
    } catch { /* ignore */ }
   }
  }
 }, [sessionStatus, session, router]);

 const fetchProfile = async () => {
  try {
   const res = await fetch("/api/user/profile");
   if (res.ok) {
    const data = await res.json();
    setProfileData({
     name: data.name || "",
     phone: data.phone || "",
     image: data.image || "",
    });
   }
  } catch { /* silent */ }
 };

 const fetchAddresses = async () => {
  try {
   const res = await fetch("/api/user/addresses");
   if (res.ok) {
    const data = await res.json();
    setAddresses(data);
   }
  } catch { /* silent */ }
 };

 const fetchPriceAlerts = async () => {
  try {
   const res = await fetch("/api/user/price-alerts");
   if (res.ok) {
    const data = await res.json();
    setPriceAlerts(data.alerts || []);
   }
  } catch { /* silent */ }
 };

 const fetchPoints = async () => {
  try {
   const res = await fetch("/api/user/points");
   if (res.ok) {
    const data = await res.json();
    setUserPoints(data.points || 0);
   }
  } catch { /* silent */ }
 };

 const fetchBalance = async () => {
  try {
   const res = await fetch("/api/user/balance");
   if (res.ok) {
    const data = await res.json();
    setUserBalance(data.balance || 0);
   }
  } catch { /* silent */ }
 };

 const fetchTransactions = async () => {
  try {
   const res = await fetch("/api/user/transactions");
   if (res.ok) {
    const data = await res.json();
    setTransactions(data.transactions || []);
   }
  } catch { /* silent */ }
 };

 const fetchOrderCount = async () => {
  try {
   const res = await fetch("/api/user/orders?limit=1");
   if (res.ok) {
    const data = await res.json();
    setOrderCount(data.total || data.orders?.length || 0);
   }
  } catch { /* ignore */ }
 };

 const fetchVoucherCount = async () => {
  try {
   const res = await fetch("/api/user/vouchers");
   if (res.ok) {
    const data = await res.json();
    setVoucherCount(Array.isArray(data) ? data.length : (data.vouchers?.length || 0));
   }
  } catch { /* ignore */ }
 };

 const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setIsUploadingAvatar(true);
  try {
   const formData = new FormData();
   formData.append("file", file);
   const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
   if (res.ok) {
    const data = await res.json();
    setProfileData(p => ({ ...p, image: data.image }));
    if (session?.user) {
     await update({ user: { ...session.user, image: data.image } });
    }
    toast.success(profileT("avatarUpdated", "Cập nhật ảnh đại diện thành công", "Avatar updated successfully"));
    fetchProfile();
   } else {
    const err = await res.json();
    toast.error(err.error || profileT("uploadAvatarFailed", "Tải ảnh đại diện thất bại", "Failed to upload avatar"));
   }
  } catch { toast.error(profileT("uploadAvatarFailed", "Tải ảnh đại diện thất bại", "Failed to upload avatar")); }
  finally { setIsUploadingAvatar(false); }
 };

 const handleAvatarDelete = async () => {
  if (!confirm(profileT("deleteAvatarConfirm", "Bạn có chắc muốn xóa ảnh đại diện không?", "Are you sure you want to delete your avatar?"))) return;
  try {
   await fetch("/api/user/avatar", { method: "DELETE" });
   setProfileData(p => ({ ...p, image: "" }));
   if (session?.user) await update({ user: { ...session.user, image: null } });
   fetchProfile();
  } catch { /* ignore */ }
 };

 const handleSaveProfile = async () => {
  setIsLoading(true);
  try {
   const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
   });

   if (res.ok) {
    setIsEditing(false);
    await fetchProfile();
    toast.success(profileT("profileUpdated", "Cập nhật hồ sơ thành công", "Profile updated successfully"));
   } else {
    const err = await res.json().catch(() => ({}));
    toast.error(err.error || profileT("profileUpdateFailed", "Cập nhật hồ sơ thất bại", "Failed to update profile"));
   }
  } catch {
   toast.error(profileT("connectionError", "Lỗi kết nối", "Connection error"));
  } finally {
   setIsLoading(false);
  }
 };

 const handleNotificationPrefChange = (key: "email" | "inApp", value: boolean) => {
  const newPrefs = { ...notificationPrefs, [key]: value };
  setNotificationPrefs(newPrefs);
  localStorage.setItem("notification_preferences", JSON.stringify(newPrefs));
 };

 const handleSaveAddress = async (addressData: Partial<Address>) => {
  setIsLoading(true);
  try {
   const url = editingAddress
    ? `/api/user/addresses/${editingAddress.id}`
    : "/api/user/addresses";
   const method = editingAddress ? "PUT" : "POST";

   const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
   });

   if (res.ok) {
    setShowAddressForm(false);
    setEditingAddress(null);
    await fetchAddresses();
   }
  } catch {
   toast.error(profileT("saveAddressFailed", "Lưu địa chỉ thất bại", "Failed to save address"));
  } finally {
   setIsLoading(false);
  }
 };

 const handleDeleteAddress = async (id: string) => {
  if (!confirm(profileT("deleteAddressConfirm", "Bạn có chắc muốn xóa địa chỉ này không?", "Are you sure you want to delete this address?"))) return;

  try {
   const res = await fetch(`/api/user/addresses/${id}`, {
    method: "DELETE",
   });

   if (res.ok) {
    await fetchAddresses();
   }
  } catch {
   toast.error(profileT("deleteAddressFailed", "Xóa địa chỉ thất bại", "Failed to delete address"));
  }
 };

 if (sessionStatus === "loading") {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
   </div>
  );
 }

 if (!session) return null;

 const sidebarNav: { id: Tab; label: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Tổng quan", labelEn: "Overview", icon: <User className="w-4 h-4" /> },
  { id: "wallet", label: "Ví - Giao dịch", labelEn: "Wallet & Tx", icon: <Wallet className="w-4 h-4" /> },
  { id: "addresses", label: "Địa chỉ", labelEn: "Addresses", icon: <MapPin className="w-4 h-4" /> },
  { id: "notifications", label: "Thông báo", labelEn: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "Bảo mật", labelEn: "Security", icon: <Lock className="w-4 h-4" /> },
 ];

 const quickLinks = [
  {
   href: "/profile/orders",
   label: profileT("orders", "Đơn hàng", "Orders"),
   desc: profileT("orderHistory", "Lịch sử đơn hàng", "Order history"),
   icon: <Package className="w-6 h-6" />,
   color: "bg-orange-50 text-orange-500",
   badge: orderCount > 0 ? orderCount : null,
  },
  {
   href: "/profile/wishlist",
   label: profileT("wishlist", "Yêu thích", "Wishlist"),
   desc: profileT("savedProducts", "Sản phẩm đã lưu", "Saved products"),
   icon: <Heart className="w-6 h-6" />,
   color: "bg-red-50 text-red-500",
   badge: null,
  },
  {
   href: "/profile/referrals",
   label: profileT("referAndEarn", "Giới thiệu nhận thưởng", "Refer and earn"),
   desc: profileT("inviteFriends", "Mời bạn bè", "Invite friends"),
   icon: <UserPlus className="w-6 h-6" />,
   color: "bg-emerald-50 text-emerald-500",
   badge: null,
  },
  {
   href: "/profile/points",
   label: "LIKEFOOD Xu",
   desc: `${userPoints.toLocaleString()} Xu`,
   icon: <Sparkles className="w-6 h-6" />,
   color: "bg-amber-50 text-amber-500",
   badge: null,
  },
  {
   href: "#",
   label: profileT("wallet", "Ví Likefood", "Likefood Wallet"),
   desc: `${userBalance.toLocaleString()} VND`,
   icon: <Wallet className="w-6 h-6" />,
   color: "bg-indigo-50 text-indigo-500",
   badge: null,
   onClick: () => setActiveTab("wallet"),
  },
  {
   href: "/profile/vouchers",
   label: profileT("myVouchers", "Voucher của tôi", "My vouchers"),
   desc: `${voucherCount} Voucher`,
   icon: <Ticket className="w-6 h-6" />,
   color: "bg-violet-50 text-violet-500",
   badge: voucherCount > 0 ? voucherCount : null,
  },
  ...(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" ? [{
   href: "/admin/dashboard",
   label: profileT("admin", "Quản trị viên", "Admin"),
   desc: profileT("storeManagement", "Quản lý cửa hàng", "Store management"),
   icon: <LayoutDashboard className="w-6 h-6" />,
   color: "bg-emerald-50 text-emerald-500",
   badge: null,
  }] : []),
 ];

 return (
  <div className="min-h-screen bg-white pb-20 lg:pb-16">
   <div className="bg-white border-b border-slate-100 relative overflow-hidden">
    <div className="w-full px-4 sm:px-6 lg:px-[8%] py-4 sm:py-6">
     <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
      <div className="relative group shrink-0">
       <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-slate-50 border border-slate-200 ring-4 ring-white/40 overflow-hidden flex items-center justify-center text-slate-900 shadow-2xl">
        {profileData.image ? (
         <Image src={profileData.image} alt={session.user.name || "Avatar"} width={112} height={112} className="w-full h-full object-cover" unoptimized />
        ) : (
         <User className="w-10 h-10 sm:w-14 sm:h-14" />
        )}
       </div>
       <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
        {isUploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
       </label>
      </div>
      <div className="flex-1 text-slate-900 text-center sm:text-left pb-1">
       <div>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
         <h1 className="text-xl sm:text-2xl font-black tracking-tight">{session.user.name || "Customer"}</h1>
         <span className="text-[10px] font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
          {session.user.role === "ADMIN" ? "Admin" : "Member"}
         </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{session.user.email}</p>
       </div>
      </div>
     </div>

     {/* Short Stats */}
     <div className="grid grid-cols-3 gap-3 mt-8">
       <div className="bg-slate-50 p-4 rounded-2xl text-center">
         <p className="text-xl font-black">{orderCount}</p>
         <p className="text-[10px] uppercase font-bold text-slate-400">Orders</p>
       </div>
       <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-100">
         <p className="text-xl font-black text-amber-600">{userPoints.toLocaleString()}</p>
         <p className="text-[10px] uppercase font-bold text-amber-400/80">Points</p>
       </div>
       <div className="bg-indigo-50 p-4 rounded-2xl text-center border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab("wallet")}>
         <p className="text-xl font-black text-indigo-600">{userBalance.toLocaleString()}</p>
         <p className="text-[10px] uppercase font-bold text-indigo-400/80">VND Balance</p>
       </div>
     </div>
    </div>
   </div>

   <div className="w-full px-4 sm:px-6 lg:px-[8%] mt-8">
    <div className="flex flex-col lg:flex-row gap-6">
     <aside className="w-full lg:w-64 shrink-0">
      <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
       {sidebarNav.map((item) => (
        <button
         key={item.id}
         onClick={() => setActiveTab(item.id)}
         className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === item.id ? "bg-primary text-slate-900 shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
        >
         {item.icon} {language === "vi" ? item.label : item.labelEn}
        </button>
       ))}
      </nav>
     </aside>

     <main className="flex-1 min-w-0">
      <AnimatePresence mode="wait">
       {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
         {quickLinks.map((link) => (
          <div key={link.label} onClick={() => link.onClick ? link.onClick() : router.push(link.href)} className="group bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-primary/20">
           <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-slate-900 transition-all">
            {link.icon}
           </div>
           <p className="font-black text-slate-900 mb-1">{link.label}</p>
           <p className="text-xs text-slate-400 font-medium">{link.desc}</p>
          </div>
         ))}
        </motion.div>
       )}

       {activeTab === "wallet" && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
           <WalletOverview balance={userBalance} transactions={transactions} onDeposit={() => setIsDepositModalOpen(true)} />
         </motion.div>
       )}

       {activeTab === "addresses" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
         <AddressList addresses={addresses} isLoading={isLoading} showAddressForm={showAddressForm} editingAddress={editingAddress} onShowForm={setShowAddressForm} onEditAddress={setEditingAddress} onSave={handleSaveAddress} onDelete={handleDeleteAddress} />
        </motion.div>
       )}
       
       {activeTab === "notifications" && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
           <NotificationSettings notificationPrefs={notificationPrefs} onPrefChange={handleNotificationPrefChange} />
         </motion.div>
       )}

       {activeTab === "security" && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
           <SecuritySection session={session} />
         </motion.div>
       )}
      </AnimatePresence>
     </main>
    </div>
   </div>

   <AnimatePresence>
    {showAddressForm && (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
       <AddressForm address={editingAddress} onSave={handleSaveAddress} onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }} isLoading={isLoading} />
      </motion.div>
     </div>
    )}
   </AnimatePresence>

   <DepositModal isOpen={isDepositModalOpen} onClose={() => { setIsDepositModalOpen(false); fetchBalance(); }} userId={Number(session.user.id)} language={language} />
  </div>
 );
}
