package com.swisssigner.service;

import com.swisssigner.model.PriceBreakdown;
import com.swisssigner.model.Signatory;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    // Swiss MwSt standard rate since 01.01.2024
    private static final double TAX_RATE = 0.081;
    private static final double QES_GROSS_PER_SIGNATURE = 3.40;
    private static final double AES_GROSS_PER_SIGNATURE = 1.90;
    private static final double SIMPLE_GROSS_PER_SIGNATURE = 1.20;
    private static final double ANALYSIS_GROSS_ADDON = 1.00;

    public PriceBreakdown calculate(int signatoryCount, String signatureLevel) {
        return calculate(signatoryCount, signatureLevel, false);
    }

    public PriceBreakdown calculate(int signatoryCount, String signatureLevel, boolean includeAnalysis) {
        double perSignatureGross = grossForLevel(signatureLevel);
        double perSignatureNet = round2(perSignatureGross / (1.0 + TAX_RATE));
        double signaturesNet = round2(signatoryCount * perSignatureNet);
        double signaturesGross = round2(signatoryCount * perSignatureGross);
        double analysisGross = includeAnalysis ? ANALYSIS_GROSS_ADDON : 0.0;
        double analysisNet = includeAnalysis ? round2(analysisGross / (1.0 + TAX_RATE)) : 0.0;
        double subtotal = round2(signaturesNet + analysisNet);
        double total = round2(signaturesGross + analysisGross);
        double tax = round2(total - subtotal);
        return new PriceBreakdown(
            perSignatureNet,
            perSignatureGross,
            signatoryCount,
            includeAnalysis,
            analysisNet,
            analysisGross,
            subtotal,
            tax,
            total,
            "CHF"
        );
    }

    private double grossForLevel(String signatureLevel) {
        String normalized = signatureLevel == null ? Signatory.LEVEL_QES : signatureLevel.toUpperCase();
        return switch (normalized) {
            case Signatory.LEVEL_SIMPLE -> SIMPLE_GROSS_PER_SIGNATURE;
            case Signatory.LEVEL_AES -> AES_GROSS_PER_SIGNATURE;
            default -> QES_GROSS_PER_SIGNATURE;
        };
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
