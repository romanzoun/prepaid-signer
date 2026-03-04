package com.swisssigner.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Mock implementation – active when stripe.mock=true (default).
 * Returns a fake session ID immediately without calling Stripe.
 */
@Service
@ConditionalOnProperty(name = "stripe.mock", havingValue = "true", matchIfMissing = true)
public class MockStripeService implements PaymentService {

    @Override
    public Map<String, String> createCheckoutSession(double totalChf,
                                                     String successUrl,
                                                     String cancelUrl,
                                                     String reference) {
        String sessionId = "mock_stripe_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return Map.of(
            "sessionId", sessionId,
            "status", "success",
            "amountChf", String.valueOf(totalChf)
        );
    }

    @Override
    public Map<String, String> getCheckoutStatus(String sessionId) {
        return Map.of(
            "sessionId", sessionId,
            "status", "success"
        );
    }
}
