"use client";

/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, ArrowRight, Loader2, Search, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import ImageWithFallback from "@/components/shared/ImageWithFallback";

interface Post {
 id: number;
 title: string;
 slug: string;
 summary?: string;
 image?: string;
 authorName?: string;
 category?: string;
 publishedAt: string;
 content?: string; // For read time calculation
}

export default function PostsPage() {
 const { t, language } = useLanguage();
 const isVi = language === "vi";
 const CATEGORIES = [
 t("shop.postCatAll"),
 t("shop.postCatGuide"),
 t("shop.postCatNews"),
 t("shop.postCatHiring"),
 t("shop.postCatPromo"),
 ];
 const [posts, setPosts] = useState<Post[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedCategory, setSelectedCategory] = useState(t("shop.postCatAll"));

 useEffect(() => {
 const fetchPosts = async () => {
 setIsLoading(true);
 try {
 const res = await fetch(`/api/posts?limit=1000`);
 const data = await res.json();
 setPosts(data.posts || []);
 } catch (error) {
 console.error("Fetch posts error:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchPosts();
 }, []);

 const filteredPosts = useMemo(() => {
 return posts.filter(post => {
 const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 post.summary?.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesCategory = selectedCategory === t("shop.postCatAll") || post.category === selectedCategory;
 return matchesSearch && matchesCategory;
 });
 }, [posts, searchQuery, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

 return (
 <>

      <div className="min-h-screen bg-white pb-20 ">
 {/* Fresh Food Hero Section */}
 <div className="relative bg-white pt-3 pb-6 sm:pt-4 sm:pb-8 px-4 overflow-hidden border-b border-slate-100">
 <div className="w-full relative z-10">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center space-y-6"
 >
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-xs font-semibold uppercase tracking-widest  shadow-sm">
 <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
 <span>{language === "vi" ? "Khám phá tri thức ẩm thực" : "Explore culinary knowledge"}</span>
 </div>

 <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
 {language === "vi" ? "Bài Viết &" : "Articles &"} <span className="text-emerald-600">{language === "vi" ? "Cẩm Nang" : "Guides"}</span>
 </h1>

 <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
 {t("shop.postsSubtitle")}
 </p>

 {/* Search Bar */}
 <div className="max-w-2xl mx-auto relative mt-4 sm:mt-8">
 <div className="relative group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
 <input
 type="text"
 placeholder={language === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white border-2 border-transparent focus:border-emerald-500 text-slate-900 pl-14 pr-6 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-400 shadow-xl"
 />
 </div>
 </div>
 </motion.div>
 </div>
 </div>

 <div className="w-full mx-auto px-4 sm:px-6 lg:px-[6%] -mt-4 relative z-20">
 {/* Category Tabs */}
 <div className="flex items-center justify-start sm:justify-center gap-2 md:gap-3 mb-8 sm:mb-12 overflow-x-auto scrollbar-hide pb-1">
 {CATEGORIES.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-4 sm:px-5 md:px-7 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wide transition-all shadow-sm whitespace-nowrap shrink-0 ${selectedCategory === cat
 ? "bg-emerald-500 text-white shadow-emerald-600/30 border-emerald-600"
 : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>

 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100">
 <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
 <p className="text-slate-500 font-semibold tracking-wide text-sm">{language === "vi" ? "Đang tải bài viết..." : "Loading articles..."}</p>
 </div>
 ) : filteredPosts.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white rounded-3xl py-24 px-8 text-center shadow-sm border border-slate-100"
 >
 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
 <Search className="w-8 h-8 text-slate-300" />
 </div>
 <h2 className="text-2xl font-bold text-slate-900 mb-3">{language === "vi" ? "Không tìm thấy kết quả" : "No results found"}</h2>
 <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
 {language === "vi"
 ? `Rất tiếc, chúng tôi không tìm thấy bài viết nào khớp với từ khóa "${searchQuery}" trong danh mục "${selectedCategory}".`
 : `Sorry, we couldn't find any articles matching "${searchQuery}" in the "${selectedCategory}" category.`
 }
 </p>
 <button
 onClick={() => { setSearchQuery(""); setSelectedCategory(t("shop.postCatAll")); }}
 className="bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md mt-2"
 >
 {t("shop.clearAll")}
 </button>
 </motion.div>
 ) : (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
 <AnimatePresence mode="popLayout">
 {filteredPosts.map((post, idx) => (
 <motion.div
 key={post.id}
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.3, delay: idx * 0.05 }}
 >
 <Link
 href={`/posts/${post.slug}`}
 className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full"
 >
 <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
 {post.image ? (
 <ImageWithFallback
 src={post.image}
 fallbackSrc="/images/placeholder.jpg"
 alt={post.title}
 fill
 className="object-cover group-hover:scale-105 transition-transform duration-500"
 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <Image src="/logo.png" alt="Logo" width={100} height={40} className="opacity-20" />
 </div>
 )}
 <div className="absolute top-4 left-4">
 <span className="bg-white/95  text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-slate-100/50">
 {post.category || t("shop.postCatNews")}
 </span>
 </div>
 </div>

 <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1">

 <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
 {post.title}
 </h3>

 <p className="text-slate-600 text-sm line-clamp-3 mb-6 font-normal leading-relaxed">
 {post.summary}
 </p>

 <div className="mt-auto flex items-center justify-between group/btn pt-4">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
 <User className="w-3.5 h-3.5 text-slate-500" />
 </div>
 <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">{post.authorName || "LIKEFOOD"}</span>
 </div>
 <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg group-hover/btn:bg-emerald-50 transition-colors">
 {t("shop.readMore")} <ArrowRight className="w-3.5 h-3.5" />
 </span>
 </div>
 </div>
 </Link>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </>
 )}

 {/* Newsletter / CTA Section */}
 {!isLoading && filteredPosts.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="mt-24 p-8 md:p-16 bg-white border border-slate-100 rounded-3xl relative overflow-hidden text-center shadow-sm"
 >
 <div className="relative z-10 space-y-6">
 <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
 {language === "vi" ? "Đừng bỏ lỡ bài viết nào!" : "Don't miss any articles!"}
 </h2>
 <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm md:text-base">
 {language === "vi" ? "Đăng ký nhận bản tin để cập nhật những cẩm nang ẩm thực và ưu đãi đặc biệt dành riêng cho bạn." : "Subscribe to our newsletter for exclusive food guides and special offers."}
 </p>
 <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-4">
 <input
 type="email"
 placeholder={language === "vi" ? "Địa chỉ Email của bạn" : "Your email address"}
 className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium"
 />
 <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap">
 {language === "vi" ? "Đăng ký" : "Subscribe"}
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </div>

 {/* Breadcrumb Floating */}
 <div className="fixed bottom-8 left-8 z-50 hidden lg:block">
 <Link href="/" className="bg-white/90  border border-slate-200 p-3.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
 {isVi ? "Trang chủ" : "Home"} <ChevronRight className="w-3.5 h-3.5" /> <span className="text-emerald-600">{isVi ? "Bài viết" : "Posts"}</span>
 </Link>
 </div>
 </div>
 
      </>);
}

