# Auto Repair Shop Front

Angular **22** PWA client for the multi-tenant auto repair shop SaaS. Sole first-party consumer of [auto-repair-shop-api](https://github.com/jlrodriguezalvarado/auto-repair-shop-api).

## Why this project

Shows frontend delivery aligned with a real API contract:

- Feature folders, repositories, and case-mapping against DRF snake_case
- JWT interceptor, role-aware shell, dashboard / OT / estimates / receipts flows
- Tailwind UI, service worker (PWA), optional mock API for UI work without backend
- Production Nginx image build wired to the API deploy stack
- Same agent workflow kit (`.agents/`, plans) as the API for cross-layer features

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Angular 22, RxJS, standalone components |
| Styling | Tailwind CSS 3 |
| PWA | `@angular/service-worker` |
| API | REST + JWT against Django DRF |

## Quick start

```bash
npm i --legacy-peer-deps
npm start
```

App: `http://localhost:4300` (proxies/uses `src/environments/environment.ts` → API `http://localhost:8001/api`).

For production builds, copy:

```bash
cp src/environments/environment.production.example.ts src/environments/environment.production.ts
# set apiUrl to your public API origin
npm run build:prod
```

`environment.production.ts` is gitignored so host-specific URLs stay local.

## Features (UI)

- Auth (login / refresh / change password)
- Multi-company admin (`SUPER_ADMIN`) and tenant company profile
- Customers, vehicles, service catalog
- Work orders, estimates, receipts & payments
- Dashboard summary (period filters)
- Optional Web Push opt-in when the API exposes VAPID

## Project layout

```text
src/app/
  core/          API client, interceptors, models, i18n
  features/      routed feature pages (dashboard, customers, …)
  shared/        shared UI pieces
```

## Deploy

See [DEPLOY.md](DEPLOY.md). Images push to a private registry; Compose lives in the API repo.

## Working style

`.agents/` + `.plans/` document how cross-cutting features are planned with the API (contract first, then Angular, then QA).

## License

MIT — see [LICENSE](LICENSE).

## Security

See [SECURITY.md](SECURITY.md).
