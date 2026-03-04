package com.swisssigner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "swisscom.sign")
public class SwisscomSignProperties {
    private boolean mock = true;
    private String apiUrl;
    private String tokenUrl;
    private String clientId;
    private String clientSecret;
    private String notificationLanguage = "de-CH";

    public boolean isMock() { return mock; }
    public void setMock(boolean mock) { this.mock = mock; }
    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
    public String getTokenUrl() { return tokenUrl; }
    public void setTokenUrl(String tokenUrl) { this.tokenUrl = tokenUrl; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public String getNotificationLanguage() { return notificationLanguage; }
    public void setNotificationLanguage(String notificationLanguage) { this.notificationLanguage = notificationLanguage; }
}
