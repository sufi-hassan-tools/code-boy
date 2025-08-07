# Code Boy Fullstack App

This repository contains a React frontend (Vite) and an Express backend with MongoDB.

## Available Scripts

### Client
- `npm run dev` – start Vite dev server
- `npm run build` – build for production
- `npm run start` – preview production build

### Server
- `npm run dev` – start server with nodemon
- `npm run start` – start server

## Testing

Backend and frontend projects use Jest with an 80% global coverage threshold. Example tests exist in `moohaar-backend/src/controllers/__tests__` and `client/src/components/__tests__`.

- Backend: `npm test` from `moohaar-backend`
- Frontend unit tests: `npm test` from `client`
- Frontend end-to-end tests: `npm run test:e2e` from `client`

## CI/CD

Pushes and pull requests to `main` trigger [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
The workflow checks out the code, sets up Node 20, installs dependencies,
runs lint, unit, integration and end-to-end tests, builds the frontend for
production and uploads coverage artifacts for both the backend and frontend.

## Docker

Dockerfiles in `client/` and `moohaar-backend/` install dependencies, run
tests and produce production images. To build and start both admin services:

```
docker compose build
docker compose up -d
```

The backend publishes a health check at `http://localhost:3000/health` and
Prometheus metrics at `http://localhost:3000/metrics`. Winston logs are written
to `moohaar-backend/logs` and also streamed to the console in development.

To roll out updated images:

```
docker compose pull
docker compose up -d --build
```

Ports and API endpoints can be customised via `BACKEND_PORT`, `CLIENT_PORT`
and `VITE_API_URL` environment variables.

See `client/package.json` and `server/package.json` for dependencies.

## Environment Variables

The server reads its configuration from environment variables. For local
development you may create a `server/.env` file (which is ignored by git) with
placeholders for the required values:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.h5vbmbs.mongodb.net
JWT_PRIVATE_KEY_BASE64=base64_encoded_private_key_here
JWT_PUBLIC_KEY_BASE64=base64_encoded_public_key_here
RESET_EMAIL=your_email@gmail.com
RESET_PASS=your_email_password
```

Never commit this file. In production, supply these values using environment
variables or your hosting provider's secrets manager.

### moohaar-backend caching and APM

The `moohaar-backend` service integrates Redis caching, Prometheus metrics and Elastic APM. Configure via environment variables:

```
REDIS_URL=redis://localhost:6379
CACHE_TTL_THEME=60        # seconds for theme metadata cache
CACHE_TTL_CONTEXT=30      # seconds for storefront rendering cache
CACHE_TTL_HEALTH=5        # seconds for health check cache
APM_ACTIVE=true           # disable by setting to 'false'
APM_SERVICE_NAME=moohaar-backend
APM_SERVER_URL=http://localhost:8200
```

The `/metrics` endpoint exposes Prometheus metrics like request rate, error rate and latency distributions.
