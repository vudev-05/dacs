"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    once?: boolean;
}

export default function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
    once = true,
}: ScrollRevealProps) {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    };

    return (
        <motion.div
            initial={{ 
                opacity: 0, 
                ...directions[direction] 
            }}
            whileInView={{ 
                opacity: 1, 
                y: 0, 
                x: 0 
            }}
            viewport={{ 
                once: once, 
                margin: "-50px" 
            }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
