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
(risk-based prioritization, the test pyramid, pre-flight checks, CI/CD design,
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
  `expectLoaded()` guards. The rules are **enforced by lint**
  (`eslint-plugin-playwright` plus custom rules), so a spec that clicks a
  selector, calls `waitForTimeout`, or a Page Object that uses a CSS `#id`/`.class`
  locator fails the build instead of relying on review. Locators follow Playwright's
  order: `getByRole` → `getByLabel`/`getByPlaceholder`/`getByText` → `getByTestId`.
- **Custom fixtures** (`src/fixtures/pages.fixture.ts`) that inject
  ready-to-use page objects and an `authenticatedPage` fixture that skips
  repeating the login flow across tests.
- **Cross-browser + mobile coverage**: Chromium, Firefox, WebKit, and a
  mobile Chrome (Pixel 7) project, all exercised in CI.
- **A real CI/CD pipeline**, not just "tests exist": typecheck/lint/format
  checks that block the run, a 4-way browser matrix, cached browser binaries,
  trace/video/screenshot artifacts on failure, one merged
  [Allure report](#reporting), and a nightly scheduled run — see
  [CI](#cicd-pipeline) below.
- **Reports a manager can read**: results grouped by feature with severity,
  and every Page Object action recorded as a plain-language step
  ("Add to cart by name: Sauce Labs Backpack") instead of raw selectors.
- **Tagging discipline** (`@smoke` / `@regression`) so the suite can be run
  fast in a PR loop or fully overnight.
- **An AI-augmented workflow**: the [Playwright MCP server](https://github.com/microsoft/playwright-mcp)
  is wired in so selectors and behavior are confirmed against the *live*
  app before a single line of test code is written, and a set of scoped
  Claude Code subagents (Planner → *you approve* → Generator → Runner →
  Analyzer → Healer → Optimizer) codify the automation lifecycle, with a human
  approval gate before any test code is written — see [Agents](#agents).
- **Written strategy, not just code** — the linked PDF above is the kind of
  document I'd hand to a team lead before writing a single test.

## Stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model under `src/pages/`
- Custom fixtures (`src/fixtures/pages.fixture.ts`)
- Playwright MCP server (`.mcp.json`) for live-app-verified test authoring
- GitHub Actions CI (`.github/workflows/playwright.yml`), Dependabot, a PR checklist
- [Allure 3](https://allurereport.org/) for reporting (`allurerc.mjs`)
- A Claude Code skill (`.claude/skills/playwright-testing/SKILL.md`) documenting
  the framework's conventions
- Six Claude Code subagents (`.claude/agents/`) covering the automation lifecycle

## Project structure

```
docs/                                         Test strategy (PDF + HTML)
.claude/skills/playwright-testing/SKILL.md    Claude Code skill: framework conventions
.claude/agents/                               Planner/Generator/Runner/Analyzer/Healer/Optimizer subagents
.github/workflows/playwright.yml              CI: pre-flight checks, browser matrix, merged report
.github/                                      Dependabot, PR template, CODEOWNERS
allurerc.mjs                                  Report config (title, grouping by feature)
src/
  pages/          Page Objects (LoginPage, InventoryPage, CartPage, ...)
  fixtures/       Custom Playwright fixtures
  data/           Test data (users, products, checkout info)
  utils/          Helpers (money math, readable steps, report labels)
tests/            *.spec.ts specs (login, session, inventory, product detail, cart, checkout)
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
npm run report          # open the last Playwright HTML report
npm run report:allure   # build and open the Allure report (run the tests first)
```

## Pre-flight checks

```bash
npm run check          # typecheck + lint + format check (what CI runs first)
npm run format         # fix formatting
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

## Reporting

Tests are labeled automatically (`src/utils/allure-labels.ts`) and every Page
Object call becomes a readable step (`src/utils/steps.ts`), so the
[Allure](https://allurereport.org/) report groups by **feature**, marks
`@smoke` tests as **critical**, and shows each test as a script a manual tester
could follow. CI merges all four browsers into one self-contained
`index.html` (download the `allure-report` artifact and open it). Locally:

```bash
npm run test:chromium && npm run report:allure
```

The stock Playwright HTML report and JUnit XML are still produced alongside it.
Trends across runs need the report history to be published somewhere
persistent (e.g. GitHub Pages); that is not enabled yet.

## CI/CD pipeline

Every push/PR to `main`/`master` runs three stages on GitHub Actions, plus a
nightly scheduled run and manual dispatch:

1. **Pre-flight checks** — typecheck, lint and format check. If they fail, the
   browser matrix never starts.
2. **Browser matrix** — the full suite on **chromium / firefox / webkit /
   mobile-chrome**, with cached browser binaries and trace/video/screenshot
   artifacts for every failure.
3. **Merged report** — all browsers' results combined into one Allure report,
   with a pass/fail table on the run summary, even when some browsers failed.

The runner image is pinned (`ubuntu-24.04`) and the browser cache is keyed by
OS release, so an image change cannot silently break the cached browsers.

See it run live: [Actions tab](https://github.com/sabolothbrok/claude-playwright-demo/actions/workflows/playwright.yml).

## Agents

`.claude/agents/` defines six purpose-built Claude Code subagents that
cover the automation lifecycle, each scoped to one responsibility with its
own tool permissions:

| Agent | Role | Hands off to |
|---|---|---|
| **Planner** (`test-planner`) | Explores the live app against the manual cases and returns a **plan**: scenarios, tags, Page Objects, data, and every place the app differs from the manual case. It has **no write tools**, so it cannot change the repo. | **You** (approve or edit the plan) |
| **Generator** (`test-generator`) | Implements only a plan you approved (`APPROVED: <ids>`) — Page Objects, fixtures, data, specs — then runs the checks. Refuses to start without an approved plan. | Runner (to confirm the new spec passes) |
| **Runner** (`test-runner`) | Executes the suite (full, tagged, or a single spec) and reports a concise pass/fail summary with artifact links. | Analyzer (on any failure) |
| **Analyzer** (`test-analyzer`) | Diagnoses *why* a test failed — app regression, selector/UI drift, flaky, environment issue, or test bug — without changing code. | Healer (drift only) or the user (regression/flaky) |
| **Healer** (`test-healer`) | Fixes confirmed selector/UI drift, verifies the fix live, commits to a branch — never touches app regressions, never merges/pushes to main itself. | User (for review/merge) |
| **Optimizer** (`test-optimizer`) | Periodically reviews the whole suite for flakiness, duplication, slow tests, and convention drift; proposes or makes low-risk fixes on a branch. | User (for anything higher-risk) |

Typical loop: **Planner** proposes coverage for a feature → **you** approve the
plan → **Generator** implements it → **Runner** confirms
it's green → on any later CI failure, **Runner** reports it and **Analyzer**
diagnoses it → confirmed UI drift goes to **Healer**, a real regression goes
back to the team → **Optimizer** runs periodically (e.g. monthly) to keep
the suite itself healthy as it grows. Invoke any of them directly by name
(e.g. "use the test-generator agent to automate the checkout test cases")
or let Claude pick the right one based on the task.

## Engineering decisions

Choices made on evidence, including the ones that were rejected:

- **Saved login (`storageState`) was tried and dropped.** It replaces a ~0.7 s UI
  login per test with a one-time setup step, but at 25–30 tests the serial setup
  made the suite *slower* (13–15 s vs 10–12 s over three interleaved A/B runs).
  It starts paying off in the hundreds of tests, so it is the planned change
  when the suite grows that large.
- **`ubuntu-latest` is pinned.** The image moved to Ubuntu 26.04, which broke the
  cached WebKit build (a stale browser binary) and made dependency installs take
  ~9 minutes instead of seconds; pinning fixed both.
- **Locators migrated from CSS to role/placeholder/test-id.** Repeating each test 5×
  caught a race the migration introduced (a shared test id matched the old list page
  during navigation, ~12% failure); `expectLoaded()` now waits for a page-unique
  element first. Result: 150/150 on repeat. The same pass found that SauceDemo's open
  sidebar is `aria-hidden`, so role locators cannot see it — an accessibility defect in
  the app, and the reason those few links use `data-test`.
- **Dependency audit: 25 → 19 vulnerabilities, 0 critical, 0 high; 0 in production
  dependencies.** All findings were in dev tooling. Fixed: `dompurify` (Allure pins an
  exact vulnerable version, so a patch-level `overrides` entry in `package.json`) and
  `brace-expansion` (plain lockfile update). Left alone on purpose: 19 moderate
  `glob`/`minimatch` denial-of-service advisories whose fixes are major-version jumps
  (via ESLint 8, typescript-eslint and Allure); forcing those with overrides was tested
  but not kept, since the risk of destabilising the toolchain outweighs a DoS issue in
  tools that only process this repo's own file paths. They go away with the planned ESLint
  migration. **Caveat:** the `dompurify` override cleans the installed package, but the
  generated Allure report embeds Allure's own prebuilt copy (DOMPurify 3.4.16, confirmed in
  the report's license banner), which only an Allure release can change. The report is built
  from this repo's own test output, so exposure is low.
- **Agents may not write until a person approves.** The Planner is read-only by
  construction; an instruction ("please wait for approval") was not enough on its
  own.

## Adapting this to another e-commerce app

The structure is app-agnostic; only the page layer is app-specific.

1. Set `BASE_URL` in `.env`; update credentials in `src/data/users.ts`.
2. Adjust `testIdAttribute` in `playwright.config.ts` if the app uses
   `data-testid` instead of `data-test`.
3. Rewrite the locators in `src/pages/` (keep the method names where the flow is
   the same: login, add to cart, checkout, ...). Specs rarely change.
4. Put the app's product names in `src/data/products.ts` and its features in
   `src/utils/allure-labels.ts`.
5. Use the Planner agent on your manual cases to get an approved plan.

## License

[MIT](LICENSE) © 2026 Jafeth Briceño
