export const requiredColumns = Object.freeze([
  "record_id",
  "source_url",
  "selection_text",
  "observation",
  "unresolved_question",
  "reviewed_on",
  "state"
]);

export const requiredValueColumns = Object.freeze([
  "record_id",
  "source_url",
  "selection_text",
  "observation",
  "reviewed_on",
  "state"
]);

export const allowedStates = Object.freeze([
  "observed",
  "unresolved",
  "recheck"
]);

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function daysBetween(earlier, later) {
  return Math.floor((later.getTime() - earlier.getTime()) / 86_400_000);
}

function normalizeSourceUrl(value) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function incrementStateCount(stateCounts, state) {
  if (allowedStates.includes(state)) stateCounts[state] += 1;
}

export function validateEvidence({ headers, records }, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const staleAfterDays = Number.isFinite(options.staleAfterDays)
    ? options.staleAfterDays
    : 45;
  const errors = [];
  const warnings = [];
  const seenIds = new Map();
  const stateCounts = { observed: 0, unresolved: 0, recheck: 0 };

  for (const column of requiredColumns) {
    if (!headers.includes(column)) errors.push({ type: "missing_column", column });
  }

  for (const record of records) {
    const values = record.values;

    for (const column of requiredValueColumns) {
      if (!values[column]) {
        errors.push({ type: "missing_value", row: record.rowNumber, column });
      }
    }

    if (values.record_id) {
      const firstRow = seenIds.get(values.record_id);
      if (firstRow) {
        errors.push({
          type: "duplicate_record_id",
          row: record.rowNumber,
          firstRow,
          value: values.record_id
        });
      } else {
        seenIds.set(values.record_id, record.rowNumber);
      }
    }

    if (values.source_url && !normalizeSourceUrl(values.source_url)) {
      errors.push({ type: "invalid_source_url", row: record.rowNumber, value: values.source_url });
    }

    if (values.state && !allowedStates.includes(values.state)) {
      errors.push({
        type: "invalid_state",
        row: record.rowNumber,
        value: values.state,
        allowed: allowedStates
      });
    } else {
      incrementStateCount(stateCounts, values.state);
    }

    if (values.state === "unresolved" && !values.unresolved_question) {
      errors.push({ type: "missing_unresolved_question", row: record.rowNumber });
    }

    if (values.state === "observed" && values.unresolved_question) {
      warnings.push({ type: "question_on_observed_state", row: record.rowNumber });
    }

    if (values.state === "recheck") {
      warnings.push({ type: "recheck_required", row: record.rowNumber });
    }

    if (values.reviewed_on) {
      const reviewedAt = parseIsoDate(values.reviewed_on);
      if (!reviewedAt) {
        errors.push({ type: "invalid_review_date", row: record.rowNumber, value: values.reviewed_on });
      } else {
        const ageDays = daysBetween(reviewedAt, now);
        if (ageDays < 0) {
          errors.push({ type: "future_review_date", row: record.rowNumber, value: values.reviewed_on });
        } else if (ageDays > staleAfterDays) {
          warnings.push({
            type: "stale_review",
            row: record.rowNumber,
            ageDays,
            thresholdDays: staleAfterDays
          });
        }
      }
    }
  }

  return {
    summary: {
      rowCount: records.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      stateCounts
    },
    errors,
    warnings
  };
}
