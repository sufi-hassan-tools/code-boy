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

## Docker

Dockerfiles are provided for the client and backend. To run both services together use `docker-compose up --build` which respects environment variables like `BACKEND_PORT` and `CLIENT_PORT`.

See `client/package.json` and `server/package.json` for dependencies.

## Environment Variables

Create a `.env` file inside the `server/` directory with the following
variables:

```
MONGODB_URI=mongodb+srv://hassansufims7-8:hassansufims7-8@cluster0.h5vbmbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
RESET_EMAIL=your_email@gmail.com
RESET_PASS=your_email_password
```

When deploying to [Render](https://render.com), add the same `MONGODB_URI`
value in the **Environment** settings for your service.
