#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`test-gap-finder

Usage:
  test-gap-finder [--base HEAD] [--json]`);
  process.exit(0);
}
const json = args.includes('--json');
const baseIndex = args.indexOf('--base');
const base = baseIndex >= 0 ? args[baseIndex + 1] : 'HEAD';
function git(params) { return execFileSync('git', params, { encoding: 'utf8' }).trim(); }
let lines = '';
try { lines = git(['diff', base, '--name-status']); } catch { console.error('test-gap-finder must be run inside a git repository.'); process.exit(1); }
const files = lines.split('\n').filter(Boolean).map((line) => {
  const [status, ...rest] = line.split(/\s+/);
  return { status, path: rest.join(' ') };
});
const isTest = (p) => /(^|\/)(__tests__|tests?|spec)\/|\.(test|spec)\.(js|ts|tsx|jsx|py)$/.test(p);
const source = files.filter((f) => /\.(js|ts|tsx|jsx|py|go|rs|java|kt|swift|ets)$/.test(f.path) && !isTest(f.path));
const tests = files.filter((f) => isTest(f.path));
function suggestion(file) {
  if (/api|route|controller|service/i.test(file.path)) return 'Add request/response, error-path, and permission tests.';
  if (/ui|component|page|view/i.test(file.path)) return 'Add state, empty/error/loading, and interaction coverage.';
  if (/auth|permission|role|security/i.test(file.path)) return 'Add deny-by-default and role boundary tests.';
  if (/schema|migration|model/i.test(file.path)) return 'Add migration/serialization compatibility checks.';
  return 'Add a focused regression test around the changed behavior.';
}
const gaps = source.map((file) => ({ file: file.path, suggestion: suggestion(file) }));
const result = { sourceChanged: source.map((f) => f.path), testsChanged: tests.map((f) => f.path), gaps: tests.length ? [] : gaps };
if (json) { console.log(JSON.stringify(result, null, 2)); process.exit(0); }
console.log(`# Test Gap Finder

## Source changed
${source.length ? source.map((f) => `- ${f.path}`).join('\n') : '- No source files detected.'}

## Tests changed
${tests.length ? tests.map((f) => `- ${f.path}`).join('\n') : '- No test files changed.'}

## Suggested tests
${result.gaps.length ? result.gaps.map((g) => `- ${g.file}: ${g.suggestion}`).join('\n') : '- Test files changed in this diff; review whether they cover the modified behavior.'}
`);
