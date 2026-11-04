import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Storefront E2E Test Report',
  output: './allure-report',
  // Keeps run-to-run history so the report can show trends and flaky tests.
  historyPath: './.allure/history.jsonl',
  plugins: {
    awesome: {
      options: {
        reportName: 'Storefront E2E Test Report',
        // One self-contained index.html: download the CI artifact and double-click it.
        singleFile: true,
        // Group by business feature (set in src/utils/allure-labels.ts), not by file.
        groupBy: ['epic', 'feature'],
        theme: 'auto',
      },
    },
  },
});
