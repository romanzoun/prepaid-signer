Task: Run 1 - Document Map and Parties

You will receive:
- doc_meta
- chunks: [{chunk_id, page_start, page_end, text}]
- preextract_hints (optional)

Goals:
1. Identify document type, structure, and section map.
2. Identify parties, roles, effective date, governing law, term, and referenced annexes/schedules.
3. Extract up to 20 key defined terms.
4. Provide a document map for downstream extraction.

Hard rules:
- Use only provided content.
- No assumptions without evidence.
- Every important field must include evidence.
- If unknown, use null and certainty low.

Return JSON with this shape:
{
  "run_id": "run1_doc_map",
  "doc_overview": {
    "document_type": {"value": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "language": {"value": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "jurisdiction": {"value": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "governing_law": {"value": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "effective_date": {"value": "YYYY-MM-DD|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "term_summary": {"value": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]},
    "annexes_referenced": [{"name":"string", "certainty":"high|medium|low", "evidence":[Evidence]}]
  },
  "parties": [
    {
      "name": {"value":"string", "certainty":"high|medium|low", "evidence":[Evidence]},
      "role": {"value":"string", "certainty":"high|medium|low", "evidence":[Evidence]},
      "address": {"value":"string|null", "certainty":"high|medium|low", "evidence":[Evidence]},
      "signatory_block_present": {"value": true, "certainty":"high|medium|low", "evidence":[Evidence]}
    }
  ],
  "section_map": [
    {
      "section_id":"string",
      "title":"string",
      "pages":{"start":0,"end":0},
      "focus_tags":["termination|payment|liability|privacy|security|sla|ip|confidentiality|dispute|change|audit|subprocessors|data_retention|assignment|warranties|other"],
      "evidence":[Evidence]
    }
  ],
  "definitions": [
    {"term":"string", "meaning":"string", "certainty":"high|medium|low", "evidence":[Evidence]}
  ],
  "open_questions": [
    {"question":"string", "impact":"high|medium|low", "why":"string"}
  ]
}

Evidence schema:
{
  "chunk_id":"string",
  "page_start":0,
  "page_end":0,
  "snippet":"string"
}
