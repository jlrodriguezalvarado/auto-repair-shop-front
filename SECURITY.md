# Security Policy

## Supported versions

This is a portfolio / sample project. Security fixes are applied on a best-effort basis on the default development branch.

## Reporting a vulnerability

Do **not** open a public issue with production API URLs that include secrets, or paste private `environment.production.ts` contents.

Email the maintainer via the GitHub profile contact, or open a private security advisory on the repository if available.

## Secrets hygiene

- `environment.production.ts` is gitignored — copy from `environment.production.example.ts`
- Do not commit `.env` / `.env.docker` with real registry hosts or tokens
- Point `apiUrl` only at environments you control when demoing
