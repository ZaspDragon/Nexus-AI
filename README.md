# NEXUS AI MVP

NEXUS AI is a production-style MVP for an agentic orchestration platform built with React, Vite, Tailwind CSS, Firebase Auth, and Firestore-ready persistence. The app ships with a full demo mode so the experience works without paid model keys or a live Firebase project.

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
- Firebase Auth
- Firestore
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

## Firebase configuration

Create a local `.env` or `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then add your Firebase web app values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

If these values are omitted, the app automatically uses demo mode with local seeded data.

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

## Real model integration swap point

The current orchestration engine is intentionally mock-only. To wire real providers later:

1. Keep the frontend form and orchestration timeline as-is.
2. Replace the deterministic logic in `src/services/mockOrchestrator.ts` with backend API calls.
3. Send requests through Firebase Functions, Cloud Run, or another backend layer.
4. Store provider secrets in backend-only config, never in the frontend.

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
- `firebase.json` rewrites all routes to `index.html`, so React Router works on Firebase Hosting.
- The UI is built to remain usable on mobile with a collapsible sidebar and stacked content sections.
