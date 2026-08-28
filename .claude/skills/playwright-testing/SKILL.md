---
name: playwright-testing
description: Use when writing, fixing, or extending Playwright + TypeScript E2E tests in this repository (claude-playwright, targeting saucedemo.com). Covers the Page Object Model conventions, the Playwright MCP browser tool for exploring the live app, fixture usage, naming/tagging rules, and how to run and debug the suite before opening a PR.
---

# Playwright Testing (SauceDemo E2E framework)

This skill governs how Claude works inside this repository: a Playwright +
TypeScript E2E framework for https://www.saucedemo.com/, built with a Page
Object Model (POM) and wired into GitHub Actions CI.

## When this applies

- Adding a new test scenario or spec file under `tests/`.
- Adding or updating a Page Object under `src/pages/`.
- Investigating a failing test (locally or in CI).
- Exploring the live SauceDemo site to confirm selectors/behavior before
  writing a test.

## Repository layout

```
src/
  pages/        Page Object classes (one file per page/screen)
  fixtures/     Custom Playwright fixtures (src/fixtures/pages.fixture.ts)
  data/         Test data (users, checkout info)
  utils/        Small pure helpers (money math, formatting, etc.)
tests/          *.spec.ts test files, one suite per feature/page
.github/workflows/playwright.yml   CI pipeline
playwright.config.ts               Projects, reporters, timeouts, baseURL
.mcp.json                          Registers the Playwright MCP server
```

## Core rules

1. **Never put raw locators or `page.` calls directly in a test file.**
   Every interaction with the DOM goes through a Page Object method in
   `src/pages/`. Tests read like a script of user intent
   (`login(...)`, `addToCartByName(...)`, `checkout()`), not like a sequence
   of CSS selectors.

2. **One Page Object per screen**, extending `BasePage` (`src/pages/BasePage.ts`)
   when the screen shares the authenticated shell (burger menu, cart badge,
   error banner). `LoginPage` does not extend `BasePage` because it is the
   only unauthenticated screen.

