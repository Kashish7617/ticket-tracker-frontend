# Support Ticket Tracker — Frontend

React 19 + TypeScript, built with Vite. The API it talks to is in [`../BE`](../BE/README.md).

## How to run

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22+ (check with `node --version`)
- The backend API running on http://localhost:5080 (see [`../BE/README.md`](../BE/README.md))

### Start the dev server

```bash
cd FE
npm install
npm run dev
```

Open http://localhost:5173.

The Vite dev server proxies every `/api/*` request to `http://localhost:5080`, so CORS isn't needed locally.
If your API runs somewhere else, copy `.env.example` to `.env.local` and change `API_PROXY_TARGET`.

### Other commands

| Command | What it does |
|---|---|
| `npm run build` | Strict TypeScript type-check + production build into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

For a production build served from a different origin than the API, set `VITE_API_BASE_URL`
(e.g. `https://ticket-api.example.com`) before `npm run build`.

## Features

- Ticket list with a **status filter**, a debounced **title search** and **pagination**
- **Create form** with client-side validation (required title, 120-character limit with a live counter, description limit). Server-side validation errors also appear next to the matching field.
- **Change status** with a select on each ticket, and **delete** with a confirmation
- **Loading states** (skeletons, spinner, faded list while refreshing) and **error states** with retry
- **Summary panel** with bar charts of tickets per status and per priority, from `/api/tickets/summary`
- **Responsive:** one column on phones; a sticky sidebar next to the list from 900 px up. Dark mode follows the OS.
- **Typed API models** in `src/api/types.ts`, with no `any`

## Structure

```
src/
  api/types.ts        Typed models matching the API contract
  api/client.ts       fetch wrapper; non-2xx responses become ApiError with the parsed ProblemDetails
  api/tickets.ts      One function per endpoint
  hooks/useAsync.ts   Data loading that aborts stale requests, so an old slow response can't overwrite a newer one
  hooks/useDebouncedValue.ts
  components/         CreateTicketForm, TicketFilters, TicketList, Pagination, SummaryPanel
  validation.ts       Client-side rules (same as the server's)
  App.tsx             Page layout and state (filters, page, refresh after changes)
```

## Choices

- **No UI or data-fetching libraries.** The app is small, so plain React + CSS keeps the bundle small (~72 kB gzipped) and the code easy to follow.
- **The chart is CSS bars** with `role="meter"` for screen readers, so no chart library is needed.

## What I would improve with more time

- Vitest + React Testing Library tests for the form and list states, and a Playwright end-to-end test
- An edit-ticket form (the API already supports `PUT`)
- Login once the API has authentication
