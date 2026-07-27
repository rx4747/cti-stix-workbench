import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const coverage = JSON.parse(
  await readFile(path.join(repositoryRoot, "standards/stix-2.1-coverage.json"), "utf8"),
);

assert.equal(coverage.contract_version, 2);
assert.equal(coverage.rows.length, 55);
assert.equal(new Set(coverage.rows.map((row) => row.id)).size, 55);

const validStates = new Set(["planned", "implemented", "verified", "not-applicable"]);
let verified = 0;
let applicable = 0;
for (const row of coverage.rows) {
  for (const [capability, result] of Object.entries(row.capabilities)) {
    assert.ok(validStates.has(result.status), `${row.id}.${capability} has bad state`);
    if (result.status !== "not-applicable") applicable += 1;
    if (result.status === "verified") verified += 1;
    if (result.status === "not-applicable") {
      assert.ok(result.rationale, `${row.id}.${capability} needs a rationale`);
    }
    for (const evidence of result.evidence) {
      await access(path.join(repositoryRoot, evidence));
    }
  }
}

console.log(
  `Coverage contract is consistent: ${verified}/${applicable} applicable capabilities verified.`,
);
