/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 */

"use client";

import { useState, useEffect } from "react";

type NavItem = {
    label: string;
    href: string;
    icon?: string;
    highlight?: boolean;
};

interface NavbarConfig {
    supportPhone: string | null;
    navLinks: NavItem[] | null;
    announcementEnabled: boolean;
    announcementText: string;
}

export function useNavbarConfig(): NavbarConfig {
    const [supportPhone, setSupportPhone] = useState<string | null>(process.env.NEXT_PUBLIC_SITE_SUPPORT_PHONE || null);
    const [navLinks, setNavLinks] = useState<NavItem[] | null>(null);
    const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(
        process.env.NEXT_PUBLIC_ANNOUNCEMENT_BAR !== "OFF"
    );
    const [announcementText, setAnnouncementText] = useState<string>(
        process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT || "navbar.announcement1 | navbar.announcement2 | navbar.announcement3"
    );

    useEffect(() => {
        const load = async () => {
            try {
                const { getPublicSettings } = await import("@/lib/public-settings");
                const data = await getPublicSettings();

                if (data.SITE_SUPPORT_PHONE) setSupportPhone(data.SITE_SUPPORT_PHONE);

                if (typeof data.ANNOUNCEMENT_BAR === "string") {
                    setAnnouncementEnabled(data.ANNOUNCEMENT_BAR.toUpperCase() === "ON");
                }

                if (typeof data.ANNOUNCEMENT_TEXT === "string" && data.ANNOUNCEMENT_TEXT.trim()) {
                    setAnnouncementText(data.ANNOUNCEMENT_TEXT.trim());
                }

                if (data.NAV_PRIMARY_LINKS) {
                    try {
                        const parsed = JSON.parse(data.NAV_PRIMARY_LINKS) as NavItem[];
                        if (Array.isArray(parsed) && parsed.length > 0) setNavLinks(parsed);
                    } catch {
                        // invalid JSON → keep null → render default links
                    }
                }
            } catch {
                // silently fallback
            }
        };
        load();
    }, []);

    return { supportPhone, navLinks, announcementEnabled, announcementText };
}
