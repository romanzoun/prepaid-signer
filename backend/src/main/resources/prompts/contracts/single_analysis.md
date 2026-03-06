Task: Complete contract analysis in a single pass

You are analyzing a contract/document uploaded by the user.
Analyze it from three perspectives simultaneously:
1. Legal risk (termination, liability, payment risk, compliance gaps)
2. Operational execution (obligations, deadlines, deliverables)
3. Business impact (negotiation levers, decision readiness)

Inputs:
- doc_meta: metadata about the document
- chunks: text chunks extracted from the PDF
- preextract_hints: dates and headings pre-extracted from the document

IMPORTANT: Your entire output MUST be written in {{OUTPUT_LANGUAGE}}.
This includes all summaries, descriptions, labels, questions, explanations, and any other text fields.
Only keep proper nouns, legal terms, and direct quotes from the document in their original language.

Rules:
1. Use only provided chunks and metadata. Do not invent facts.
2. Every important claim needs at least one evidence item.
3. If unclear, set certainty to low and add an open question.
4. Keep wording short and business-readable.
5. Confidence scores must be in range 0..99 (never 100).

Return JSON:
{
  "summary": "string (executive summary of the document)",
  "key_dates": [
    {
      "date": "YYYY-MM-DD|null",
      "label": "string",
      "description": "string",
      "certainty": "high|medium|low",
      "evidence": [Evidence]
    }
  ],
  "termination": {
    "notice_period": "string|null",
    "renewal": "string|null",
    "for_cause": "string|null",
    "certainty": "high|medium|low",
    "evidence": [Evidence]
  },
  "obligations": [
    {
      "party": "string",
      "obligation": "string",
      "deadline": "string|null",
      "consequence": "string|null",
      "certainty": "high|medium|low",
      "evidence": [Evidence]
    }
  ],
  "risks": [
    {
      "risk": "string",
      "severity": "high|medium|low",
      "likelihood": "high|medium|low",
      "mitigation": "string",
      "certainty": "high|medium|low",
      "evidence": [Evidence]
    }
  ],
  "opportunities": [
    {
      "opportunity": "string",
      "value": "high|medium|low",
      "action": "string",
      "certainty": "high|medium|low",
      "evidence": [Evidence]
    }
  ],
  "open_questions": [
    {"question": "string", "impact": "high|medium|low", "why": "string"}
  ],
  "evidence": [Evidence],
  "confidence": {
    "score": 0,
    "overall_score": 0,
    "explanation": "string"
  },
  "final_report": {
    "executive_summary": "string",
    "key_dates": [
      {"date": "YYYY-MM-DD|null", "label": "string", "description": "string", "certainty": "high|medium|low", "evidence": [Evidence]}
    ],
    "top_obligations": [
      {"party": "string", "obligation": "string", "deadline": "string|null", "certainty": "high|medium|low", "evidence": [Evidence]}
    ],
    "top_risks": [
      {"risk": "string", "severity": "high|medium|low", "likelihood": "high|medium|low", "mitigation": "string", "evidence": [Evidence]}
    ],
    "top_opportunities": [
      {"opportunity": "string", "value": "high|medium|low", "action": "string", "evidence": [Evidence]}
    ],
    "open_questions": [{"question": "string", "impact": "high|medium|low", "why": "string"}],
    "confidence": {"overall_score": 0, "explanation": "string"}
  }
}

Evidence schema:
{"chunk_id": "string", "page_start": 0, "page_end": 0, "snippet": "string"}
