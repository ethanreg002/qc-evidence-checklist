import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "../lib/csv.mjs";
import { validateEvidence } from "../lib/validate-evidence.mjs";

const headers = "record_id,source_url,selection_text,observation,unresolved_question,reviewed_on,state";

test("accepts a traceable observed record", () => {
  const data = parseCsv([
    headers,
    "demo-001,https://example.com/item,Blue option,Image shows a blue label,,2026-07-20,observed"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z") });

  assert.equal(report.summary.errorCount, 0);
  assert.equal(report.summary.warningCount, 0);
  assert.equal(report.summary.stateCounts.observed, 1);
});

test("reports missing columns", () => {
  const data = parseCsv([
    "record_id,source_url,state",
    "demo-001,https://example.com/item,observed"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z") });

  assert.deepEqual(
    report.errors.filter((error) => error.type === "missing_column").map((error) => error.column),
    ["selection_text", "observation", "unresolved_question", "reviewed_on"]
  );
});

test("reports duplicate record IDs and invalid source URLs", () => {
  const data = parseCsv([
    headers,
    "demo-001,https://example.com/one,Blue option,Blue label,,2026-07-20,observed",
    "demo-001,ftp://example.com/two,Red option,Red label,,2026-07-20,observed"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z") });

  assert.deepEqual(
    report.errors.map((error) => error.type).sort(),
    ["duplicate_record_id", "invalid_source_url"]
  );
});

test("requires a question for unresolved records", () => {
  const data = parseCsv([
    headers,
    "demo-001,https://example.com/item,Blue option,Image and label conflict,,2026-07-20,unresolved"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z") });

  assert.equal(report.errors[0].type, "missing_unresolved_question");
});

test("rejects future dates and warns about stale reviews", () => {
  const data = parseCsv([
    headers,
    "future,https://example.com/future,Blue option,Blue label,,2026-07-28,observed",
    "stale,https://example.com/stale,Red option,Red label,,2026-01-01,observed"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z"), staleAfterDays: 45 });

  assert.equal(report.errors[0].type, "future_review_date");
  assert.equal(report.warnings[0].type, "stale_review");
});

test("marks recheck records and questions on observed records as warnings", () => {
  const data = parseCsv([
    headers,
    "observed-question,https://example.com/one,Blue option,Blue label,Is the label current?,2026-07-20,observed",
    "needs-recheck,https://example.com/two,Red option,Old red label,,2026-07-20,recheck"
  ].join("\n"));
  const report = validateEvidence(data, { now: new Date("2026-07-27T00:00:00Z") });

  assert.deepEqual(
    report.warnings.map((warning) => warning.type).sort(),
    ["question_on_observed_state", "recheck_required"]
  );
});

test("parses quoted observations containing commas", () => {
  const data = parseCsv([
    headers,
    'demo-001,https://example.com/item,Blue option,"Image shows blue, white, and black areas",,2026-07-20,observed'
  ].join("\n"));

  assert.equal(data.records[0].values.observation, "Image shows blue, white, and black areas");
});
