# Genesis UI — alignment with System Design Document

This document summarizes what was implemented in the **Genesis UI Platform** (Vite + React) so Mission Control behavior matches the **SYSTEM_DESIGN_DOC** intent and the **staging OpenAPI** (not the doc’s literal path names where they differ from the real API).

---

## 1. API contracts (OpenAPI, not guessed SDD strings)

The SDD mentions paths like `/dashboard/overview`, `/businesses/{id}/activity`, and chat `since_seq`. The live API uses different routes; the UI was wired to **OpenAPI v1** on Cloud Run, for example:

| Area | Implemented endpoint(s) |
|------|-------------------------|
| User / business dashboard | `GET /api/v1/dashboard`, `GET /api/v1/businesses/{business_id}/dashboard` |
| Agent activity timeline | `GET /api/v1/agent-activity` (query: `business_id`, `agent`, `status`, `limit`, `offset`, …) |
| Chat | `GET /api/v1/businesses/{business_id}/chat/messages` (`after` cursor = UUID), `POST` …/messages with body `{ content }` |
| Pending approvals (operator) | `GET /api/v1/agent-approvals/pending` (403 for entrepreneur → UI treats as empty) |
| Settings | `GET/PUT /api/v1/settings/guardrails`, `GET/PUT /api/v1/settings/notification-prefs`, `GET /api/v1/settings/billing` |

**New / updated code:** `src/api/genesis/dashboardApi.ts`, `agentActivityApi.ts`, `businessChatApi.ts`, `agentApprovalsApi.ts`, `settingsApi.ts`, types under `src/types/`, exports in `src/api/genesis/index.ts`.

---

## 2. Authentication and JWT

- **`configureGenesisApi`** (`src/api/genesis/client.ts`): uses Firebase **`getIdToken()`** and refresh retry via **`getIdToken(true)`** on 401 when Firebase is active.
- **`src/auth/AuthContext.jsx`**: if `VITE_FIREBASE_*` is set → **Firebase** `signInWithEmailAndPassword` + `onAuthStateChanged`; else **dev mock** login + `VITE_GENESIS_API_BEARER_TOKEN` / dev fallback token.
- **`src/auth/firebaseApp.ts`**: lazy Firebase app/auth from `getFirebaseWebConfig()` in `src/config/genesisEnv.ts`.
- **Service worker (shell):** `public/genesis-sw.js` + `src/auth/registerOptionalServiceWorker.ts` (registered in **production** only) — placeholder for SDD “silent refresh in SW”; token refresh is handled in the client via `onUnauthorized` today.

**Config:** `.env.example` documents Firebase vs mock behavior.

---

## 3. TanStack Query and polling

- **Dependency:** `@tanstack/react-query`.
- **`src/queryClient.ts`** + **`QueryClientProvider`** in `src/main.jsx`.
- **`src/lib/genesisPolling.ts`:** ~**30s** dashboard-style polling, ~**3s** interactive (activity / chat when enabled), **pause when `document.visibilityState === 'hidden'`**, **exponential backoff** after fetch failures.

**Hooks moved to React Query:** `useMyEntitiesFromApi`, `useNotifications`, `useBusinessMilestones`, `useLegalDocumentsForBusiness`, plus **`useDashboardOverviewQuery`**, **`useAgentActivityListQuery`**.

---

## 4. Six Mission Control surfaces (wiring)

| Screen | What changed |
|--------|----------------|
| **Dashboard** | KPI strip and recent activity fed from **`useDashboardOverviewQuery`** (`/dashboard` or per-business `/businesses/{id}/dashboard`). `RecentAgentActivity` shows **`recent_activity`** from API or an empty state (demo list removed). |
| **My Businesses** | Routes **`/businesses`** and **`/businesses/:id`** in `src/router.jsx`; sidebar / `ActiveEntities` links updated; **`ActiveBusinessContext`** syncs URL `business_id` → active business. |
| **Agent Activity** | Uses **`/api/v1/agent-activity`** with server-side filters; static orchestrator demo rows **removed**; remount on `businessId` resets local filters. |
| **Legal** | Added **Deal** category (`legal.catDeal`) to match SDD vault grouping; `LegalCompliancePage.jsx` sidebar updated. |
| **Orchestrator chat** | **`OrchestratorChat.jsx`**: polls messages when open + business selected; **POST** new messages; no mock transcript. |
| **Settings** | **Billing** tab prefetches **`GET /api/v1/settings/billing`** and surfaces plan / monthly cost / agent caps when the API returns them. (Guardrails / notification prefs APIs exist; full form bind can follow when backend is stable.) |

**Approval UX:** `ApprovalBanner.jsx`, `DashboardLayout` **`topSlot`**, `App.jsx` derives pending count from **`pending_approvals`** on the business dashboard and/or unread **`approval_required`** notifications; **FAB badge** uses the same count (no hardcoded `2`).

---

## 5. Hebrew-first, RTL, ILS

- **`index.html`:** default **`lang="he"`** and **`dir="rtl"`** (I18n still toggles `dir` with locale).
- **`src/i18n/I18nContext.jsx`:** default locale **`he`** (was `en`).
- **`src/utils/formatNis.ts`:** **`he-IL`** currency formatting unless locale is explicitly **`en`**.

Additional user-facing strings for errors / banner / chat / login were added to **`src/i18n/en.json`** and **`src/i18n/he.json`**.

---

## 6. Stack and scope (SDD vs repo)

- The SDD calls out **Next.js**; this repo remains **Vite + React** — documented in **`src/config/genesisEnv.ts`** (Mission Control parity is REST + polling + auth + RTL, not the framework name).
- **Landing + multi-step registration** remain as acquisition flows; noted in the same comment block as outside the core six-screen Mission Control checklist.

---

## 7. Files worth scanning for details

| Topic | Files |
|-------|--------|
| API | `src/api/genesis/*.ts`, `src/types/dashboardOverview.ts`, `agentActivity.ts`, `chatMessage.ts` |
| Auth & SW | `src/auth/AuthContext.jsx`, `firebaseApp.ts`, `registerOptionalServiceWorker.ts`, `public/genesis-sw.js` |
| Query & polling | `src/queryClient.ts`, `src/main.jsx`, `src/lib/genesisPolling.ts`, `src/hooks/use*Query*.ts` |
| UI | `src/App.jsx`, `src/layouts/DashboardLayout.jsx`, `src/components/ApprovalBanner.jsx`, `src/components/OrchestratorChat.jsx`, `src/components/RecentAgentActivity.jsx`, `src/pages/AgentActivityPage.jsx`, `src/pages/SettingsPage.jsx`, `src/pages/LegalCompliancePage.jsx` |
| Routing & business | `src/router.jsx`, `src/context/ActiveBusinessContext.tsx`, `src/components/Sidebar.jsx`, `src/components/ActiveEntities.jsx` |
| Env | `.env.example`, `src/vite-env.d.ts` |

---

## 8. Optional follow-ups (not blocking)

- Map **RFC 9457** `code` / `title` to **Hebrew-only** copy everywhere the entrepreneur sees errors (`src/api/genesis/errors.ts` + i18n).
- **Phone OTP** (Firebase) if product requires parity with SDD “email + phone”.
- **Rich chat** (HITL cards from API payloads) when message schema is defined in OpenAPI.
- **Guardrails / notification prefs** full read/write UI once `GET/PUT` settings endpoints return 200 consistently in all environments.

---

*Generated for traceability against SYSTEM_DESIGN_DOC §3 (Mission Control) and OpenAPI v1.*
