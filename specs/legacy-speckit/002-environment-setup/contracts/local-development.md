# Local Development Contract

This document defines the contributor-facing interface for the local development environment. It does not change the application's HTTP API contracts.

## Docker Compose Interface

| Interface | Contract |
|---|---|
| File | `docker-compose.yml` at repository root |
| Start | `docker compose up -d` |
| Service | MongoDB service named `mongo` with container `mongo-local` |
| Image | `mongo:7.0.39@sha256:9bdaeb6dac6e7e762e84e2f84103d1f9bb078fa1ba6bde8bb9d2274f655ad173` |
| Host address | `mongodb://localhost:27017` |
| Persistence | Compose volume key `mongo_data` mounted at `/data/db` |
| Normal restart | `docker compose restart mongo` preserves data |
| Destructive cleanup | `docker compose down -v` removes local data and is not part of normal setup |

## Environment Interface

Create `.env` from `.env.example` before starting the API.

| Variable | Required | Valid value | Error behavior |
|---|---|---|---|
| `MONGODB_URI` | Yes | Nonblank `mongodb:` or `mongodb+srv:` URI; local default is `mongodb://localhost:27017` | Startup identifies `MONGODB_URI` without printing its value |
| `MONGODB_DATABASE` | Yes | Nonblank database name | Startup identifies `MONGODB_DATABASE` without printing its value |
| `SESSION_SECRET` | Yes | Nonblank value of at least 32 characters | Startup identifies `SESSION_SECRET` without printing its value |
| `PORT` | No | Valid application port; defaults to `3000` | Existing server behavior applies |

## Commands Interface

| Command | Expected result |
|---|---|
| `npm run docker:check` | Confirms that Docker CLI and daemon are available, or explains how to install/start Docker |
| `npm run dev` | Starts API and Vite after API configuration succeeds; Vite is available at `http://localhost:5173` |
| `npm run test:docker` | Runs the optional Compose persistence verification; skips with an explicit reason when Docker is unavailable |
| `npm run check` | Runs the Docker-independent lint, unit/integration, typecheck, and build validation |

## Compatibility and Security

- `.env` is ignored by Git; `.env.example` contains placeholders only.
- Errors and logs must not include environment values, particularly `SESSION_SECRET`.
- The local Compose service is for contributor-owned development data only and must not target shared or production databases.