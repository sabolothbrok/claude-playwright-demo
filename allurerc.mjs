import { defineConfig } from 'allure';

// The merged CI report holds every browser's results: 4 projects x 30 tests.
// A local run usually covers one browser, so the floor is 30 there.
const EXPECTED_TESTS = process.env.CI ? 120 : 30;

export default defineConfig({
  name: 'Storefront E2E Pre-flight Checks Report',
  output: './allure-report',
  // Keeps run-to-run history so the report can show trends and flaky tests.
  historyPath: './.allure/history.jsonl',
  // Shown in the report's "Quality Gates" tab, and fails `allure generate` (non-zero exit)
  // when a rule is broken. The report is still written, so the failure can be inspected.
  qualityGate: {
    rules: [
      // Any failed test, in any browser, fails the gate.
      { maxFailures: 0 },
      // Catches a silently missing browser, project or spec file.
      { minTestsCount: EXPECTED_TESTS },
    ],
  },
  plugins: {
    awesome: {
      options: {
        reportName: 'Storefront E2E Pre-flight Checks Report',
        // One self-contained index.html: download the CI artifact and double-click it.
        singleFile: true,
        // Group by business feature (set in src/utils/allure-labels.ts), not by file.
        groupBy: ['epic', 'feature'],
        theme: 'auto',
      },
    },
  },
});
