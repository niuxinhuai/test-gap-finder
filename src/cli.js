#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VERSION = '0.1.0';
const args = process.argv.slice(2);
function has(flag) { return args.includes(flag); }
function value(flag, fallback) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : fallback; }
if (has('--help') || has('-h')) {
  console.log(`test-gap-finder v${VERSION}

Usage:
  test-gap-finder [--base HEAD] [--staged] [--json] [--fail-on-gap]

Options:
  --config <file>    Read JSON config. Default: .test-gap-finder.json when present.
  --base <ref>       Compare working tree against ref. Default: HEAD.
  --staged           Scan staged changes.
  --fail-on-gap      Exit 2 when obvious gaps exist.
  --json             Print JSON.
  --version          Print version.`);
  process.exit(0);
}
if (has('--version')) { console.log(VERSION); process.exit(0); }
const json = has('--json');
const staged = has('--staged');
const base = value('--base', 'HEAD');
function readConfig() {
  const configFile = value('--config', fs.existsSync('.test-gap-finder.json') ? '.test-gap-finder.json' : '');
  if (!configFile) return {};
  try { return JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch (error) {
    console.error(`Unable to read config ${configFile}: ${error.message}`);
    process.exit(1);
  }
}
function globish(pattern) {
  return new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')}$`);
}
const config = readConfig();
function git(params) { return execFileSync('git', params, { encoding: 'utf8' }).trim(); }
let lines = '';
try { lines = git(staged ? ['diff', '--cached', '--name-status'] : ['diff', base, '--name-status']); } catch { console.error('test-gap-finder must be run inside a git repository.'); process.exit(1); }
const files = lines.split('\n').filter(Boolean).map((line) => { const [status, ...rest] = line.split(/\s+/); return { status, path: rest.join(' ') }; })
  .filter((file) => !(config.ignore || []).some((pattern) => globish(pattern).test(file.path)));
const testRegex = new RegExp(config.testPattern || '(^|/)(__tests__|tests?|spec)/|\\.(test|spec)\\.(js|ts|tsx|jsx|py|go|rs|java|kt)$');
const sourceRegex = new RegExp(config.sourcePattern || '\\.(js|ts|tsx|jsx|py|go|rs|java|kt|swift|ets)$');
const isTest = (p) => testRegex.test(p);
const source = files.filter((f) => sourceRegex.test(f.path) && !isTest(f.path));
const tests = files.filter((f) => isTest(f.path));
function packageNameFor(file) {
  const parts = file.split('/');
  for (let i = parts.length - 1; i > 0; i -= 1) {
    const dir = parts.slice(0, i).join('/');
    const pkgFile = path.join(dir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      try { return JSON.parse(fs.readFileSync(pkgFile, 'utf8')).name || dir; } catch { return dir; }
    }
  }
  return '(root)';
}
function possibleTests(file) {
  const parsed = path.parse(file.path);
  const baseName = parsed.name.replace(/\.(service|controller|component|page|view)$/, '');
  return [
    path.join(parsed.dir, `${parsed.name}.test${parsed.ext}`),
    path.join(parsed.dir, `${parsed.name}.spec${parsed.ext}`),
    path.join('test', `${baseName}.test${parsed.ext}`),
    path.join('tests', `${baseName}.test${parsed.ext}`)
  ];
}
function suggestion(file) {
  if (/api|route|controller|service/i.test(file.path)) return 'Add request/response, error-path, permission, and backward-compatibility tests.';
  if (/ui|component|page|view/i.test(file.path)) return 'Add loading, empty, error, long-text, and interaction coverage.';
  if (/auth|permission|role|security/i.test(file.path)) return 'Add deny-by-default, role boundary, and privilege escalation tests.';
  if (/schema|migration|model/i.test(file.path)) return 'Add migration, serialization, and rollback compatibility checks.';
  return 'Add a focused regression test around the changed behavior.';
}
const gaps = source.map((file) => {
  const candidates = possibleTests(file);
  const existingCandidates = candidates.filter((candidate) => fs.existsSync(candidate));
  const touchedCandidates = tests.map((t) => t.path).filter((testPath) => candidates.includes(testPath));
  return { file: file.path, package: packageNameFor(file.path), existingCandidates, touchedCandidates, suggestion: suggestion(file), hasCoverageSignal: existingCandidates.length > 0 || touchedCandidates.length > 0 };
}).filter((gap) => !gap.hasCoverageSignal);
let scripts = {};
try { scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts || {}; } catch {}
const commands = [];
if (scripts.test) commands.push('npm test');
if (scripts['test:unit']) commands.push('npm run test:unit');
if (scripts['test:e2e']) commands.push('npm run test:e2e');
const packages = [...new Set(source.map((file) => packageNameFor(file.path)))];
const result = { base, staged, packages, sourceChanged: source.map((f) => f.path), testsChanged: tests.map((f) => f.path), gaps, suggestedCommands: commands };
if (json) console.log(JSON.stringify(result, null, 2));
else console.log(`# Test Gap Finder

## Source changed
${source.length ? source.map((f) => `- ${f.path}`).join('\n') : '- No source files detected.'}

## Tests changed
${tests.length ? tests.map((f) => `- ${f.path}`).join('\n') : '- No test files changed.'}

## Gaps
${gaps.length ? gaps.map((g) => `- ${g.file} (${g.package}): ${g.suggestion}`).join('\n') : '- No obvious test gap found from file names.'}

## Suggested commands
${commands.length ? commands.map((cmd) => `- ${cmd}`).join('\n') : '- No package test scripts detected.'}
`);
if (has('--fail-on-gap') && gaps.length) process.exit(2);
