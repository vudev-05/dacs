import SidebarCategories from "@/components/navbar/SidebarCategories";
import BannerCarousel from "@/components/home/BannerCarousel";
import PromoBanners from "@/components/home/PromoBanners";

export const metadata = {
   title: "LIKEFOOD - Đặc sản Việt",
   description: "LIKEFOOD Home Page",
};

export default function Home() {
   return (
      <main className="min-h-screen bg-slate-50 pb-12">
         {/* HEADER ALIGNMENT GRID: This grid aligns with the Navbar's max-w container */}
         <section className="w-full px-4 sm:px-6 lg:px-[6%] mx-auto pb-4">
            <div className="flex gap-4 items-stretch">
               {/* Left Sidebar (fixed width matching navbar category btn) */}
               <div className="hidden md:flex w-[240px] xl:w-[260px] flex-shrink-0 self-stretch">
                  <SidebarCategories />
               </div>

               {/* Right Banner Area - Carousel & Promos */}
               <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[2.8fr_1fr] gap-4">
                  {/* Main Carousel Banner */}
                  <div className="w-full h-full">
                     <BannerCarousel />
                  </div>
                  {/* Smaller Side Banners */}
                  <div className="hidden lg:block w-full h-full">
                     <PromoBanners />
                  </div>
               </div>
            </div>
         </section>
      </main>
   );
}
