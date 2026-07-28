# Data Model: Local Development Environment Setup

## Local MongoDB Service

| Field | Value / Rule |
|---|---|
| Compose service key | `mongo` |
| Container name | `mongo-local` |
| Image | `mongo:7.0.39@sha256:9bdaeb6dac6e7e762e84e2f84103d1f9bb078fa1ba6bde8bb9d2274f655ad173` |
| Host connection | `mongodb://localhost:27017` |
| Port mapping | `27017:27017` |
| Data directory | `/data/db` |
| Lifecycle | `docker compose up -d` starts it; a normal restart must preserve volume data |

## Local Data Volume

| Field | Value / Rule |
|---|---|
| Compose volume key | `mongo_data` |
| Relationship | Mounted by Local MongoDB Service at `/data/db` |
| Persistence rule | Survives normal service/container restarts |
| Destructive transition | `docker compose down -v` removes it and is outside the standard setup flow |

## API Environment Configuration

| Field | Source | Validation | Sensitive |
|---|---|---|---|
| `MONGODB_URI` | Process environment, normally `.env` | Present, nonblank, valid `mongodb:` or `mongodb+srv:` URI | No |
| `MONGODB_DATABASE` | Process environment, normally `.env` | Present and nonblank | No |
| `SESSION_SECRET` | Process environment, normally `.env` | Present, nonblank, at least 32 characters | Yes |
| `PORT` | Process environment | Optional; default remains `3000` | No |

### Configuration States

| State | Entry Condition | Result |
|---|---|---|
| Valid | All required values meet their rules | API may connect to MongoDB and bind its port |
| Invalid | Any required value is absent, blank, malformed, or too short | API exits before connection or request serving; error identifies variable names only |
| Unavailable Docker | Docker CLI/daemon check fails | Setup helper returns an actionable install/start-Docker instruction; it does not claim MongoDB started |