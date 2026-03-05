package com.swisssigner.service;

import com.swisssigner.model.ContractAnalyzeOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ContractAnalysisJobService {
    private static final Logger log = LoggerFactory.getLogger(ContractAnalysisJobService.class);

    private final ContractAnalysisService contractAnalysisService;
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private final ConcurrentMap<String, AnalysisJob> jobs = new ConcurrentHashMap<>();

    public ContractAnalysisJobService(ContractAnalysisService contractAnalysisService) {
        this.contractAnalysisService = contractAnalysisService;
    }

    public AnalysisJob startJob(String analysisProcessId,
                                Path pdfPath,
                                String fileName,
                                ContractAnalyzeOptions options) {
        AnalysisJob existing = jobs.get(analysisProcessId);
        if (existing != null && !existing.isTerminal()) {
            return existing;
        }
        if (existing != null && "COMPLETED".equals(existing.status)) {
            return existing;
        }

        AnalysisJob job = new AnalysisJob(analysisProcessId);
        job.status = "QUEUED";
        job.startedAt = Instant.now();
        jobs.put(analysisProcessId, job);

        final Path snapshotPath;
        try {
            snapshotPath = Files.createTempFile("contract-analysis-", ".pdf");
            Files.copy(pdfPath, snapshotPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            job.error = "Could not prepare analysis input: " + ex.getMessage();
            job.status = "FAILED";
            job.completedAt = Instant.now();
            log.warn("analysis_job_prepare_failed id={} reason={}", analysisProcessId, ex.getMessage());
            return job;
        }

        CompletableFuture.runAsync(() -> {
            job.status = "RUNNING";
            try {
                Map<String, Object> result = contractAnalysisService.analyzeStoredDocument(snapshotPath, fileName, options);
                job.result = result;
                job.status = "COMPLETED";
            } catch (RuntimeException ex) {
                job.error = ex.getMessage();
                job.status = "FAILED";
                log.warn("analysis_job_failed id={} reason={}", analysisProcessId, ex.getMessage());
            } finally {
                try {
                    Files.deleteIfExists(snapshotPath);
                } catch (IOException ignored) {
                    // best-effort cleanup
                }
                job.completedAt = Instant.now();
            }
        }, executor);

        return job;
    }

    public AnalysisJob getJob(String analysisProcessId) {
        if (analysisProcessId == null || analysisProcessId.isBlank()) {
            return null;
        }
        return jobs.get(analysisProcessId);
    }

    public static class AnalysisJob {
        private final String id;
        private volatile String status = "QUEUED";
        private volatile Instant startedAt;
        private volatile Instant completedAt;
        private volatile String error;
        private volatile Map<String, Object> result;

        private AnalysisJob(String id) {
            this.id = id;
        }

        public String getId() { return id; }
        public String getStatus() { return status; }
        public Instant getStartedAt() { return startedAt; }
        public Instant getCompletedAt() { return completedAt; }
        public String getError() { return error; }
        public Map<String, Object> getResult() { return result; }

        public boolean isTerminal() {
            return "COMPLETED".equals(status) || "FAILED".equals(status);
        }
    }
}
