package com.swisssigner.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SigningSessionData implements Serializable {
    private String documentName;
    private String documentRef;   // UUID reference to stored file
    private List<Signatory> signatories = new ArrayList<>();
    private List<SignatoryPlacement> placements = new ArrayList<>();
    private InitiatorSelection initiator;
    private String signatureLevel = Signatory.LEVEL_QES;
    private PriceBreakdown price;
    private String processId;
    private String paymentSessionId;
    private String paymentStatus;   // PENDING, COMPLETED, FAILED
    private List<InvitationResult> invitations = new ArrayList<>();
    private boolean contractAnalysisRequested;
    private String analysisProcessId;
    private String analysisStatus; // NOT_REQUESTED, QUEUED, RUNNING, COMPLETED, FAILED
    private String analysisError;
    private Map<String, Object> contractAnalysisResult;
    private boolean analysisFeatureEnabled;
    private String preferredLanguage = "de"; // de, en, fr
    private String step = "UPLOAD"; // UPLOAD, SIGNATORIES, PLACEMENT, PRICING, PAYMENT, DONE

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }
    public List<Signatory> getSignatories() { return signatories; }
    public void setSignatories(List<Signatory> signatories) { this.signatories = signatories; }
    public List<SignatoryPlacement> getPlacements() { return placements; }
    public void setPlacements(List<SignatoryPlacement> placements) { this.placements = placements; }
    public InitiatorSelection getInitiator() { return initiator; }
    public void setInitiator(InitiatorSelection initiator) { this.initiator = initiator; }
    public String getSignatureLevel() { return signatureLevel; }
    public void setSignatureLevel(String signatureLevel) { this.signatureLevel = signatureLevel; }
    public PriceBreakdown getPrice() { return price; }
    public void setPrice(PriceBreakdown price) { this.price = price; }
    public String getProcessId() { return processId; }
    public void setProcessId(String processId) { this.processId = processId; }
    public String getPaymentSessionId() { return paymentSessionId; }
    public void setPaymentSessionId(String paymentSessionId) { this.paymentSessionId = paymentSessionId; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public List<InvitationResult> getInvitations() { return invitations; }
    public void setInvitations(List<InvitationResult> invitations) { this.invitations = invitations; }
    public boolean isContractAnalysisRequested() { return contractAnalysisRequested; }
    public void setContractAnalysisRequested(boolean contractAnalysisRequested) { this.contractAnalysisRequested = contractAnalysisRequested; }
    public String getAnalysisProcessId() { return analysisProcessId; }
    public void setAnalysisProcessId(String analysisProcessId) { this.analysisProcessId = analysisProcessId; }
    public String getAnalysisStatus() { return analysisStatus; }
    public void setAnalysisStatus(String analysisStatus) { this.analysisStatus = analysisStatus; }
    public String getAnalysisError() { return analysisError; }
    public void setAnalysisError(String analysisError) { this.analysisError = analysisError; }
    public Map<String, Object> getContractAnalysisResult() { return contractAnalysisResult; }
    public void setContractAnalysisResult(Map<String, Object> contractAnalysisResult) { this.contractAnalysisResult = contractAnalysisResult; }
    public boolean isAnalysisFeatureEnabled() { return analysisFeatureEnabled; }
    public void setAnalysisFeatureEnabled(boolean analysisFeatureEnabled) { this.analysisFeatureEnabled = analysisFeatureEnabled; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }
}
