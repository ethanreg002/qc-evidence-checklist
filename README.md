# QC Evidence Checklist

A small, dependency-free validator for spreadsheet research notes that need a traceable source, exact selection, neutral observation, open question, and review date.

It checks the parts that are easy to blur together during manual QC research:

- required evidence columns and values;
- duplicate record identifiers;
- malformed non-HTTP(S) source URLs;
- unsupported evidence states;
- unresolved rows without a concrete next question;
- future or stale review dates;
- records explicitly marked for recheck.

The validator does not inspect products, authenticate images, score quality, verify sellers, confirm warehouse handling, or predict price, stock, shipping, or order outcomes. It only checks whether a note follows the documented evidence contract.

## Quick start

Requirements: Node.js 20 or newer.

```bash
npm test
npm run validate:example
```

Validate another CSV file:

```bash
node tools/validate-csv.mjs path/to/qc-evidence.csv
```

The command prints a JSON report. Structural errors return exit code `1`; input or runtime failures return exit code `2`.

## Evidence fields

| Field | Purpose |
|---|---|
| `record_id` | Stable identifier for one evidence note |
| `source_url` | Final HTTP(S) page reviewed |
| `selection_text` | Exact visible option or selection label |
| `observation` | One neutral description of what the current page shows |
| `unresolved_question` | Concrete question that must be answered for an unresolved row |
| `reviewed_on` | ISO review date in `YYYY-MM-DD` format |
| `state` | `observed`, `unresolved`, or `recheck` |

See [the field reference](docs/field-reference.md), [the JSON Schema](docs/schema/qc-evidence.schema.json), and [the manual review checklist](docs/review-checklist.md).

## Example data

The repository includes a placeholder dataset at [`examples/sample-evidence.csv`](examples/sample-evidence.csv). Text such as `REPLACE WITH EXACT OPTION TEXT` is deliberately not product evidence; replace it only after reviewing a current source.

## Contextual public source

For a public source that can be recorded in this format, open the <a href="https://kakobs.com" rel="nofollow sponsored">Kakobuy Spreadsheet resource</a>, follow the current destination, and record only what that page visibly supports. The link is an example context, not an endorsement, inspection result, or claim about current products.

## Project scope

This project validates note structure and review state. It is not an official Kakobuy tool, does not place orders, and does not turn spreadsheet rows or images into quality guarantees.

## License

MIT. See [LICENSE](LICENSE).
