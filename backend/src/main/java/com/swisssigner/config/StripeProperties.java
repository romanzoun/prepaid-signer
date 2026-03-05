package com.swisssigner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "stripe")
public class StripeProperties {
    private boolean mock = true;
    private String secretKey;
    private String webhookSecret;
    private String publishableKey;
    private String analysisProductId = "prod_U5mjbEJpbf9Wzs";

    public boolean isMock() { return mock; }
    public void setMock(boolean mock) { this.mock = mock; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }
    public String getPublishableKey() { return publishableKey; }
    public void setPublishableKey(String publishableKey) { this.publishableKey = publishableKey; }
    public String getAnalysisProductId() { return analysisProductId; }
    public void setAnalysisProductId(String analysisProductId) { this.analysisProductId = analysisProductId; }
}
