package com.swisssigner.service;

import com.swisssigner.model.InviteDispatchResult;
import com.swisssigner.model.InitiatorSelection;
import com.swisssigner.model.Signatory;
import com.swisssigner.model.SignatoryPlacement;

import java.util.List;

/**
 * Sends signing invitations for a document.
 * Two implementations:
 *   - MockSwisscomSignService  (swisscom.sign.mock=true, default)
 *   - SwisscomSignService      (swisscom.sign.mock=false, uses real API)
 */
public interface SignInviteService {

    /**
     * Creates a signing process, attaches the PDF, releases it, and returns
     * one invite link per signatory.
     *
     * @param documentRef    absolute path to the uploaded PDF on disk
     * @param documentName   original filename (used as process title)
     * @param paymentRef     reference from the payment step (for audit)
     * @param signatories    list of people who must sign
     * @param placements     visual signature coordinates per signatory
     * @param initiator      selected process initiator (signer or third person)
     * @return processId and one InvitationResult per signatory with a signing URL and timestamp
     */
    InviteDispatchResult sendInvitations(String documentRef,
                                         String documentName,
                                         String paymentRef,
                                         List<Signatory> signatories,
                                         List<SignatoryPlacement> placements,
                                         InitiatorSelection initiator);

    /**
     * Reads the current signing process status from provider.
     *
     * @param processId provider process id
     * @return status payload including processId and normalized status string
     */
    java.util.Map<String, Object> getProcessStatus(String processId);
}
