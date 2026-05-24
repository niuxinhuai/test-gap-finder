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

### Usage

Run before opening a PR.

```bash
test-gap-finder
test-gap-finder --base main
test-gap-finder --json
```

### Status

This is an MVP designed to be useful immediately and easy to extend. It has no runtime dependencies and targets Node.js 18+.

### Test

```bash
npm test
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

### 用法

发 PR 前运行。

```bash
test-gap-finder
test-gap-finder --base main
test-gap-finder --json
```

### 当前状态

这是一个可以直接使用的 MVP，重点是小、清晰、容易二次开发。运行时无第三方依赖，要求 Node.js 18+。

### 测试

```bash
npm test
```
