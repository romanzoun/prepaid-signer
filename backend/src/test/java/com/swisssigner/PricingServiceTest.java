package com.swisssigner;

import com.swisssigner.model.PriceBreakdown;
import com.swisssigner.service.PricingService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class PricingServiceTest {

    private final PricingService service = new PricingService();

    @Test
    void one_signatory_has_correct_subtotal() {
        PriceBreakdown p = service.calculate(1, "QES");
        assertThat(p.getSubtotal()).isEqualTo(3.15);
        assertThat(p.getCurrency()).isEqualTo("CHF");
        assertThat(p.getCount()).isEqualTo(1);
    }

    @Test
    void five_signatories_have_correct_subtotal() {
        PriceBreakdown p = service.calculate(5, "QES");
        assertThat(p.getSubtotal()).isEqualTo(15.75);
    }

    @Test
    void applies_8_1_percent_vat() {
        PriceBreakdown p = service.calculate(1, "QES");
        // QES gross is 3.40; net 3.15; tax is 0.25
        assertThat(p.getTax()).isCloseTo(0.25, within(0.01));
    }

    @Test
    void total_equals_subtotal_plus_tax() {
        PriceBreakdown p = service.calculate(3, "QES");
        assertThat(p.getTotal()).isCloseTo(p.getSubtotal() + p.getTax(), within(0.01));
    }

    @Test
    void per_signature_price_is_3_15() {
        PriceBreakdown p = service.calculate(10, "QES");
        assertThat(p.getPerSignature()).isEqualTo(3.15);
        assertThat(p.getPerSignatureGross()).isEqualTo(3.40);
    }

    @Test
    void zero_signatories_produces_zero_total() {
        PriceBreakdown p = service.calculate(0, "QES");
        assertThat(p.getTotal()).isEqualTo(0.0);
    }

    @Test
    void aes_pricing_uses_1_90_gross_per_signature() {
        PriceBreakdown p = service.calculate(2, "AES");
        assertThat(p.getPerSignatureGross()).isEqualTo(1.90);
        assertThat(p.getTotal()).isEqualTo(3.80);
    }

    @Test
    void simple_pricing_uses_1_20_gross_per_signature() {
        PriceBreakdown p = service.calculate(3, "SIMPLE");
        assertThat(p.getPerSignatureGross()).isEqualTo(1.20);
        assertThat(p.getTotal()).isEqualTo(3.60);
    }

    @Test
    void analysis_addon_adds_one_chf_to_total() {
        PriceBreakdown base = service.calculate(1, "QES", false);
        PriceBreakdown withAnalysis = service.calculate(1, "QES", true);
        assertThat(withAnalysis.isAnalysisRequested()).isTrue();
        assertThat(withAnalysis.getAnalysisGross()).isEqualTo(1.00);
        assertThat(withAnalysis.getTotal()).isEqualTo(base.getTotal() + 1.00);
        assertThat(withAnalysis.getAnalysisNet()).isCloseTo(0.93, within(0.01));
    }
}
