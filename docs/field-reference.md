# QC evidence field reference

## `record_id`

A stable identifier for one note. It must be non-empty and unique within the CSV. Do not reuse an ID for a different selection or source.

## `source_url`

The final HTTP or HTTPS page reviewed. Avoid shortened links, editor URLs, login-only paths, internal project URLs, and redirects whose final domain has not been checked.

## `selection_text`

The exact visible size, color, version, package, or other option label. Copy it from the current page instead of paraphrasing from memory.

## `observation`

One neutral statement about what the current page visibly shows. An observation is not a QC pass, authenticity result, quality score, or prediction about the final item.

## `unresolved_question`

The next concrete question when `state` is `unresolved`. It may be blank for an `observed` record. A question on an observed row produces a warning because the state and note may disagree.

## `reviewed_on`

The date the source was actually reviewed, formatted as `YYYY-MM-DD`. Future dates are invalid. Reviews older than the configured threshold produce a warning.

## `state`

- `observed`: the source, exact selection, and neutral observation are present.
- `unresolved`: a gap or conflict remains and `unresolved_question` is required.
- `recheck`: the source or note needs a fresh review before use.
