# Runtime image: Angular dist + minimal in-container Nginx (SPA + PWA headers).
# Build dist on the host first (no Node in this image):
#   npm ci && npm run build:prod
# Then:
#   ./deploy/build-image.sh

FROM nginx:1.27-alpine

ARG FRONT_DIST_PATH=dist/app-taller-mecanico/browser

COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY ${FRONT_DIST_PATH}/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
