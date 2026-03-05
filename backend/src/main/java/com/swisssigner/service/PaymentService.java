package com.swisssigner.service;

import com.swisssigner.model.PriceBreakdown;

import java.util.Map;

/**
 * Processes payments for a signing session.
 * Two implementations:
 *   - MockStripeService      (stripe.mock=true, default)
 *   - StripePaymentService   (stripe.mock=false, uses real Stripe API)
 */
public interface PaymentService {

    /**
     * Creates a payment checkout session and returns the session ID and status.
     *
     * @param price calculated session price (incl. optional analysis addon)
     * @param signatureLevel selected signature level (SIMPLE|AES|QES)
     * @param successUrl absolute URL where Stripe redirects after successful payment
     * @param cancelUrl  absolute URL where Stripe redirects after cancellation
     * @param reference  internal reference (session id) for metadata/client reference
     * @return Map with keys: sessionId, status ("success" | "pending"), amountChf, optional checkoutUrl
     */
    Map<String, String> createCheckoutSession(PriceBreakdown price,
                                              String signatureLevel,
                                              String successUrl,
                                              String cancelUrl,
                                              String reference);

    /**
     * Fetches the current status of a checkout session.
     *
     * @param sessionId Stripe checkout session id
     * @return Map with keys: sessionId, status ("success" | "pending" | "cancelled"), amountChf
     */
    Map<String, String> getCheckoutStatus(String sessionId);
}
