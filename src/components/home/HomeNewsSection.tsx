"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface Post {
    id: number;
    title: string;
    slug: string;
    summary?: string;
    image?: string;
    category?: string;
    publishedAt: string;
}

function VerticalPostCard({ post, language, isHiddenOnMobile }: { post: Post; language: string; isHiddenOnMobile: boolean }) {
    return (
        <Link
            href={`/posts/${post.slug}`}
            className={`group flex-col bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 ${isHiddenOnMobile ? 'hidden lg:flex' : 'flex'}`}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                )}
                {post.category && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                            {post.category}
                        </span>
                    </div>
                )}
            </div>
            <div className="p-2.5 sm:p-3 flex flex-col flex-1 bg-white">
                <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors mb-2">
                    {post.title}
                </h3>
                <div className="mt-auto flex items-center text-[10px] sm:text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate flex-1">
                        {new Date(post.publishedAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function HomeNewsSection() {
    const { language } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch up to 5 posts
                const res = await fetch("/api/posts?limit=5", { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setPosts((data.posts || []).slice(0, 5));
                }
            } catch (error) {
                // Handle silently
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (isLoading) {
        return (
            <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-4 mb-8">
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-4 sm:p-5">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4">
                        <div className="w-32 h-6 bg-slate-100 rounded animate-pulse" />
                        <div className="w-24 h-6 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`flex-col ${i > 3 ? 'hidden lg:flex' : 'flex'} gap-2`}>
                                <div className="aspect-[4/3] bg-slate-100 rounded-xl animate-pulse" />
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-full mt-2" />
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto mt-4 mb-10">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hidden-scrollbar">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h2 className="text-sm sm:text-lg font-black text-slate-800 uppercase tracking-tight">
                            {language === 'vi' ? 'Tin Tức & Bài Viết' : 'News & Posts'}
                        </h2>
                    </div>
                    <Link
                        href="/posts"
                        className="group inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap"
                    >
                        {language === 'vi' ? 'Xem thêm bài viết' : 'View more posts'}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="p-3 sm:p-5">
                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                        {posts.map((post, idx) => (
                            <VerticalPostCard 
                                key={post.id} 
                                post={post} 
                                language={language} 
                                isHiddenOnMobile={idx >= 3} 
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
