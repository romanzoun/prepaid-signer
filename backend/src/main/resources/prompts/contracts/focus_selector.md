Task: Focus Chunk Selector (optional)

Inputs:
- chunks
- run1_section_map

Goal:
Return a compact per-domain chunk list for downstream extraction.
Prioritize chunks that mention the domain explicitly or semantically.

Return JSON:
{
  "run_id":"focus_selector",
  "domains":{
    "termination":["chunk_id"],
    "commercials":["chunk_id"],
    "liability":["chunk_id"],
    "privacy_security":["chunk_id"],
    "obligations_sla":["chunk_id"],
    "misc":["chunk_id"]
  }
}
