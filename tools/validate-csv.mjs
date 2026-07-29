import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "../lib/csv.mjs";
import { validateEvidence } from "../lib/validate-evidence.mjs";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node tools/validate-csv.mjs <file.csv>");
  process.exitCode = 2;
} else {
  try {
    const absolutePath = resolve(inputPath);
    const csv = await readFile(absolutePath, "utf8");
    const report = validateEvidence(parseCsv(csv));
    console.log(JSON.stringify({ file: absolutePath, ...report }, null, 2));
    if (report.summary.errorCount > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
