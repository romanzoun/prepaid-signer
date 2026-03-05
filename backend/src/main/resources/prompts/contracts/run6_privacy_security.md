Task: Run 6 - Privacy, Security, Data Processing, Audit Rights

Inputs:
- doc_meta
- focus_chunks
- run1_section_map (optional)

Extract:
- Data processing roles/purpose/categories/locations/subprocessors/retention
- Security measures, incident response, breach timeline
- Audit and compliance rights/duties
- Confidentiality scope, exceptions, duration

Return JSON:
{
  "run_id":"run6_privacy_security",
  "data_protection": {
    "roles":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "purpose":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "data_categories":[{"category":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "data_location":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "subprocessors":[{"name_or_rule":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "retention_deletion":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "security": [
    {"measure":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "incident_response": {
    "breach_notification_timeline":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "cooperation_duties":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "audit_and_compliance": [
    {"right_or_duty":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "confidentiality": {
    "scope":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "exceptions":[{"item":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "duration":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
