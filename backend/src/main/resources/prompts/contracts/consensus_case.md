Task: Consensus case extractor (case-based, evidence-first)

Inputs:
- doc_meta
- case_config: {case_id, name, perspective, focus, style}
- chunks: full chunk list from the uploaded PDF (already trimmed to size budget)
- preextract_hints
- all_cases_count

Rules:
1. Use only provided chunks and metadata.
2. Do not invent facts.
3. Every important claim needs at least one evidence item.
4. If unclear, set certainty to low and add an open question.
5. Keep wording short and business-readable.

Return JSON:
{
  "run_id":"consensus_case",
  "case_id":"string",
  "case_name":"string",
  "perspective_used":"string",
  "summary":"string",
  "key_dates":[
    {
      "date":"YYYY-MM-DD|null",
      "label":"string",
      "description":"string",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "termination":{
    "notice_period":"string|null",
    "renewal":"string|null",
    "for_cause":"string|null",
    "certainty":"high|medium|low",
    "evidence":[Evidence]
  },
  "obligations":[
    {
      "party":"string",
      "obligation":"string",
      "deadline":"string|null",
      "consequence":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "risks":[
    {
      "risk":"string",
      "severity":"high|medium|low",
      "likelihood":"high|medium|low",
      "mitigation":"string",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "opportunities":[
    {
      "opportunity":"string",
      "value":"high|medium|low",
      "action":"string",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "open_questions":[
    {"question":"string","impact":"high|medium|low","why":"string"}
  ],
  "evidence":[Evidence]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
