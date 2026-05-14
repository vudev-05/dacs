/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import Stripe from "stripe";
import { getSystemSettingTrimmed } from "@/lib/system-settings";

let _stripe: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
    if (!_stripe) {
        let secretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!secretKey) {
            // Lazy fallback to database if env is missing
            secretKey = await getSystemSettingTrimmed("stripe_secret_key");
        }

        if (!secretKey) {
            throw new Error("STRIPE_SECRET_KEY is not set (checked both .env and database)");
        }
        
        _stripe = new Stripe(secretKey);
    }
    return _stripe;
}

// For backwards compatibility - lazy getter
// Note: This remains sync but will throw an error if getStripe() hasn't been called/awaited yet.
export const stripe = new Proxy({} as Stripe, {
    get(_, prop: string | symbol) {
        if (!_stripe) {
            throw new Error("Stripe client not initialized. Ensure getStripe() is awaited first.");
        }
        const client = _stripe;
        const key = prop as keyof Stripe;
        return client[key];
    },
});
