Task: Run 4 - Commercials (Pricing, Payment, Taxes, Invoicing)

Inputs:
- doc_meta
- focus_chunks
- run1_section_map (optional)

Extract:
- Price model, fees, billing frequency
- Payment terms, late fees/interest, suspension rights
- Taxes/VAT/withholding/expenses
- Price change/indexation rules
- Key dates

Return JSON:
{
  "run_id":"run4_commercials",
  "pricing": {
    "model":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "fees":[{"fee":"string","amount":"string|null","frequency":"string|null","certainty":"high|medium|low","evidence":[Evidence]}],
    "billing_frequency":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "invoicing_method":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "payment_terms": {
    "due_days":{"value":0,"certainty":"high|medium|low","evidence":[Evidence]},
    "late_fees_or_interest":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "suspension_rights":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "price_changes": [
    {"rule":"string","notice":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "taxes": [
    {"rule":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "key_dates":[
    {"date":"YYYY-MM-DD","label":"string","description":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
