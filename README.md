# test-gap-finder

[![CI](https://github.com/niuxinhuai/test-gap-finder/actions/workflows/ci.yml/badge.svg)](https://github.com/niuxinhuai/test-gap-finder/actions/workflows/ci.yml)

Inspect a git diff and suggest focused tests that should be added or run.

检查 git diff，提示应该补充或运行的重点测试。

## English

### Install

```bash
npm install -g test-gap-finder
```

For local development:

```bash
npm install
npm link
test-gap-finder --help
```

### Features

- Scans working tree or staged changes.
- Maps changed source files to likely test file candidates.
- Suggests focused test types by source path: API, UI, auth, schema, or generic behavior.
- Supports `.test-gap-finder.json`, ignored paths, custom source/test patterns, and monorepo package hints.
- Can fail CI or hooks when obvious gaps exist.

### Usage

```bash
test-gap-finder
test-gap-finder --base main
test-gap-finder --staged --fail-on-gap
test-gap-finder --config examples/test-gap-finder.json
test-gap-finder --json
```

### Automation

Use as an advisory check first; turn on --fail-on-gap only after your repo naming conventions are predictable.

### Test

```bash
npm test
npm --cache /tmp/npm-cache pack --dry-run .
```

## 中文

### 安装

```bash
npm install -g test-gap-finder
```

本地开发：

```bash
npm install
npm link
test-gap-finder --help
```

### 功能

- 支持扫描工作区或 staged 变更。
- 把变更源码映射到可能的测试文件候选。
- 按路径类型建议 API、UI、权限、schema 或通用行为测试。
- 支持 `.test-gap-finder.json`、忽略路径、自定义源码/测试匹配规则和 monorepo package 提示。
- 发现明显缺口时可用于 CI 或 hook 失败。

### 用法

```bash
test-gap-finder
test-gap-finder --base main
test-gap-finder --staged --fail-on-gap
test-gap-finder --json
```

### 自动化

Use as an advisory check first; turn on --fail-on-gap only after your repo naming conventions are predictable.

### 测试

```bash
npm test
npm --cache /tmp/npm-cache pack --dry-run .
```
