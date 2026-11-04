## What changed

<!-- One or two sentences. Link the manual test case / ticket IDs this covers. -->

## Checklist

- [ ] Every new test is tagged exactly once: `@smoke` (critical path) or `@regression`
- [ ] No raw locators or UI actions in specs; new behavior lives in a Page Object method
- [ ] New data (users, products, amounts) is in `src/data/`, not inline
- [ ] Each test is independent and passes on its own
- [ ] `npm run check` passes (typecheck, lint, format)
- [ ] Ran the new tests in at least Chromium; the CI matrix covers the other browsers
