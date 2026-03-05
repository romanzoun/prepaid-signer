Task: Run 7 - IP, Assignment, Subcontracting, Disputes, Notices

Inputs:
- doc_meta
- focus_chunks
- run1_section_map (optional)

Extract:
- IP ownership and license grants/restrictions
- Assignment/change of control and subcontracting
- Governing law, dispute resolution, venue/arbitration
- Notice methods and addresses

Return JSON:
{
  "run_id":"run7_misc",
  "ip": {
    "ownership":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "licenses":[{"license":"string","restrictions":"string|null","certainty":"high|medium|low","evidence":[Evidence]}]
  },
  "assignment": [
    {"rule":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "subcontracting": [
    {"rule":"string","certainty":"high|medium|low","evidence":[Evidence]}
  ],
  "disputes": {
    "process":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]},
    "forum_or_arbitration":{"value":"string|null","certainty":"high|medium|low","evidence":[Evidence]}
  },
  "notices": {
    "methods":[{"method":"string","certainty":"high|medium|low","evidence":[Evidence]}],
    "addresses":[{"party":"string","address":"string","certainty":"high|medium|low","evidence":[Evidence]}]
  },
  "open_questions":[{"question":"string","impact":"high|medium|low","why":"string"}]
}

Evidence schema:
{"chunk_id":"string","page_start":0,"page_end":0,"snippet":"string"}
