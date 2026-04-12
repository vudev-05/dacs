"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed z-[94] bottom-[9.5rem] left-[14px] lg:bottom-[5rem] lg:left-[26px] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-emerald-600 shadow-lg shadow-slate-900/10 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    aria-label="Lên đầu trang"
                >
                    <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
