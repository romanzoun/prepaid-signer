package com.swisssigner.model;

import java.io.Serializable;

public class Signatory implements Serializable {
    public static final String LEVEL_SIMPLE = "SIMPLE";
    public static final String LEVEL_AES = "AES";
    public static final String LEVEL_QES = "QES";

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String signatureLevel = LEVEL_QES;

    public Signatory() {}

    public Signatory(String id, String firstName, String lastName, String email, String phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public Signatory(String id, String firstName, String lastName, String email, String phone, String signatureLevel) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.signatureLevel = signatureLevel;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSignatureLevel() { return signatureLevel; }
    public void setSignatureLevel(String signatureLevel) { this.signatureLevel = signatureLevel; }
}
