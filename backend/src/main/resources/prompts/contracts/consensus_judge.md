Task: Consensus Judge - semantic reconciliation

Inputs:
- doc_meta
- run_outputs (7 JSON outputs)
- optional chunks for verification

Goals:
1. Build canonical merged result based on evidence quality and cross-run agreement.
2. Keep conflicts explicit; if unresolved, keep both alternatives.
3. Compute agreement metrics by domain and critical claims.
4. Produce deduplicated open questions ranked by impact.
5. Output critical claims for termination, payment, liability, privacy, governing law, assignment, and SLA.

Return JSON:
{
  "run_id":"consensus_judge",
  "canonical": {
    "doc_overview": {},
    "parties": [],
    "key_dates": [],
    "termination": {},
    "commercials": {},
    "obligations_sla": {},
    "liability": {},
    "privacy_security": {},
    "misc": {}
  },
  "critical_claims":[
    {
      "claim_id":"string",
      "topic":"termination|payment|liability|privacy|law|assignment|sla|other",
      "value":"string",
      "certainty":"high|medium|low",
      "agreement_count":0,
      "total_runs":7,
      "evidence":[Evidence],
      "notes":"string|null"
    }
  ],
  "conflicts":[
    {
      "topic":"string",
      "description":"string",
      "alternatives":[
        {"value":"string","supported_by_runs":["run_id"],"evidence":[Evidence]},
        {"value":"string","supported_by_runs":["run_id"],"evidence":[Evidence]}
      ],
      "resolution":"kept_both|picked_first|needs_human",
      "why":"string"
    }
  ],
  "agreement_metrics":{
    "by_domain":{
      "doc_map":0.0,
      "termination":0.0,
      "obligations_sla":0.0,
      "commercials":0.0,
      "liability":0.0,
      "privacy_security":0.0,
      "misc":0.0
    },
    "critical_claims_agreement":0.0,
    "contradiction_count":0,
    "low_evidence_count":0
  },
  "open_questions":[
    {"question":"string","impact":"high|medium|low","why":"string","related_topics":["string"]}
  ]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
