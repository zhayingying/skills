# Unit and Integration Test Patterns

Use this when adding focused regression tests or improving shallow test suites.

## Test Selection

Choose the smallest test that proves the behavior:

| Behavior | Preferred test |
|---|---|
| Pure logic, validation, formatting | Unit test |
| Database, file system, HTTP boundary | Integration test |
| Critical user journey | E2E test |

Most new tests should be unit or integration tests. Keep E2E tests for high-value paths.

## Bug Fix Flow

1. Write a test that reproduces the bug and fails.
2. Run the narrow command for that test file.
3. Implement the minimal fix.
4. Re-run the narrow command.
5. Run the related broader suite.

Do not call a bug fixed until the new test fails before the fix and passes after it.

## Good Test Properties

- Assert outcomes, not internal call order.
- Use Arrange-Act-Assert.
- Keep tests DAMP: readable, explicit, and self-contained.
- Mock only at boundaries: external HTTP, database, file system, clock, queues.
- Avoid mocking pure business logic or the function being tested.
- Include happy path, validation failure, auth/permission failure, empty input, boundary value, and concurrency or idempotency cases when relevant.

## Coverage Triage

Coverage is a signal, not the goal. Prioritize gaps as:

| Priority | Gap |
|---|---|
| P0 | Uncovered error paths, auth, payments, data loss, permissions |
| P1 | Core business branches and API edge cases |
| P2 | Utility helpers and display-only formatting |

If coverage reports exist, use them to find missing branches. If no report exists, inspect changed files and bug paths first.

## Framework Notes

JavaScript and TypeScript:

```bash
npm test -- --runInBand
pnpm test
npm run test:unit
npm run coverage
```

Python:

```bash
pytest tests/path/test_file.py -q
pytest --maxfail=1 -q
```

Go:

```bash
go test ./...
go test ./pkg/name -run TestName
```

Java:

```bash
mvn test
./gradlew test
```

Run the narrowest command first, then broaden once the local failure is understood.
