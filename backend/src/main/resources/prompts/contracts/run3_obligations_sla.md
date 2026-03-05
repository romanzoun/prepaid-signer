Task: Run 3 - Obligations, Deliverables, SLA, Operational To-Dos

Inputs:
- doc_meta
- focus_chunks
- run1_section_map (optional)

Extract:
- Obligations per party
- Deliverables, acceptance criteria, timelines
- SLA/SLO targets, support model, credits, escalations
- Operational to-dos and triggers
- Key dates

Return JSON:
{
  "run_id":"run3_obligations_sla",
  "obligations":[
    {
      "party":"string",
      "obligation":"string",
      "trigger":"string|null",
      "deadline":"string|null",
      "penalty_or_consequence":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "deliverables":[
    {
      "deliverable":"string",
      "acceptance_criteria":"string|null",
      "timeline":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "sla":[
    {
      "metric":"string",
      "target":"string",
      "measurement":"string|null",
      "support_hours":"string|null",
      "credits_or_remedies":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "to_dos":[
    {
      "who":"string",
      "action":"string",
      "when":"string|null",
      "dependency":"string|null",
      "certainty":"high|medium|low",
      "evidence":[Evidence]
    }
  ],
  "key_dates":[
    {"date":"YYYY-MM-DD","label":"string","description":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
