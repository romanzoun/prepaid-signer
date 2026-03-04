package com.swisssigner.model;

import java.io.Serializable;

public class InvitationResult implements Serializable {
    private Signatory signatory;
    private String inviteLink;
    private String sentAt;

    public InvitationResult() {}

    public InvitationResult(Signatory signatory, String inviteLink, String sentAt) {
        this.signatory = signatory;
        this.inviteLink = inviteLink;
        this.sentAt = sentAt;
    }

    public Signatory getSignatory() { return signatory; }
    public void setSignatory(Signatory signatory) { this.signatory = signatory; }
    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }
    public String getSentAt() { return sentAt; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }
}
