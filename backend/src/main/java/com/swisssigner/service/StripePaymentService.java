package com.swisssigner.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.swisssigner.config.StripeProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Real Stripe integration – active when stripe.mock=false.
 */
@Service
@ConditionalOnProperty(name = "stripe.mock", havingValue = "false")
public class StripePaymentService implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    private final StripeProperties props;

    public StripePaymentService(StripeProperties props) {
        this.props = props;
        Stripe.apiKey = props.getSecretKey();
        log.info("Stripe live mode active – key prefix: {}",
            props.getSecretKey() != null && props.getSecretKey().length() > 7
                ? props.getSecretKey().substring(0, 7) + "..."
                : "(not set)");
    }

    @Override
    public Map<String, String> createCheckoutSession(double totalChf,
                                                     String successUrl,
                                                     String cancelUrl,
                                                     String reference) {
        if (props.getSecretKey() == null || props.getSecretKey().isBlank()) {
            throw new IllegalStateException("STRIPE_SECRET_KEY is required when STRIPE_MOCK=false");
        }

        try {
            long amountCents = BigDecimal.valueOf(totalChf)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(reference)
                .putMetadata("reference", reference)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("chf")
                                .setUnitAmount(amountCents)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("justSign Dokument-Signatur")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            Session session = Session.create(params);
            return Map.of(
                "sessionId", session.getId(),
                "status", "pending",
                "checkoutUrl", session.getUrl(),
                "amountChf", formatAmountChf(session.getAmountTotal())
            );
        } catch (StripeException e) {
            throw new RuntimeException("Stripe checkout session creation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, String> getCheckoutStatus(String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);
            String status = toAppPaymentStatus(session.getStatus(), session.getPaymentStatus());
            return Map.of(
                "sessionId", session.getId(),
                "status", status,
                "amountChf", formatAmountChf(session.getAmountTotal())
            );
        } catch (StripeException e) {
            throw new RuntimeException("Stripe session lookup failed: " + e.getMessage(), e);
        }
    }

    private String toAppPaymentStatus(String stripeSessionStatus, String stripePaymentStatus) {
        if ("paid".equalsIgnoreCase(stripePaymentStatus)) {
            return "success";
        }
        if ("expired".equalsIgnoreCase(stripeSessionStatus)) {
            return "cancelled";
        }
        return "pending";
    }

    private String formatAmountChf(Long amountCents) {
        if (amountCents == null) {
            return "0.00";
        }
        return BigDecimal.valueOf(amountCents)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
            .toPlainString();
    }
}
