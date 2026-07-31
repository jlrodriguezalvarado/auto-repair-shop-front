# Deploy — auto-repair-shop-front

Build de la SPA Angular y empaquetado en imagen `mechanics/web` (Nginx + `dist/`).
El stack Compose y `deploy.sh` viven en `../auto-repair-shop-api`.

## Local

```bash
npm i --legacy-peer-deps
npm start
```

No hace falta Docker para el front en desarrollo.

## Producción

1. Configura `src/environments/environment.production.ts` (apiUrl absoluto al host del API).
2. Desde la raíz `mechanics/`: `./build-front.sh` (build + push).
3. Sube tags con `./upload.sh` y en el servidor ejecuta `./deploy.sh`.

Imagen: `registry.lumuscore.com/mechanics/web:<git-sha>`  
Host: `mechanics.lumuscore.com`
