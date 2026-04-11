"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const BANNERS = [
  { src: "/banner-1.jpeg", alt: "Likefood - Đặc sản Việt Nam" },
  { src: "/banner-2.jpeg", alt: "Likefood - Đặc sản Việt Nam" },
  { src: "/banner-3.jpeg", alt: "Likefood - Ẩm thực khô Việt Nam" },
  { src: "/banner-4.jpeg", alt: "Likefood - Đặc sản Việt Nam" },
];

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = BANNERS.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % total);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total);
  }, [current, total, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, isPaused]);

  // Touch/Mouse swipe support
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (clientX: number) => {
    setTouchEnd(null);
    setTouchStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setTouchEnd(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0) next();
      else prev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden shadow-sm group select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); handleDragEnd(); }}
      onTouchStart={(e) => handleDragStart(e.targetTouches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.targetTouches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Aspect ratio container */}
      <div className="relative w-full bg-slate-200 h-full aspect-[16/9] lg:aspect-auto lg:min-h-[400px]">
        {BANNERS.map((banner, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-all duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0,
              transform: `scale(${current === index ? 1 : 1.05})`,
              zIndex: current === index ? 10 : 0,
              transitionDuration: "600ms",
            }}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 70vw"
              className="object-cover"
            />
          </div>
        ))}

        {/* Gradient overlay bottom for dot indicators */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label="Banner trước"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30
          w-8 h-8 sm:w-10 sm:h-10 rounded-full 
          bg-white/80 backdrop-blur-sm shadow-md
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-300 
          hover:bg-white hover:scale-110 hover:shadow-lg
          active:scale-95"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Banner tiếp theo"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30
          w-8 h-8 sm:w-10 sm:h-10 rounded-full
          bg-white/80 backdrop-blur-sm shadow-md
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-300
          hover:bg-white hover:scale-110 hover:shadow-lg
          active:scale-95"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Xem banner ${index + 1}`}
            className="relative group/dot"
          >
            <span
              className={`block rounded-full transition-all duration-400 ${current === index
                  ? "w-7 sm:w-8 h-2.5 sm:h-3 bg-white shadow-md"
                  : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/50 hover:bg-white/75"
                }`}
            />
            {/* Active indicator glow */}
            {current === index && (
              <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: "2s" }} />
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 z-30 bg-white/20">
        <div
          className="h-full bg-white/70 transition-all"
          style={{
            width: `${((current + 1) / total) * 100}%`,
            transitionDuration: "400ms",
          }}
        />
      </div>
    </div>
  );
}
