Task: Run 2 - Term, Renewal, Termination, Notice

Inputs:
- doc_meta
- focus_chunks (if empty use all chunks)
- run1_section_map (optional)

Extract:
- Initial term, renewal, auto-renewal, minimum term
- Ordinary termination: notice period, notice window, form and delivery requirements
- Termination for cause: triggers, cure periods, immediate termination events
- Effects of termination: fees, refunds, data return/deletion, survival clauses
- Key dates

Return JSON:
{
  "run_id":"run2_termination",
  "term": {
    "initial_term": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "start_date_rule": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "renewal": {
      "auto_renewal": {"value":true,"certainty":"high|medium|low","evidence":[Evidence]},
      "renewal_period": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
      "notice_window": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
    }
  },
  "termination": {
    "ordinary": {
      "notice_period_days": {"value":0,"certainty":"high|medium|low","evidence":[Evidence]},
      "notice_period_text": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
      "form_requirement": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
      "delivery_method": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
    },
    "for_cause": {
      "triggers":[{"trigger":"string","certainty":"high|medium|low","evidence":[Evidence]}],
      "cure_period": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
      "immediate_termination_triggers":[{"trigger":"string","certainty":"high|medium|low","evidence":[Evidence]}]
    }
  },
  "effects": {
    "fees_due_upon_termination": [{"item":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "refund_policy": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "data_handling_upon_termination": {"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "survival": [{"clause":"string","certainty":"high|medium|low","evidence":[Evidence]}]
  },
  "key_dates": [
    {"date":"YYYY-MM-DD","label":"string","description":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "open_questions": [{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
