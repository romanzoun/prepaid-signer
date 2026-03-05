package com.swisssigner.model;

public record ContractAnalyzeOptions(
    String language,
    String jurisdictionHint,
    String partyRole,
    String analysisProfile,
    String confidenceMode
) {
}
