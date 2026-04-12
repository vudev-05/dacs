import SidebarCategories from "@/components/navbar/SidebarCategories";
import BannerCarousel from "@/components/home/BannerCarousel";
import PromoBanners from "@/components/home/PromoBanners";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import RecommendedProductsSection from "@/components/home/RecommendedProductsSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import CustomerReviews from "@/components/shared/CustomerReviews";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import ScrollReveal from "@/components/shared/ScrollReveal";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

export default function Home() {
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://likefood.app";

   return (
      <main className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden">
         {/* SEO-001: Structured Data for Google Rich Snippets */}
         <OrganizationJsonLd url={baseUrl} />
         <WebSiteJsonLd url={baseUrl} />
         
         {/* HEADER ALIGNMENT GRID: This grid aligns with the Navbar's max-w container */}
         <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto pb-4">
            <div className="flex gap-4 items-stretch">
               {/* Left Sidebar (fixed width matching navbar category btn) */}
               <div className="hidden md:flex w-[240px] xl:w-[260px] flex-shrink-0 self-stretch">
                  <ScrollReveal>
                     <SidebarCategories />
                  </ScrollReveal>
               </div>

               {/* Right Banner Area - Carousel & Promos */}
               <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[2.8fr_1fr] gap-4">
                  {/* Main Carousel Banner */}
                  <div className="w-full h-full">
                     <ScrollReveal delay={0.1}>
                        <BannerCarousel />
                     </ScrollReveal>
                  </div>
                  {/* Smaller Side Banners */}
                  <div className="hidden lg:block w-full h-full">
                     <ScrollReveal delay={0.2} direction="left">
                        <PromoBanners />
                     </ScrollReveal>
                  </div>
               </div>
            </div>
         </section>

         <ScrollReveal>
            <FlashSaleSection />
         </ScrollReveal>

         <ScrollReveal>
            <RecommendedProductsSection />
         </ScrollReveal>

         <ScrollReveal>
            <FeaturedProductsSection />
         </ScrollReveal>

         <ScrollReveal>
            <CustomerReviews />
         </ScrollReveal>

         <ScrollReveal>
            <HomeNewsSection />
         </ScrollReveal>
      </main>
   );
}
