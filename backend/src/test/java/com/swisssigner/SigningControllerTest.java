package com.swisssigner;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SigningControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void health_returns_up() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void upload_pdf_returns_document_name() throws Exception {
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "contract.pdf", "application/pdf", "%PDF-1.4 test content".getBytes()
        );

        mockMvc.perform(multipart("/api/sign/upload").file(pdf))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.documentName").value("contract.pdf"));
    }

    @Test
    void upload_pdf_with_octet_stream_content_type_returns_document_name() throws Exception {
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "contract.pdf", "application/octet-stream", "%PDF-1.7 test content".getBytes()
        );

        mockMvc.perform(multipart("/api/sign/upload").file(pdf))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.documentName").value("contract.pdf"));
    }

    @Test
    void upload_non_pdf_returns_400() throws Exception {
        MockMultipartFile txt = new MockMultipartFile(
            "file", "doc.txt", "text/plain", "hello".getBytes()
        );

        mockMvc.perform(multipart("/api/sign/upload").file(txt))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void full_signing_flow_succeeds() throws Exception {
        MockHttpSession session = new MockHttpSession();

        // Step 1: Upload PDF
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "agreement.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.documentName").value("agreement.pdf"));

        // Step 2: Set signatories
        Map<String, Object> sigRequest = Map.of("signatories", List.of(
            Map.of("id", "s1", "firstName", "Alice", "lastName", "Tester", "email", "alice@test.com", "phone", ""),
            Map.of("id", "s2", "firstName", "Bob", "lastName", "Tester", "email", "bob@test.com", "phone", "")
        ));
        mockMvc.perform(post("/api/sign/signatories")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(sigRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.price.count").value(2))
            .andExpect(jsonPath("$.price.subtotal").value(6.30))
            .andExpect(jsonPath("$.price.currency").value("CHF"));

        // Step 3: Set placements
        Map<String, Object> placementRequest = Map.of("placements", List.of(
            Map.of("signatoryId", "s1", "page", 1, "x", 100, "y", 120, "width", 150, "height", 45),
            Map.of("signatoryId", "s2", "page", 1, "x", 300, "y", 120, "width", 150, "height", 45)
        ));
        mockMvc.perform(post("/api/sign/placements")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(placementRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.placements", hasSize(2)));

        // Step 4: Pay (mock Stripe)
        mockMvc.perform(post("/api/sign/pay").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId", startsWith("mock_stripe_")))
            .andExpect(jsonPath("$.status").value("success"));

        // Step 5: Send invitations (mock Swisscom Sign)
        mockMvc.perform(post("/api/sign/invite").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.invitations", hasSize(2)))
            .andExpect(jsonPath("$.invitations[0].signatory.firstName").value("Alice"))
            .andExpect(jsonPath("$.invitations[1].signatory.firstName").value("Bob"))
            .andExpect(jsonPath("$.invitations[0].inviteLink", containsString("sign.swisscom.com")));
    }

    @Test
    void pay_without_signatories_returns_400() throws Exception {
        MockHttpSession session = new MockHttpSession();
        mockMvc.perform(post("/api/sign/pay").session(session))
            .andExpect(status().isBadRequest());
    }

    @Test
    void set_signatories_defaults_signature_level_to_qes() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk());

        Map<String, Object> sigRequest = Map.of("signatories", List.of(
            Map.of("id", "s1", "firstName", "Alice", "lastName", "Tester", "email", "alice@test.com", "phone", "")
        ));
        mockMvc.perform(post("/api/sign/signatories")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(sigRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.signatories[0].signatureLevel").value("QES"));
    }

    @Test
    void set_signatories_with_invalid_document_signature_level_returns_400() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk());

        Map<String, Object> sigRequest = Map.of("signatories", List.of(
            Map.of(
                "id", "s1",
                "firstName", "Alice",
                "lastName", "Tester",
                "email", "alice@test.com",
                "phone", ""
            )
        ));
        mockMvc.perform(post("/api/sign/signatories")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(Map.of(
                    "signatories", sigRequest.get("signatories"),
                    "signatureLevel", "FOO"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", containsString("signatureLevel")));
    }

    @Test
    void pay_without_placements_returns_400() throws Exception {
        MockHttpSession session = new MockHttpSession();

        MockMultipartFile pdf = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk());

        Map<String, Object> sigRequest = Map.of("signatories", List.of(
            Map.of("id", "s1", "firstName", "Alice", "lastName", "Tester", "email", "alice@test.com", "phone", "")
        ));
        mockMvc.perform(post("/api/sign/signatories")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(sigRequest)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/sign/pay").session(session))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", containsString("Place all signatories first")));
    }

    @Test
    void invite_without_payment_returns_400() throws Exception {
        MockHttpSession session = new MockHttpSession();
        mockMvc.perform(post("/api/sign/invite").session(session))
            .andExpect(status().isBadRequest());
    }

    @Test
    void confirm_payment_returns_success_for_mock_checkout() throws Exception {
        MockHttpSession session = new MockHttpSession();

        MockMultipartFile pdf = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk());

        Map<String, Object> sigRequest = Map.of("signatories", List.of(
            Map.of("id", "s1", "firstName", "Alice", "lastName", "Tester", "email", "alice@test.com", "phone", "")
        ));
        mockMvc.perform(post("/api/sign/signatories")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(sigRequest)))
            .andExpect(status().isOk());

        Map<String, Object> placementRequest = Map.of("placements", List.of(
            Map.of("signatoryId", "s1", "page", 1, "x", 100, "y", 120, "width", 150, "height", 45)
        ));
        mockMvc.perform(post("/api/sign/placements")
                .session(session)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(placementRequest)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/sign/pay").session(session))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/sign/pay/confirm").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("success"))
            .andExpect(jsonPath("$.sessionId", startsWith("mock_stripe_")))
            .andExpect(jsonPath("$.invitations", hasSize(1)))
            .andExpect(jsonPath("$.invitations[0].signatory.firstName").value("Alice"));
    }

    @Test
    void state_returns_current_step() throws Exception {
        MockHttpSession session = new MockHttpSession();

        // Upload to advance step
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "doc.pdf", "application/pdf", "%PDF-1.4".getBytes()
        );
        mockMvc.perform(multipart("/api/sign/upload").file(pdf).session(session))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/sign/state").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.step").value("SIGNATORIES"))
            .andExpect(jsonPath("$.documentName").value("doc.pdf"));
    }
}
