Task: Confidence Scoring

Input:
- consensus_output

Goal:
Compute explainable confidence scores based on agreement and evidence quality.
Do not add facts.

Scoring guidance:
- Start from 50.
- Add up to +30 for high critical-claim agreement and strong direct evidence.
- Subtract up to -30 for contradictions, low evidence, missing sections, and ambiguity.
- Clamp to 0..100.

Return JSON:
{
  "run_id":"confidence_scorer",
  "overall_score":0,
  "per_domain_score": {
    "termination":0,
    "commercials":0,
    "liability":0,
    "privacy_security":0,
    "obligations_sla":0,
    "misc":0
  },
  "drivers_positive":[
    {"driver":"string","weight":"+0..+30","details":"string"}
  ],
  "drivers_negative":[
    {"driver":"string","weight":"-0..-30","details":"string"}
  ],
  "human_review_required": {
    "value": true,
    "reasons":[{"reason":"string","severity":"high|medium|low"}]
  }
}
