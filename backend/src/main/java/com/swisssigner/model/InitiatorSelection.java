package com.swisssigner.model;

import java.io.Serializable;

public class InitiatorSelection implements Serializable {
    public static final String MODE_SIGNER = "SIGNER";
    public static final String MODE_THIRD_PERSON = "THIRD_PERSON";

    private String mode = MODE_SIGNER;
    private String signerId;
    private String firstName;
    private String lastName;
    private String email;

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getSignerId() { return signerId; }
    public void setSignerId(String signerId) { this.signerId = signerId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
