#!/usr/bin/env node
/**
 * Prepare for X.Y.Z release: set the `nextBump` field in
 * common/config/rush/version-policies.json so that Rush will bump from the
 * current version to the target version on the next publish.
 *
 * Usage: node .github/scripts/prepare-release.js <X.Y.Z>
 *
 * The file uses JSON-with-comments, so we don't JSON.parse it — we read the
 * current `version` with a regex and rewrite the `nextBump` line in place.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target || !/^\d+\.\d+\.\d+$/.test(target)) {
  console.error(`Usage: ${process.argv[1]} <X.Y.Z>`);
  process.exit(2);
}

const repoRoot = path.resolve(__dirname, '..', '..');
const policyPath = path.join(repoRoot, 'common/config/rush/version-policies.json');
const original = fs.readFileSync(policyPath, 'utf8');

const versionMatch = original.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/);
if (!versionMatch) {
  console.error('Could not find "version" field in version-policies.json');
  process.exit(1);
}
const current = versionMatch[1];
console.log(`Current version: ${current}`);
console.log(`Target version:  ${target}`);

if (current === target) {
  console.error(`Current version is already ${target}; nothing to do.`);
  process.exit(1);
}

const [cMaj, cMin, cPatch] = current.split('.').map(Number);
const [tMaj, tMin, tPatch] = target.split('.').map(Number);

let nextBump;
if (tMaj > cMaj && tMin === 0 && tPatch === 0) {
  nextBump = 'major';
} else if (tMaj === cMaj && tMin > cMin && tPatch === 0) {
  nextBump = 'minor';
} else if (tMaj === cMaj && tMin === cMin && tPatch > cPatch) {
  nextBump = 'patch';
} else {
  console.error(
    `Target ${target} is not a valid next semver bump from ${current}. ` +
      `Expected one of: ${cMaj}.${cMin}.${cPatch + 1} (patch), ` +
      `${cMaj}.${cMin + 1}.0 (minor), or ${cMaj + 1}.0.0 (major).`
  );
  process.exit(1);
}
console.log(`Computed nextBump: ${nextBump}`);

// Rewrite the "nextBump" line in place. Preserve indentation and trailing
// whitespace/newline exactly so the diff is the single intended change.
const nextBumpRegex = /(^\s*"nextBump"\s*:\s*")(prerelease|release|patch|minor|major)(")/m;
if (!nextBumpRegex.test(original)) {
  console.error('Could not find "nextBump" field in version-policies.json');
  process.exit(1);
}
const updated = original.replace(nextBumpRegex, `$1${nextBump}$3`);

if (updated === original) {
  console.log(`nextBump is already "${nextBump}"; no change needed.`);
  process.exit(0);
}

fs.writeFileSync(policyPath, updated);
console.log(`Updated nextBump to "${nextBump}" in ${policyPath}`);
