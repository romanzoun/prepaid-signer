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
        PriceBreakdown p = service.calculate(1);
        assertThat(p.getSubtotal()).isEqualTo(3.15);
        assertThat(p.getCurrency()).isEqualTo("CHF");
        assertThat(p.getCount()).isEqualTo(1);
    }

    @Test
    void five_signatories_have_correct_subtotal() {
        PriceBreakdown p = service.calculate(5);
        assertThat(p.getSubtotal()).isEqualTo(15.75);
    }

    @Test
    void applies_8_1_percent_vat() {
        PriceBreakdown p = service.calculate(1);
        // 3.15 * 0.081 = 0.25515 → rounded to 0.26
        assertThat(p.getTax()).isCloseTo(0.26, within(0.01));
    }

    @Test
    void total_equals_subtotal_plus_tax() {
        PriceBreakdown p = service.calculate(3);
        assertThat(p.getTotal()).isCloseTo(p.getSubtotal() + p.getTax(), within(0.01));
    }

    @Test
    void per_signature_price_is_3_15() {
        PriceBreakdown p = service.calculate(10);
        assertThat(p.getPerSignature()).isEqualTo(3.15);
    }

    @Test
    void zero_signatories_produces_zero_total() {
        PriceBreakdown p = service.calculate(0);
        assertThat(p.getTotal()).isEqualTo(0.0);
    }
}
