# claude-playwright

A Playwright + TypeScript end-to-end test automation framework for
[saucedemo.com](https://www.saucedemo.com/), built with the Page Object Model
(POM), driven interactively via the [Playwright MCP server](https://github.com/microsoft/playwright-mcp),
and run in CI on GitHub Actions.

## Stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model under `src/pages/`
- Custom fixtures (`src/fixtures/pages.fixture.ts`) that inject ready-to-use
  page objects, including an `authenticatedPage` fixture that skips the login
  UI flow
- Playwright MCP server (`.mcp.json`) so Claude can drive a real browser
  against the live app while writing/debugging tests
- GitHub Actions CI (`.github/workflows/playwright.yml`) — chromium/firefox/webkit
  matrix, HTML + JUnit reports, trace/video/screenshot artifacts on failure
- A Claude Code skill at `.claude/skills/playwright-testing/SKILL.md` that
  documents the framework's conventions for Claude when working in this repo

## Project structure

```
.claude/skills/playwright-testing/SKILL.md   Claude Code skill: framework conventions
.github/workflows/playwright.yml             CI pipeline
src/
  pages/          Page Objects (LoginPage, InventoryPage, CartPage, ...)
  fixtures/        Custom Playwright fixtures
  data/            Test data (users, checkout info)
  utils/           Small pure helpers
tests/             *.spec.ts specs (login, inventory, cart, checkout)
playwright.config.ts
.mcp.json           Registers the Playwright MCP server for Claude
```

## Getting started

```bash
npm install
npx playwright install --with-deps   # downloads browser binaries
cp .env.example .env                  # optional, defaults already match SauceDemo
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
See `src/data/users.ts`.

## Writing new tests

See `.claude/skills/playwright-testing/SKILL.md` for the full conventions
(Page Object rules, fixture usage, tagging, how to use the Playwright MCP
server to confirm selectors against the live site before writing a test).

## CI

Every push/PR to `main`/`master` runs the full suite across
chromium/firefox/webkit via GitHub Actions, plus a nightly scheduled run.
Reports and traces are uploaded as workflow artifacts.