3. **Use the shared fixtures**, not `new LoginPage(page)` inline, in test
   files. Import from `@fixtures/pages.fixture` (aliased in `tsconfig.json`
   and resolved automatically by Playwright's test runner):

   ```ts
   import { test, expect } from '@fixtures/pages.fixture';

   test('example', async ({ authenticatedPage, cartPage }) => {
     await authenticatedPage.addToCartByName('Sauce Labs Backpack');
     await authenticatedPage.goToCart();
     await cartPage.expectLoaded();
   });
   ```

   `authenticatedPage` already performed a UI login as the standard user and
   is sitting on `/inventory.html` — use it instead of repeating the login
   steps unless the test is specifically about login behavior.

4. **Tag every test** with `@smoke` (critical path: login, one full checkout,
   product list loads) or `@regression` (everything else) in the test title,
   e.g. `test('sorts products by price @regression', ...)`. This is how CI
   and `npm run test:smoke` / `npm run test:regression` filter tests.

5. **Prefer role/text/test-id locators over brittle CSS** when adding new
   Page Object locators: `getByRole('button', { name: /Add to cart/ })`,
   `[data-test="..."]`, or a stable class SauceDemo already uses
   (`.inventory_item_name`, `.shopping_cart_badge`, etc.). Check the current
   DOM with the Playwright MCP tool or `npm run codegen` rather than
   guessing.

6. **Assertions belong in the test, not the Page Object**, except for
   `expectLoaded()` helper methods that assert the page has actually
   navigated/rendered (these exist on every Page Object and should be called
   right after navigation).

7. **Keep tests independent.** Each test should work in isolation and in
   parallel (the config runs `fullyParallel: true`). Don't rely on state left
   over from a previous test; use `authenticatedPage`/fixtures to establish a
   known starting state.

8. **New user-facing data (credentials, checkout info) goes in `src/data/`**,
   never hardcoded inline in a test.

## Using the Playwright MCP server to explore the app

This repo registers the Playwright MCP server in `.mcp.json`
(`npx @playwright/mcp@latest`). When Claude has that MCP server connected, use
it to drive a real browser against https://www.saucedemo.com/ and confirm
selectors/behavior *before* writing or fixing a Page Object — don't guess at
markup from memory:

1. Navigate to the relevant page (e.g. `/inventory.html` after logging in
   with `standard_user` / `secret_sauce`).
2. Inspect the accessibility tree / DOM snapshot the MCP tool returns to find
   a stable locator (role, `data-test` attribute, or class name).
3. Try the interaction (click, fill, select) through the MCP tool to confirm
   it behaves as expected.
4. Translate the confirmed locator/interaction into the Page Object method,
   then write the test against the Page Object — not against the MCP session.

If the Playwright MCP server isn't connected in the current session, fall
back to `npm run codegen` locally, which opens SauceDemo in a real browser
and records actions/selectors, or read the rendered HTML directly.

## Adding a new test — step by step

1. If the flow touches a screen with no Page Object yet, create
   `src/pages/<Screen>Page.ts` following the existing files as a template:
   locators as `readonly` class fields set in the constructor, an
   `expectLoaded()` method, and one method per user action (no assertions
   beyond `expectLoaded`).
2. Export it from `src/pages/index.ts`.
3. Wire it into `src/fixtures/pages.fixture.ts` if tests should receive it as
   a fixture (they should, for consistency).
4. Write the spec in `tests/<feature>.spec.ts` using the fixtures, tagging
   each test `@smoke` or `@regression`.
5. Run it locally (see below) before considering the change done.

## Running and debugging

```bash
npm install                 # first time only
npx playwright install      # download browser binaries, first time only

npm test                    # full suite, all projects (chromium/firefox/webkit/mobile-chrome)
npm run test:chromium       # single browser, fastest inner loop
npm run test:smoke          # @smoke only
npm run test:headed         # see the browser
npm run test:ui             # Playwright's interactive UI mode — best for debugging
npm run test:debug          # Playwright Inspector, step through
npm run report              # open the last HTML report
```

Before opening a PR:

- `npm run typecheck` and `npm run lint` must pass.
- `npm run test:chromium` must pass locally at minimum; run the full
  `npm test` when the change touches shared fixtures/Page Objects.
- If a test fails intermittently, check `playwright-report/` (trace,
  screenshot, video are captured `on-failure`/`retain-on-failure` per
  `playwright.config.ts`) before assuming it's app flakiness — inspect the
  trace with `npx playwright show-trace test-results/.../trace.zip`.

## CI

`.github/workflows/playwright.yml` runs the full suite on push/PR to
main/master, on a nightly schedule, and on manual dispatch — as a matrix over
chromium/firefox/webkit. It uploads the HTML report and trace/video/screenshot
artifacts for every run so failures are debuggable from the Actions tab
without reproducing locally first. Mirror any config change (new project,
new env var) in both `playwright.config.ts` and the workflow file.

## Converting manual test cases into automated specs

This is the workflow to follow when the ask is "take this existing manual
test case (or a batch of them for one feature) and automate it" rather than
"write a new test from scratch." It's the same framework, but the source of
truth is a human-written test case instead of a feature description, so
traceability back to that source matters.

1. **Scope to one feature per batch.** Take all manual cases for a single
   feature/module together (e.g. every "Checkout" case), not a grab-bag
   across the app. This keeps the resulting Page Object work coherent and
   makes progress reportable feature-by-feature.

2. **Verify each case against the live app before coding anything.** Manual
   test documentation drifts from reality — steps reference UI that's
   changed, expected results that are stale. Use the Playwright MCP server
   (see "Using the Playwright MCP server to explore the app" above) to walk
   each manual step against the real, running app first and confirm the
   locators/behavior. Do not translate a stale manual step into code as-is
   without checking it live.

3. **Reuse or extend Page Objects before writing the spec** — same rule as
   any other test (see "Adding a new test — step by step" above). A batch of
   manual cases for one feature often needs one new Page Object plus reuse of
   several existing ones.

4. **One manual case → one `test()`, with an explicit traceability link.**
   Preserve the source case's identifier in the test so coverage is
   auditable later:

   ```ts
   // TC-1042: Guest can complete checkout with a single item
   test('completes checkout with a single item @smoke', async ({ ... }) => {
     ...
   });
   ```

   Prefer putting the ID in a leading comment (shown above) or in the test
   title itself if the team's reporting tooling parses titles — check
   `tests/` for the convention already in use before choosing.

5. **Translate manual "expected results" into explicit assertions**, not
   just "did it not crash." If the manual case says "user sees order
   confirmation with total matching cart," that's an assertion on the
   confirmation header text *and* a numeric assertion on the total — mirror
   `tests/checkout.spec.ts` for the pattern of deriving/asserting totals.

6. **Data-drive anything the manual case parameterizes** (multiple user
   types, multiple products) via `src/data/`, rather than duplicating near-
   identical `test()` blocks per data variant.

7. **Run it, fix drift, then treat it like any other PR** — lint, typecheck,
   full local run, then normal review. An automated conversion is not exempt
   from the same bar as a hand-written test.

8. **Log the conversion.** Maintain a simple coverage mapping (a doc or
   sheet outside this repo is fine) of manual case ID → spec file → status
   (automated / blocked / not applicable), updated as each batch lands. This
   is what turns "we're automating things" into a reportable number for
   stakeholders.

When a manual case can't be automated as written (e.g. it depends on visual
inspection, a third-party system, or manual data setup this framework can't
reach), don't force it — mark it "blocked" in the coverage log with the
reason and move to the next case, rather than writing a test that doesn't
actually verify the case's intent.
