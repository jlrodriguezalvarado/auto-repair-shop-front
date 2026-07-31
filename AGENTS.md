# Angular frontend repository guidance

This repository (`auto-repair-shop-front`) is the Angular 22 client half of the Mechanics product. All remote application data comes from the Django API in sibling `../auto-repair-shop-api` via `environment.apiUrl`.

## Sources of truth (this repo)

- `.agents/WORKFLOW.md` — lifecycle
- `.agents/HANDOFF.md` — delegation block
- `.agents/policies/angular-frontend.md` — engineering rules
- `.agents/policies/integration.md` — cross-layer contracts
- `.agents/policies/qa.md` — QA gate
- `.agents/policies/continuous-improvement.md` — turn repeatable agent failures into kit defenses
- `.cursor/agents/angular-frontend.md` / `qa.md`
- Front-only plans under `.plans/`
- Cross plans under `../auto-repair-shop-api/.plans/` (contract owner)

## Sibling

| Sibling | Role |
|---------|------|
| `../auto-repair-shop-api` | Contract owner (DRF / OpenAPI when published) |

When an OpenAPI → TypeScript pipeline exists, regenerate types instead of hand-editing generated files under `src/app/core/api/generated/`.

## Parent workspace

Opening parent `mechanics/` loads root `AGENTS.md` plus root `.cursor/agents/` for full-feature orchestration. Detail still lives in this kit and in `auto-repair-shop-api`’s kit.

## Safeguards

- Colocate feature DTOs/mappers/repositories; respect feature folder layout (routed children in own folders; parent-only under `components/`).
- Preserve decimal strings at the HTTP boundary; normalize errors via a shared client error type when present.
- Keep `environment.production.ts` local and gitignored.
- Do not push, merge, deploy, or force dependency upgrades without authorization.
- Do not skip ownership or QA gates.
- After a repeatable agent failure, follow `.agents/policies/continuous-improvement.md` (or a parent harness directive) before declaring done.
