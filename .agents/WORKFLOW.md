# Feature delivery workflow (auto-repair-shop-front)

## 1. Plan with the user

Identify outcome, non-goals, UI impact, API contract needs, OpenAPI/types regeneration, PWA/i18n, tests, and risks. Wait for explicit approval before implementation.

## 2. Record the approved plan

- Front-only: create `.plans/YYYY-MM-DD-<slug>.md` from `.plans/TEMPLATE.md`.
- Cross (needs API changes): plan belongs in `../auto-repair-shop-api/.plans/` (contract owner). If opened here alone and the scope becomes cross, stop and record/continue from that API plan (or open parent `mechanics/`).

## 3. Implement by ownership

- Use the `angular-frontend` subagent (`.cursor/agents/angular-frontend.md`).
- Read `.agents/policies/angular-frontend.md` and `.agents/policies/integration.md`.
- Consume Django contracts from sibling `../auto-repair-shop-api`; regenerate types from `../auto-repair-shop-api/docs/openapi.yaml` when the schema changed.
- Do not invent incompatible transport shapes.

## 4. QA gate

After implementation (and after API is integrated when cross), run `qa`. Do not declare complete without PASS (or an explicit user waiver in the plan).

## 5. Record the final result

Append results to the plan file in use (this `.plans/` or the referenced `auto-repair-shop-api/.plans/` file).

## 6. Harden the harness when failures repeat

If a preventable agent mistake class appeared (or parent `mechanics/` issued a harness directive), follow `.agents/policies/continuous-improvement.md`: land a rule, policy, test, or workflow constraint in this repo (and require the sibling when cross-layer). Record under `### Harness improvements` in the plan before calling the work done.
