# claude-playwright

[![Playwright Tests](https://github.com/sabolothbrok/claude-playwright-demo/actions/workflows/playwright.yml/badge.svg)](https://github.com/sabolothbrok/claude-playwright-demo/actions/workflows/playwright.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Playwright](https://img.shields.io/badge/Playwright-1.62-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

A production-style Playwright + TypeScript end-to-end test automation
framework for [saucedemo.com](https://www.saucedemo.com/), built around a
Page Object Model, a documented test strategy, and a CI pipeline that
actually gates the code — not a single-file smoke test.

📄 **[Read the full E2E Test Automation Strategy →](docs/E2E-Test-Automation-Strategy.pdf)**
(risk-based prioritization, the test pyramid, quality gates, CI/CD design,
maintenance model, and a worked example from brief to shipped test.)

## About the author

**Jafeth Briceño** — Senior QA Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-jbricenojaen-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jbricenojaen)
[![GitHub](https://img.shields.io/badge/GitHub-sabolothbrok-181717?logo=github&logoColor=white)](https://github.com/sabolothbrok)
[![Email](https://img.shields.io/badge/Email-jafeth.bj%40gmail.com-D14836?logo=gmail&logoColor=white)](mailto:jafeth.bj@gmail.com)

This repository is a working sample of how I structure, document, and
operate an E2E automation framework end-to-end: strategy → architecture →
implementation → CI/CD → maintenance.

## What this project demonstrates

- **Page Object Model** done properly — no raw locators in test files, one
  class per screen, assertions kept out of page objects except for
  `expectLoaded()` guards.
- **Custom fixtures** (`src/fixtures/pages.fixture.ts`) that inject
  ready-to-use page objects and an `authenticatedPage` fixture that skips
  repeating the login flow across tests.
- **Cross-browser + mobile coverage**: Chromium, Firefox, WebKit, and a
  mobile Chrome (Pixel 7) project, all exercised in CI.
- **A real CI/CD pipeline**, not just "tests exist": a 4-way browser matrix,
  cached browser binaries, HTML/JUnit reporting, trace/video/screenshot
  artifacts on failure, and a nightly scheduled run — see
  [CI](#cicd-pipeline) below.
- **Tagging discipline** (`@smoke` / `@regression`) so the suite can be run
  fast in a PR loop or fully overnight.
- **An AI-augmented workflow**: the [Playwright MCP server](https://github.com/microsoft/playwright-mcp)
  is wired in so selectors and behavior are confirmed against the *live*
  app before a single line of test code is written, and a set of scoped
  Claude Code subagents (Generator → Runner → Analyzer → Healer →
  Optimizer) codify the automation lifecycle — see [Agents](#agents).
- **Written strategy, not just code** — the linked PDF above is the kind of
  document I'd hand to a team lead before writing a single test.

## Stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model under `src/pages/`
- Custom fixtures (`src/fixtures/pages.fixture.ts`)
- Playwright MCP server (`.mcp.json`) for live-app-verified test authoring
- GitHub Actions CI (`.github/workflows/playwright.yml`)
- A Claude Code skill (`.claude/skills/playwright-testing/SKILL.md`) documenting
  the framework's conventions
- Five Claude Code subagents (`.claude/agents/`) covering the automation lifecycle

## Project structure

```
docs/                                         Test strategy (PDF + HTML)
.claude/skills/playwright-testing/SKILL.md    Claude Code skill: framework conventions
.claude/agents/                               Generator/Runner/Analyzer/Healer/Optimizer subagents
.github/workflows/playwright.yml              CI pipeline
src/
  pages/          Page Objects (LoginPage, InventoryPage, CartPage, ...)
  fixtures/       Custom Playwright fixtures
  data/           Test data (users, checkout info)
  utils/          Small pure helpers
tests/            *.spec.ts specs (login, inventory, cart, checkout)
playwright.config.ts
.mcp.json         Registers the Playwright MCP server for Claude
LICENSE           MIT
```

## Getting started

```bash
npm install
npx playwright install --with-deps   # downloads browser binaries
cp .env.example .env                 # optional, defaults already match SauceDemo
```

## Running tests

```bash
npm test                # full suite, all projects
npm run test:chromium   # single browser (fastest inner loop)
npm run test:headed     # watch the browser
npm run test:ui         # Playwright UI mode
npm run test:debug      # step through with the Inspector
npm run test:smoke      # only tests tagged @smoke
npm run test:regression # only tests tagged @regression
npm run report          # open the last HTML report
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format
```

## Test accounts

All SauceDemo accounts share the password `secret_sauce`:
`standard_user`, `locked_out_user`, `problem_user`,
`performance_glitch_user`, `error_user`, `visual_user`.
See `src/data/users.ts`. (These are SauceDemo's own public demo
credentials, not a secret.)

## Writing new tests

See `.claude/skills/playwright-testing/SKILL.md` for the full conventions
(Page Object rules, fixture usage, tagging, how to use the Playwright MCP
server to confirm selectors against the live site before writing a test).

## CI/CD pipeline

Every push/PR to `main`/`master` runs the full suite across a
**chromium / firefox / webkit / mobile-chrome** matrix via GitHub Actions,
plus a nightly scheduled run and manual dispatch. Browser binaries are
cached per engine to keep runs fast, and the HTML report plus
trace/video/screenshot artifacts are uploaded for every run — pass or fail —
so a failure is debuggable straight from the Actions tab.

See it run live: [Actions tab](https://github.com/sabolothbrok/claude-playwright-demo/actions/workflows/playwright.yml).

## Agents

`.claude/agents/` defines five purpose-built Claude Code subagents that
cover the automation lifecycle, each scoped to one responsibility with its
own tool permissions:

| Agent | Role | Hands off to |
|---|---|---|
| **Generator** (`test-generator`) | Converts manual test cases / feature descriptions into new specs, verified live via Playwright MCP before any code is written. | Runner (to confirm the new spec passes) |
| **Runner** (`test-runner`) | Executes the suite (full, tagged, or a single spec) and reports a concise pass/fail summary with artifact links. | Analyzer (on any failure) |
| **Analyzer** (`test-analyzer`) | Diagnoses *why* a test failed — app regression, selector/UI drift, flaky, environment issue, or test bug — without changing code. | Healer (drift only) or the user (regression/flaky) |
| **Healer** (`test-healer`) | Fixes confirmed selector/UI drift, verifies the fix live, commits to a branch — never touches app regressions, never merges/pushes to main itself. | User (for review/merge) |
| **Optimizer** (`test-optimizer`) | Periodically reviews the whole suite for flakiness, duplication, slow tests, and convention drift; proposes or makes low-risk fixes on a branch. | User (for anything higher-risk) |

Typical loop: **Generator** adds coverage for a feature → **Runner** confirms
it's green → on any later CI failure, **Runner** reports it and **Analyzer**
diagnoses it → confirmed UI drift goes to **Healer**, a real regression goes
back to the team → **Optimizer** runs periodically (e.g. monthly) to keep
the suite itself healthy as it grows. Invoke any of them directly by name
(e.g. "use the test-generator agent to automate the checkout test cases")
or let Claude pick the right one based on the task.

## License

[MIT](LICENSE) © 2026 Jafeth Briceño
