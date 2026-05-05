/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { cookies } from "next/headers";
import { Loader2 } from "lucide-react";

export default async function Loading() {
 const cookieStore = await cookies();
 const lang = cookieStore.get("language")?.value === "en" ? "en" : "vi";
 const text = lang === "en" ? "Loading..." : "Đang tải...";

 return (
 <div className="min-h-screen flex items-center justify-center bg-white/95  z-50 fixed inset-0">
 <div className="text-center flex flex-col items-center justify-center">
  <div className="relative">
  <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-primary" />
  <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
  </div>
  <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mt-8 animate-pulse">
  {text}
  </p>
 </div>
 </div>
 );
}
