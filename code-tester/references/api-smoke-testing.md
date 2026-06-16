# API Smoke Testing

Use this when a project exposes API routes and existing tests do not cover basic server health.

## Discover Routes

Search for route definitions:

| Stack | Signals |
|---|---|
| Next.js App Router | `app/api/**/route.ts`, `app/api/**/route.js` |
| Next.js Pages Router | `pages/api/**/*.ts`, `pages/api/**/*.js` |
| Express/Koa | `app.get(`, `app.post(`, `router.get(`, `router.post(` |
| FastAPI | `@app.get(`, `@router.post(` |
| Django | `urlpatterns`, `path(`, `re_path(` |
| Rails | `config/routes.rb` |

Build a route list with method, path, auth requirement if obvious, and required body if obvious.

## Ensure Server

Use an already-running local server when available. Confirm the port with terminal output or:

```bash
lsof -iTCP -sTCP:LISTEN -n -P
```

Do not let a target app inherit another tool's `PORT` unless the project explicitly expects it.

## Hit Endpoints

For safe GET routes:

```bash
curl -sS -o /tmp/api-smoke.out -w "%{http_code}" http://localhost:<port>/<path>
```

For JSON routes that need a body:

```bash
curl -sS -o /tmp/api-smoke.out -w "%{http_code}" \
  -X POST http://localhost:<port>/<path> \
  -H "Content-Type: application/json" \
  -d '{}'
```

Avoid state-changing calls against real data unless the endpoint is clearly local/test-only.

## Classify Results

| Status | Meaning |
|---|---|
| 200-299 | Healthy |
| 301/302/307/308 | Redirect; usually acceptable if expected |
| 400/422 | Often acceptable for empty or invalid body |
| 401/403 | Acceptable for protected routes |
| 404 | Bug if route is defined and should be mounted |
| 500 | Bug; inspect server logs |
| 000/timeout | Server or network setup issue |

## Report

Include:

- server URL and command if started
- number of endpoints tested
- healthy, auth-required, validation-expected, and error counts
- each 404/500/timeout with method, path, status, and the first useful server error line
