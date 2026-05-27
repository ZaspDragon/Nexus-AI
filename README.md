# NEXUS AI MVP

NEXUS AI is a production-style MVP for an agentic orchestration platform built with React, Vite, Tailwind CSS, Supabase Auth, and Firestore-ready persistence. The app ships with a full demo mode so the experience works without paid model keys or a live auth/data project.

## What is included

- Landing page and authentication flow
- Dashboard with investor-demo cards and recent activity
- Agent Workspace to create agents and run mock orchestration
- Model Router demo for deterministic provider selection
- Memory Center with searchable notes
- Tool Registry with working toggles
- Usage and Billing page with estimated spend tracking
- Admin Settings for organization controls and API-key placeholders
- Firestore-ready repository layer with demo-local fallback
- Demo seed data and mock orchestration engine
- Firebase Hosting config, Firestore rules, and environment template

## Tech stack

- React + Vite
- Tailwind CSS
- Supabase Auth
- Firestore
- Express-based Live Ops API scaffold
- Firebase Hosting-ready configuration
- Vitest for core logic checks

## Project structure

```text
src/
  components/
  contexts/
  data/
  hooks/
  pages/
  services/
  styles/
  test/
  types/
server/
firebase.json
firestore.rules
.env.example
```

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Run tests:

   ```bash
   npm run test
   ```

4. Build the app:

   ```bash
   npm run build
   ```

5. Build the live operations backend scaffold:

   ```bash
   npm run build:server
   ```

## Environment configuration

Create a local `.env` or `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then add your Supabase Auth values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app uses `window.location.origin` for auth email redirects, so make sure your deployed Vercel domain is allowed in Supabase Auth redirect URLs.

If you also want Firestore persistence instead of demo-local persistence, add your Firebase web app values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

If the Supabase env vars are omitted, the app automatically uses demo mode with local seeded data instead of crashing. If the Firebase env vars are omitted, auth can still work through Supabase while workspace data stays on demo-local persistence.

To enable live warehouse signals, also add:

- `VITE_NEXUS_LIVE_OPS_URL`
- `NEXUS_ALLOWED_ORIGIN`
- `NEXUS_LIVE_OPS_PORT`

The browser only reads `VITE_NEXUS_LIVE_OPS_URL`. The backend-only `NEXUS_*` variables should stay outside frontend code.

## Firestore collections

The app is designed around these collections:

- `users`
- `agents`
- `agentRuns`
- `memories`
- `tools`
- `usageLogs`
- `organizations`

All app documents include `organizationId` so security rules can isolate tenant data.

## Demo mode

Demo mode is enabled automatically when Firebase config is missing, or manually from the Auth page. In demo mode:

- Auth is simulated locally
- Firestore writes are replaced with localStorage persistence
- Agent runs still save and show orchestration history
- Demo seed data is bootstrapped from `src/data/demoData.ts`

## Live Ops next phase

Nexus now includes a live-ready backend scaffold in `server/` that shows how real warehouse data would flow into the UI:

1. Source systems send events from WMS, LMS, YMS, telemetry, or ERP.
2. The Live Ops API ingests those events through `/api/ingest/events`.
3. The backend updates a per-facility warehouse state model.
4. A lightweight risk engine regenerates shift health, command feed actions, predictive insights, and timeline events.
5. The frontend subscribes through server-sent events at `/api/stream`.
6. If the backend is unavailable, the app falls back to the current demo data instead of crashing.

### Live Ops endpoints

- `GET /api/health`
- `GET /api/facilities`
- `GET /api/facilities/:facilityId/state`
- `POST /api/ingest/events`
- `POST /api/simulate/:facilityId`
- `GET /api/stream?facilityId=<facilityId>`

### Run the live backend locally

1. Start the frontend:

   ```bash
   npm run dev
   ```

2. In a second terminal, start the live backend:

   ```bash
   npm run dev:server
   ```

3. Add `VITE_NEXUS_LIVE_OPS_URL=http://localhost:8787` to `.env.local`.

4. Open Settings and run a sample simulation to verify the pipeline.

### Example ingest payload

```json
{
  "event": {
    "facilityId": "columbus-dc",
    "source": "wms",
    "type": "receiving_progress",
    "occurredAt": "2026-05-27T10:12:00.000Z",
    "payload": {
      "lane": "Door 3",
      "progress": 44,
      "status": "Needs support",
      "eta": "41 min"
    }
  }
}
```

### What to connect first in production

1. WMS receiving progress and inventory events
2. LMS staffing and utilization updates
3. Yard and dock events for trailer timing
4. Telemetry and downtime signals
5. ERP shipment deadlines and customer priority overlays

## Real model integration swap point

The current orchestration engine is intentionally mock-only. To wire real providers later:

1. Keep the frontend form and orchestration timeline as-is.
2. Replace the deterministic logic in `src/services/mockOrchestrator.ts` with backend API calls.
3. Send requests through Firebase Functions, Cloud Run, or another backend layer.
4. Store provider secrets in backend-only config or environment variables, never in the frontend source.

## Notes on production architecture

- The new Live Ops API is currently an in-memory scaffold, not a persistent production event store.
- In production, replace the in-memory layer with a durable event pipeline such as Pub/Sub, Kafka, Kinesis, or Supabase/Firebase-backed operational tables.
- The UI already supports live snapshot replacement, so the safest next backend step is persistence plus authenticated connector ingestion.

## Firebase deploy instructions

1. Install the Firebase CLI if needed:

   ```bash
   npm install -g firebase-tools
   ```

2. Authenticate:

   ```bash
   firebase login
   ```

3. Point the CLI at your Firebase project:

   ```bash
   firebase use --add
   ```

4. Build the app:

   ```bash
   npm run build
   ```

5. Deploy hosting and Firestore rules:

   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

## Notes

- API keys are never stored in frontend source or persisted from the Admin page.
- Supabase anon keys are read from `VITE_SUPABASE_*` environment variables only and are never hardcoded in app source.
- `firebase.json` rewrites all routes to `index.html`, so React Router works on Firebase Hosting.
- The UI is built to remain usable on mobile with a collapsible sidebar and stacked content sections.
