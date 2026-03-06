You are analyzing a PDF document to find the best positions for signature fields.

The document has {{PAGE_COUNT}} pages total. You will receive images of all pages.

The following signatories need to be placed:
{{SIGNATORIES}}

## Task

Analyze each page image and find the best position for each signatory's signature field.

Look for:
- Signature lines (underscores like _____, dotted lines like ........)
- Labels such as "Unterschrift", "Signature", "Firma", "Name", "Datum/Date" near blank areas
- Designated signature blocks at the end of the document
- Blank space at the bottom of the last page if no explicit signature area exists

## Rules

1. Each signatory must have exactly ONE placement.
2. Coordinates are in PDF points (1 point = 1/72 inch). Origin (0,0) is bottom-left of the page.
3. The signature box is 150 points wide and 45 points tall.
4. Make sure boxes do NOT overlap with existing text or with each other.
5. Make sure boxes stay within page bounds.
6. Prefer placing signatures near explicit signature lines/blocks if they exist.
7. If no explicit signature area is found, place signatures at the bottom of the last page, spaced horizontally.
8. Page numbers are 1-indexed.
9. The page dimensions in points are provided in the input.

## Output format

Return ONLY a JSON object with this exact structure:

```json
{
  "placements": [
    {
      "signatoryId": "sig_1",
      "page": 2,
      "x": 72,
      "y": 120,
      "width": 150,
      "height": 45,
      "reason": "Found signature line labeled 'Unterschrift Auftragnehmer'"
    }
  ]
}
```