# Manual QC evidence review checklist

Run the validator first, then complete this manual pass.

## Source

- Open `source_url` and confirm the final domain and page purpose.
- Reject short links, login walls, editor URLs, thin redirects, and unrelated destinations.
- Confirm the source is current enough for the decision being documented.

## Selection

- Match `selection_text` to the visible selected option.
- Do not infer a missing selection from a title, thumbnail, or similar-looking row.
- Move the record to `unresolved` when labels conflict.

## Evidence

- Keep `observation` neutral and limited to visible details.
- Do not write `official`, `verified`, `guaranteed`, a QC pass, authenticity result, score, ranking, or order outcome without separate auditable evidence.
- Write a concrete `unresolved_question` instead of filling gaps with assumptions.

## Freshness

- Set `reviewed_on` only after opening the current page.
- Preserve older notes as history rather than overwriting their dates.
- Recheck price, stock, policies, images, options, warehouse details, and shipping information on their live sources.
