package com.swisssigner.service;

import com.swisssigner.model.PriceBreakdown;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    // Cost from Swisscom Sign: CHF 2.50 → 20% margin → CHF 3.15 net
    private static final double PRICE_PER_SIGNATURE = 3.15;
    // Swiss MwSt standard rate since 01.01.2024
    private static final double TAX_RATE = 0.081;

    public PriceBreakdown calculate(int signatoryCount) {
        double subtotal = round2(signatoryCount * PRICE_PER_SIGNATURE);
        double tax = round2(subtotal * TAX_RATE);
        double total = round2(subtotal + tax);
        return new PriceBreakdown(PRICE_PER_SIGNATURE, signatoryCount, subtotal, tax, total, "CHF");
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
