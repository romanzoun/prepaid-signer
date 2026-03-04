package com.swisssigner.service;

import com.swisssigner.model.InvitationResult;
import com.swisssigner.model.Signatory;
import com.swisssigner.model.SignatoryPlacement;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Mock implementation – active when swisscom.sign.mock=true (default).
 * Returns fake invite links immediately without calling the Swisscom API.
 */
@Service
@ConditionalOnProperty(name = "swisscom.sign.mock", havingValue = "true", matchIfMissing = true)
public class MockSwisscomSignService implements SignInviteService {

    @Override
    public List<InvitationResult> sendInvitations(String documentRef,
                                                   String documentName,
                                                   String paymentRef,
                                                   List<Signatory> signatories,
                                                   List<SignatoryPlacement> placements) {
        return signatories.stream()
            .map(s -> new InvitationResult(
                s,
                "https://sign.swisscom.com/mock/" + paymentRef + "/" + s.getId(),
                Instant.now().toString()
            ))
            .toList();
    }
}
