# Playwright Conventions

Use this when writing, fixing, or reviewing Playwright tests.

## Selector Priority

Prefer resilient, user-facing selectors:

1. `page.getByRole(role, { name })`
2. `page.getByLabel(label)`
3. `page.getByPlaceholder(text)`
4. `page.getByText(text)`
5. `page.getByTestId(id)`
6. `page.locator(css)` only when the UI has no semantic handle

Avoid XPath and brittle CSS chains unless testing third-party markup that cannot be changed.

## Web-First Assertions

Use Playwright assertions that auto-retry:

```ts
await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
await expect(page.getByRole('alert')).toHaveText(/saved/i);
await expect(page).toHaveURL(/\/dashboard/);
```

Avoid non-retrying patterns:

```ts
expect(await page.locator('.message').textContent()).toBe('Saved');
expect(await page.locator('.toast').isVisible()).toBe(true);
```

## Flaky Test Checklist

Check these in order:

1. Replace `page.waitForTimeout()` with a visible state, URL, response, or event wait.
2. Replace `expect(await locator.isVisible())` with `await expect(locator).toBeVisible()`.
3. Remove shared state between tests; use `test.beforeEach`, fixtures, or isolated test data.
4. Register dialog/download/page handlers before the action that triggers them.
5. Wait for navigation with `page.waitForURL()` or a stable UI assertion after clicks.
6. Use `page.waitForResponse()` when the assertion depends on a specific API response.
7. Disable animation-sensitive screenshots with `animations: 'disabled'` when appropriate.
8. Mock time/date when behavior depends on the current clock.

## Config Defaults

Use these defaults unless the project already has stronger conventions:

```ts
use: {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
retries: process.env.CI ? 2 : 0
workers: process.env.CI ? 1 : undefined
```

Keep hardcoded URLs out of tests. Use `baseURL` or `TEST_BASE_URL`.

## Test Shape

- One user-visible behavior per test; several related assertions are fine.
- Prefer fixtures over globals for authentication and shared setup.
- Use Page Object Model only when a suite has repeated flows or more than three E2E tests.
- Mock third-party services, not the app behavior under test.
- Save screenshot, video, or trace paths in the final report when failures persist.
