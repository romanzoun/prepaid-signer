package com.swisssigner.service;

import com.swisssigner.model.InviteDispatchResult;
import com.swisssigner.model.InvitationResult;
import com.swisssigner.model.InitiatorSelection;
import com.swisssigner.model.Signatory;
import com.swisssigner.model.SignatoryPlacement;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mock implementation – active when swisscom.sign.mock=true (default).
 * Returns fake invite links immediately without calling the Swisscom API.
 */
@Service
@ConditionalOnProperty(name = "swisscom.sign.mock", havingValue = "true", matchIfMissing = true)
public class MockSwisscomSignService implements SignInviteService {

    @Override
    public InviteDispatchResult sendInvitations(String documentRef,
                                                String documentName,
                                                String paymentRef,
                                                List<Signatory> signatories,
                                                List<SignatoryPlacement> placements,
                                                InitiatorSelection initiator) {
        List<InvitationResult> invitations = signatories.stream()
            .map(s -> new InvitationResult(
                s,
                "https://sign.swisscom.com/mock/" + paymentRef + "/" + s.getId(),
                Instant.now().toString()
            ))
            .toList();
        String processId = "mock-process-" + (paymentRef == null || paymentRef.isBlank() ? "ref" : paymentRef);
        return new InviteDispatchResult(processId, invitations);
    }

    @Override
    public Map<String, Object> getProcessStatus(String processId) {
        long tick = (System.currentTimeMillis() / 5000L) % 3L;
        String status = switch ((int) tick) {
            case 0 -> "PENDING";
            case 1 -> "IN_PROGRESS";
            default -> "COMPLETED";
        };
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("processId", processId);
        response.put("status", status);
        response.put("provider", "mock");
        response.put("checkedAt", Instant.now().toString());
        return response;
    }
}
