# Standard subagent handoff (auto-repair-shop-front)

Include this block (filled in) when delegating to `angular-frontend` or `qa`.

```text
Plan: .plans/YYYY-MM-DD-<slug>.md
  (or ../auto-repair-shop-api/.plans/YYYY-MM-DD-<slug>.md when Scope: cross)
Branch: feature/<kebab-slug> (from develop; same name on sibling repos; Jose / jlrodriguez, local or cloud)
Role: angular-frontend | qa
Sibling: ../auto-repair-shop-api (Django) <-> this repo (Angular)
Scope:
- <allowed work>
Non-goals:
- <exclusions>
Contracts:
- <how API contract is consumed, or "unchanged">
- OpenAPI / generated types: <unchanged | regenerate via npm run api:types>
Patterns to mirror:
- <feature folders>
Acceptance criteria to satisfy:
- <subset>
Commands expected before return:
- <from policies/angular-frontend.md or qa.md>
Return format:
- files changed | contract consumption | commands + outcomes | failures | follow-ups for auto-repair-shop-api | harness improvement needed? (failure class + suggested landing or none)
```

## Parallelism

- Do not adapt Angular until the API contract is agreed and OpenAPI validated (unless front-only).
- For cross features from parent `mechanics/`, follow the root `AGENTS.md` orchestration.
- When parent issues a harness directive, land front-side defenses per `.agents/policies/continuous-improvement.md`.
