package com.swisssigner.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class SigningSessionData implements Serializable {
    private String documentName;
    private String documentRef;   // UUID reference to stored file
    private List<Signatory> signatories = new ArrayList<>();
    private List<SignatoryPlacement> placements = new ArrayList<>();
    private String signatureLevel = Signatory.LEVEL_QES;
    private PriceBreakdown price;
    private String paymentSessionId;
    private String paymentStatus;   // PENDING, COMPLETED, FAILED
    private List<InvitationResult> invitations = new ArrayList<>();
    private String step = "UPLOAD"; // UPLOAD, SIGNATORIES, PLACEMENT, PRICING, PAYMENT, DONE

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }
    public List<Signatory> getSignatories() { return signatories; }
    public void setSignatories(List<Signatory> signatories) { this.signatories = signatories; }
    public List<SignatoryPlacement> getPlacements() { return placements; }
    public void setPlacements(List<SignatoryPlacement> placements) { this.placements = placements; }
    public String getSignatureLevel() { return signatureLevel; }
    public void setSignatureLevel(String signatureLevel) { this.signatureLevel = signatureLevel; }
    public PriceBreakdown getPrice() { return price; }
    public void setPrice(PriceBreakdown price) { this.price = price; }
    public String getPaymentSessionId() { return paymentSessionId; }
    public void setPaymentSessionId(String paymentSessionId) { this.paymentSessionId = paymentSessionId; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public List<InvitationResult> getInvitations() { return invitations; }
    public void setInvitations(List<InvitationResult> invitations) { this.invitations = invitations; }
    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }
}
