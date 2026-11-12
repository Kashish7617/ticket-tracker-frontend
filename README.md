# Support Ticket Tracker: Frontend

[![CI](https://github.com/Kashish7617/ticket-tracker-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Kashish7617/ticket-tracker-frontend/actions/workflows/ci.yml)


Web UI for a support ticket tracker, built with **React 19 + TypeScript** and **Vite**.

Backend API (ASP.NET Core + EF Core): **[Kashish7617/ticket-tracker-backend](https://github.com/Kashish7617/ticket-tracker-backend)**

---

## Features

- Ticket list with a **status filter**, a debounced **title search** and **pagination**
- **Create form** with client-side validation (required title, 120-character limit with a live counter, description limit). Server-side validation errors also appear next to the matching field.
- **Change status** with a select on each ticket, and **delete** with a confirmation
- **Loading states** (skeletons, spinner, faded list while refreshing) and **error states** with retry
- **Summary panel** with bar charts of tickets per status and per priority
- **Responsive:** one column on phones; a sticky sidebar next to the list from 900 px up. **Dark mode** follows the OS.
- **Fully typed** API models (`src/api/types.ts`), with no `any`

## Tech stack

| Area | Choice |
|---|---|
| UI | React 19, plain CSS (no UI library) |
| Language | TypeScript (strict) |
| Build | Vite |
| Lint | oxlint |
| Delivery | Dockerfile (nginx), Vercel-ready |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22+ (check with `node --version`)
- The [backend API](https://github.com/Kashish7617/ticket-tracker-backend) running on http://localhost:5080.
  The quickest way, with no SQL Server needed:

  ```bash
  git clone https://github.com/Kashish7617/ticket-tracker-backend.git
  cd ticket-tracker-backend
  dotnet run --project src/TicketTracker.Api --launch-profile sqlite
  ```

### Run the frontend

```bash
git clone https://github.com/Kashish7617/ticket-tracker-frontend.git
cd ticket-tracker-frontend
npm install
npm run dev
```

Open http://localhost:5173.

The Vite dev server proxies every `/api/*` request to `http://localhost:5080`, so CORS isn't needed locally.
If your API runs somewhere else, copy `.env.example` to `.env.local` and change `API_PROXY_TARGET`.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Strict TypeScript type-check + production build into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

---

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `API_PROXY_TARGET` | `npm run dev` only | Where the dev server forwards `/api` (default `http://localhost:5080`) |
| `VITE_API_BASE_URL` | production build | Absolute API URL baked into the bundle. Set in [`.env.production`](.env.production) to the deployed API, `https://ticket-tracker-backend-5cke.onrender.com`. Leave it empty when the UI and API share an origin (e.g. behind the nginx proxy). |

`VITE_API_BASE_URL` is read at **build time**, so rebuild or redeploy after changing it. A value set in the hosting platform's environment variables overrides `.env.production`. The Docker build ignores `.env.production` and keeps using the same-origin nginx proxy.

---

## Deploying to Vercel

1. On [Vercel](https://vercel.com), go to **Add New → Project** and import this repo. It detects **Vite** automatically (build: `npm run build`, output: `dist`).
2. No environment variables are needed: the backend URL is already set in [`.env.production`](.env.production). To point at a different backend, set `VITE_API_BASE_URL` under **Environment Variables** (no trailing slash).
3. Deploy.
4. On the **backend**, allow the Vercel URL for CORS: set `Cors__AllowedOrigins__0=https://<your-app>.vercel.app` on Render (see the [backend README](https://github.com/Kashish7617/ticket-tracker-backend#deploying-to-render)).

> On Render's free plan the API sleeps when idle, so the first request after a while can take 30–50 seconds.

## Docker

The [`Dockerfile`](Dockerfile) builds the static bundle and serves it with nginx. [`nginx.conf`](nginx.conf) also reverse-proxies `/api/` to a container named `api` on port 8080, so the browser only ever talks to one origin. It's used by the backend repo's `docker-compose.yml` for the full stack; see [Docker in the backend README](https://github.com/Kashish7617/ticket-tracker-backend#docker).

---

## Project structure

```
src/
  api/types.ts              Typed models matching the API contract
  api/client.ts             fetch wrapper; non-2xx responses become ApiError with the parsed ProblemDetails
  api/tickets.ts            One function per endpoint
  hooks/useAsync.ts         Data loading that aborts stale requests, so an old slow response can't overwrite a newer one
  hooks/useDebouncedValue.ts
  components/               CreateTicketForm, TicketFilters, TicketList, Pagination, SummaryPanel
  validation.ts             Client-side rules (same as the server's)
  App.tsx                   Page layout and state (filters, page, refresh after changes)
```

## Design decisions

- **No UI or data-fetching libraries.** The app is small, so plain React + CSS keeps the bundle small (~72 kB gzipped) and the code easy to follow.
- **The chart is CSS bars** with `role="meter"` for screen readers, so no chart library is needed.
- **Stale-request safety:** every load uses an `AbortController`, so fast filter or search changes never show out-of-order results.
- **Errors are typed:** the API's ProblemDetails responses are parsed, so field-level validation errors show up in the form.

## Future improvements

- Vitest + React Testing Library tests for the form and list states, and a Playwright end-to-end test
- An edit-ticket form (the API already supports `PUT`)
- Login once the API has authentication

---

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request: `npm ci` → lint → type-check + build.
