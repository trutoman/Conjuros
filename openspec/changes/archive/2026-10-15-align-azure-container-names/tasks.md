## 1. Deploy workflow

- [x] 1.1 Change `--container-name api` to `--container-name conjuros-api` in `.github/workflows/deploy-azure.yml`

## 2. Configurable Nginx upstream

- [x] 2.1 Rename `nginx.conf` to `nginx.conf.template` and proxy `/api/` to `http://${API_UPSTREAM}`
- [x] 2.2 Update `Dockerfile.web` to copy the template into `/etc/nginx/templates/` and default `API_UPSTREAM=localhost:3000`
- [x] 2.3 Set `API_UPSTREAM: api:3000` for the `web` service in `docker-compose.yml`

## 3. Verification

- [ ] 3.1 Run `docker compose up -d --build` and confirm `/api/auth/me` is proxied through `http://localhost:5173`
- [ ] 3.2 Run `npm run check`
- [ ] 3.3 Merge before the next push to `main` and confirm the deploy workflow succeeds
