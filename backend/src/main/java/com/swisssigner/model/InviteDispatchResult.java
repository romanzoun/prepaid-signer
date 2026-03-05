package com.swisssigner.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class InviteDispatchResult implements Serializable {
    private String processId;
    private List<InvitationResult> invitations = new ArrayList<>();

    public InviteDispatchResult() {}

    public InviteDispatchResult(String processId, List<InvitationResult> invitations) {
        this.processId = processId;
        this.invitations = invitations;
    }

    public String getProcessId() { return processId; }
    public void setProcessId(String processId) { this.processId = processId; }
    public List<InvitationResult> getInvitations() { return invitations; }
    public void setInvitations(List<InvitationResult> invitations) { this.invitations = invitations; }
}
