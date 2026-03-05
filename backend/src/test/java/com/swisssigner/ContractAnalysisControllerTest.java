package com.swisssigner;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContractAnalysisControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    void analyze_rejects_non_pdf() throws Exception {
        MockMultipartFile txt = new MockMultipartFile(
            "file", "contract.txt", "text/plain", "hello".getBytes()
        );

        mockMvc.perform(multipart("/api/contracts/analyze").file(txt))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", containsString("Only PDF files are allowed")));
    }

    @Test
    void analyze_without_openai_key_returns_503() throws Exception {
        MockMultipartFile pdf = new MockMultipartFile(
            "file", "contract.pdf", "application/pdf", "%PDF-1.4 test content".getBytes()
        );

        mockMvc.perform(multipart("/api/contracts/analyze").file(pdf))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.error", containsString("OPENAI_API_KEY")));
    }
}
