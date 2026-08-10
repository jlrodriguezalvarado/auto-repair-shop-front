# Deploy — auto-repair-shop-front

Build the Angular SPA and package it as image `mechanics/web` (Nginx + `dist/`).
Compose stack and `deploy.sh` live in `../auto-repair-shop-api`.

## Local

```bash
npm i --legacy-peer-deps
npm start
```

Docker is not required for front development.

## Production

1. Configure `src/environments/environment.production.ts` (absolute `apiUrl` to the API host). Copy from `environment.production.example.ts`.
2. From workspace root `mechanics/`: `./build-front.sh` (build + push).
3. Upload tags with `./upload.sh` and run `./deploy.sh` on the server.

Image: `registry.example.com/mechanics/web:<git-sha>`  
Host: `mechanics.example.com`
