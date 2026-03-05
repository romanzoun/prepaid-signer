Task: Run 5 - Liability, Indemnities, Warranties, Limitations

Inputs:
- doc_meta
- focus_chunks
- run1_section_map (optional)

Extract:
- Liability cap(s), scope, excluded damages, uncapped carve-outs
- Indemnities and their procedures/limits
- Warranties, disclaimers, remedy limits

Return JSON:
{
  "run_id":"run5_liability",
  "liability": {
    "cap":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "cap_scope":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "excluded_damages":[{"type":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "carve_outs_uncapped":[{"item":"string","certainty":"high|medium|low","evidence":[Evidence]}]
  },
  "indemnities":[
    {
      "who_indemnifies":"string",
      "who_is_indemnified":"string",
      "scope":"string",
      "procedure":"string|null",
      "limits":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "warranties":[
    {"warranty":"string","disclaimer_or_limit":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "remedies":[
    {"remedy":"string","when_applies":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
