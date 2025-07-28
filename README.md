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

See `client/package.json` and `server/package.json` for dependencies.

## Environment Variables

Create a `.env` file inside the `server/` directory with the following
variable:

```
MONGO_URI=mongodb+srv://hassansufims7-8:hassansufims7-8@cluster0.h5vbmbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

When deploying to [Render](https://render.com), add the same `MONGO_URI`
value in the **Environment** settings for your service.
