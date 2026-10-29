# CareerPilot migration

## Structure

- `frontend/`: Vite + React + TypeScript single-page app using React Router and Axios.
- `backend/`: Express + TypeScript API with Mongoose models for users and student profiles.
- `app/` and `components/`: the original Next.js implementation retained for reference during migration.

## Local setup

1. Copy `frontend/.env.example` to `frontend/.env` and adjust `VITE_API_URL` if needed.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `MONGODB_URI` to a local MongoDB URL or MongoDB Atlas connection string and replace `JWT_SECRET` with a long random value.
4. Run `pnpm dev:backend` in one terminal and `pnpm dev:frontend` in another.
5. Open `http://localhost:5173`.

The API uses HTTP-only cookies for sessions. CORS is restricted to `FRONTEND_URL`; in production set `NODE_ENV=production`, use HTTPS, and set the exact deployed frontend origin.

## Production builds

Run `pnpm build` for the frontend and `pnpm build:backend` for the API. Start the API with `pnpm start:backend`.

No secrets are committed. The API intentionally fails to start when MongoDB is unavailable rather than silently using in-memory data.
