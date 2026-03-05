package com.swisssigner.controller;

import com.swisssigner.model.ContractAnalyzeOptions;
import com.swisssigner.service.ContractAnalysisService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping({"/api/contracts", "/v1/contracts"})
public class ContractAnalysisController {

    private final ContractAnalysisService contractAnalysisService;

    public ContractAnalysisController(ContractAnalysisService contractAnalysisService) {
        this.contractAnalysisService = contractAnalysisService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyze(@RequestParam("file") MultipartFile file,
                                     @RequestParam(value = "language", defaultValue = "auto") String language,
                                     @RequestParam(value = "jurisdiction_hint", required = false) String jurisdictionHint,
                                     @RequestParam(value = "party_role", required = false) String partyRole,
                                     @RequestParam(value = "analysis_profile", defaultValue = "standard") String analysisProfile,
                                     @RequestParam(value = "confidence_mode", defaultValue = "consensus7") String confidenceMode) {
        try {
            ContractAnalyzeOptions options = new ContractAnalyzeOptions(
                language,
                jurisdictionHint,
                partyRole,
                analysisProfile,
                confidenceMode
            );
            Map<String, Object> result = contractAnalysisService.analyze(file, options);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(503).body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(502).body(Map.of("error", ex.getMessage()));
        }
    }
}
