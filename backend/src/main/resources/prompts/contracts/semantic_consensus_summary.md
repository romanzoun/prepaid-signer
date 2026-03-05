Task: Semantic consensus and final summary from 3 cases

Inputs:
- doc_meta
- cases: JSON array with exactly 3 case results from independent perspectives

Goal:
Merge the 3 case outputs into one canonical, business-friendly result.
Compute semantic agreement and confidence.
If cases disagree, keep conflict transparent and explain.

Rules:
1. Use only the provided case array.
2. Do not invent facts not present in at least one case.
3. Prefer items with stronger, direct evidence and agreement across cases.
4. Keep output concise and structured for non-technical stakeholders.
5. Confidence scores must be in range 0..99 (never 100).
6. Confidence explanation must explicitly reference the semantic agreement across the 3 cases.

Return JSON:
{
  "run_id":"semantic_consensus_summary",
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
  "evidence":[Evidence],
  "consensus":{
    "mode":"consensus3",
    "agreement_score":0.0,
    "agreement_label":"high|medium|low",
    "agreement_reason":"string",
    "conflicts":[
      {
        "topic":"string",
        "alternatives":["string"],
        "resolution":"merged|picked|needs_human"
      }
    ]
  },
  "confidence":{
    "score":0,
    "overall_score":0,
    "explanation":"string"
  },
  "final_report":{
    "executive_summary":"string",
    "key_dates":[
      {"date":"YYYY-MM-DD|null","label":"string","description":"string","certainty":"high|medium|low","evidence":[Evidence]}
    ],
    "top_obligations":[
      {"party":"string","obligation":"string","deadline":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
    ],
    "top_risks":[
      {"risk":"string","severity":"high|medium|low","likelihood":"high|medium|low","mitigation":"string","evidence":[Evidence]}
    ],
    "top_opportunities":[
      {"opportunity":"string","value":"high|medium|low","action":"string","evidence":[Evidence]}
    ],
    "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}],
    "confidence":{"overall_score":0,"explanation":"string"}
  }
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
