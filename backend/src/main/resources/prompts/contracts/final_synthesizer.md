Task: Final Synthesizer for business stakeholders

Inputs:
- doc_meta
- consensus_output
- confidence_output

Goal:
Generate final business-facing output from consensus only.
Do not introduce facts not present in inputs.
If uncertain or conflicting, make that explicit.

Return JSON:
{
  "run_id":"final_synthesizer",
  "executive_summary":"string",
  "key_dates":[
    {"label":"string","date":"YYYY-MM-DD|null","description":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "top_obligations":[
    {"party":"string","obligation":"string","deadline":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "top_risks":[
    {"risk":"string","severity":"high|medium|low","likelihood":"high|medium|low","why":"string","mitigation":"string","evidence":[Evidence]}
  ],
  "top_opportunities":[
    {"opportunity":"string","value":"high|medium|low","how_to_realize":"string","evidence":[Evidence]}
  ],
  "negotiation_checklist":[
    {"item":"string","rationale":"string","priority":"high|medium|low"}
  ],
  "confidence":{
    "overall_score":0,
    "explanation":"string",
    "human_review_required":true
  },
  "conflicts_highlight":[
    {"topic":"string","description":"string","alternatives":["string"],"recommendation":"string"}
  ],
  "open_questions":[
    {"question":"string","impact":"high|medium|low","why":"string"}
  ]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
