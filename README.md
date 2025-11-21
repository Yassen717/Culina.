# FeastFlow

A modern full‑stack recipe and cooking social app. The client is a React + Vite + Tailwind CSS SPA using Wouter for routing and TanStack Query for data fetching/caching. The server is an Express application that serves the client in both development (via Vite middleware) and production (static assets) modes. Authentication and basic user flows on the client are powered by Appwrite.

This repository is organized as a monorepo with `client/`, `server/`, and `shared/` workspaces.

## Tech Stack

- Client
  - React 19, Vite 7, TypeScript
  - Tailwind CSS 4, shadcn/ui, Radix UI primitives, lucide-react icons
  - Wouter (routing), TanStack Query (server-state), sonner (toasts)
  - Appwrite SDK (auth, databases, storage)

- Server
  - Node.js, Express 4
  - Vite dev server integration for HMR in development
  - Static file serving in production

- Shared / Data
  - drizzle-orm, drizzle-zod, zod
  - Example `users` table definition in `shared/schema.ts`

- Tooling
  - TypeScript, esbuild, tsx
  - Tailwind/PostCSS

## Project Structure

- `client/`
  - `index.html` – app HTML template
  - `src/`
    - `main.tsx` – bootstraps React root
    - `App.tsx` – global providers and router
    - `components/` – UI components (shadcn/ui based)
    - `pages/` – route components like `Home`, `Explore`, `Create`, `Profile`, `Activity`, `Settings`, `RecipeView`, `AuthPage`, `NotFound`
    - `hooks/use-auth.tsx` – Appwrite-based auth context (login/register/logout, session check)
    - `lib/`
      - `appwrite.ts` – Appwrite client configuration
      - `protected-route.tsx` – route guard for authenticated routes
      - `queryClient.ts` – TanStack Query client
      - `utils.ts`, `data.ts` – helpers and mock/sample data utilities

- `server/`
  - `app.ts` – Express app setup, request logging, error handling, and server boot
  - `index-dev.ts` – Development entry; mounts Vite middleware and serves `index.html` with HMR
  - `index-prod.ts` – Production entry; serves static assets from `dist/public`
  - `routes.ts` – Register API routes; currently a scaffold
  - `storage.ts` – In-memory storage example (`MemStorage`) for `users`

- `shared/`
  - `schema.ts` – drizzle-orm schema for `users` and zod types/schemas

- Root config
  - `vite.config.ts` – Vite config with path aliases `@`, `@shared`, `@assets`
  - `tsconfig.json` – TS project references and path mapping
  - `drizzle.config.ts` – Drizzle config (PostgreSQL); expects `DATABASE_URL` if used
  - `.replit` – Replit build/run/deploy settings
  - `postcss.config.js`, `components.json`, `package.json`, etc.

## Development

Prerequisites:
- Node.js 20+
- Optional: Replit environment (repo includes `.replit` config)

Install dependencies:

```bash
npm install
```

Start the full stack in development:

- Client-only dev server (Vite):

```bash
npm run dev:client
```

- Full stack (Express + Vite middleware):

```bash
npm run dev
```

The server will run on `http://localhost:5000` by default (or `PORT` if provided) and proxies the Vite dev server via middleware.

## Production Build and Start

Build the client and server bundle:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

This serves the static client from `dist/public` and runs the Node server bundle from `dist/index.js`.

## Environment Variables

- Server
  - `PORT` – Port to run the server (default 5000). Set in `.replit` as 5000.
  - `DATABASE_URL` – Required by `drizzle.config.ts` if you intend to use Drizzle/Neon/Postgres. The current app uses in-memory storage by default.

- Client (Appwrite via Vite env)
  - Create a `.env` file at the repo root (or alongside `client/`) by copying `.env.example` and fill in values:

```bash
cp .env.example .env
# then edit .env
```

  - Required keys (must be prefixed with `VITE_` to be available in the browser):
    - `VITE_APPWRITE_ENDPOINT` – Appwrite endpoint (default is `https://cloud.appwrite.io/v1`)
    - `VITE_APPWRITE_PROJECT_ID` – Your Appwrite Project ID
    - Optional if using Appwrite Database/Storage:
      - `VITE_APPWRITE_DATABASE_ID`
      - `VITE_APPWRITE_COLLECTION_ID_POSTS`
      - `VITE_APPWRITE_COLLECTION_ID_PROFILES`
      - `VITE_APPWRITE_BUCKET_ID_IMAGES`

These are consumed in `client/src/lib/appwrite.ts` via `import.meta.env`.

## Authentication Flow

- `client/src/hooks/use-auth.tsx` implements:
  - Session check on load via `account.get()`
  - `register` using `account.create` then `createEmailPasswordSession`
  - `login` using `account.createEmailPasswordSession`
  - `logout` using `account.deleteSession('current')`
- Routes are guarded via `ProtectedRoute` in `client/src/lib/protected-route.tsx`.

## Database and Storage

- Drizzle ORM is configured with `shared/schema.ts` and `drizzle.config.ts`.
- The current server uses an in-memory storage (`MemStorage` in `server/storage.ts`). Replace with a real storage implementation (e.g., Drizzle + Neon/Postgres) for persistence.

## NPM Scripts

From `package.json`:

- `dev:client` – `vite dev --port 5000`
- `dev` – Start Express with Vite middleware for local development
- `build` – Build client (Vite) and server bundle (esbuild)
- `start` – Run production server from `dist/index.js`
- `check` – `tsc` typecheck
- `db:push` – `drizzle-kit push` (requires `DATABASE_URL`)

## Path Aliases

Defined in `vite.config.ts` and `tsconfig.json`:

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Deployment Notes

- The `.replit` config sets a static deployment of the built client from `dist/public`. The Node server can also be hosted separately if needed.
- Ensure you run `npm run build` prior to deployment.
- If you wire up Drizzle to a real database, set `DATABASE_URL` securely.

## Roadmap / TODO

- Implement real API routes in `server/routes.ts` for recipes, profiles, feed, etc.
- Replace in-memory storage with a persistent database via Drizzle ORM.
- Wire `data.ts` consumers to real APIs and database.
