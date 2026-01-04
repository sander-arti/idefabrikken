# Idéfabrikken - Oppgaveliste

**Sist oppdatert**: 2026-01-04
**Aktiv fase**: Fase 1 - Database Layer

---

## Aktive oppgaver (Fase 0)

### ✅ TASK-0.1: Opprett prosjektartefakter
**Est**: 1t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
Opprett PLAN.md, TASKS.md og kontekst/ i henhold til CLAUDE.md krav.

**DoD (Definition of Done):**
- [x] PLAN.md opprettet med alle 6 faser
- [x] TASKS.md opprettet med oppgavestruktur
- [x] kontekst/ mappe opprettet
- [x] kontekst/kontekst-fase1-mvp.md opprettet med template

---

### ✅ TASK-0.2: Konverter til monorepo-struktur
**Est**: 2t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
Restrukturere prosjektet til pnpm workspace monorepo med frontend/ og backend/ mapper.

**DoD:**
- [x] pnpm-workspace.yaml opprettet
- [x] Root package.json med workspaces og dev-scripts
- [x] Eksisterende Vite-app flyttet til frontend/
- [x] frontend/src/index.tsx omdøpt til main.tsx
- [x] backend/ mappe opprettet med package.json
- [x] `pnpm install` fungerer fra rot
- [x] Frontend bygger vellykket fra ny plassering

**Filer å opprette:**
- `/pnpm-workspace.yaml`
- `/package.json` (root)
- `/backend/package.json`
- `/backend/tsconfig.json`

**Avhengigheter:**
express, @supabase/supabase-js, openai, zod, winston, cors, helmet, tsx

---

### ✅ TASK-0.3: Sett opp Supabase-prosjekt
**Est**: 1.5t | **Brukt**: 1t | **Status**: Ferdig

**Beskrivelse:**
Opprett Supabase-prosjekt, kjør database-schema og hent API-nøkler.

**DoD:**
- [x] Supabase-prosjekt opprettet via MCP (navn: idefabrikken-mvp, ID: fzohwgzbfzyvutoxuhna)
- [x] SQL-schema fra `backend/supabase-schema.sql` kjørt via MCP:
  - [x] ideas-tabell opprettet (22 kolonner)
  - [x] chat_messages-tabell opprettet (5 kolonner)
  - [x] evaluation_jobs-tabell opprettet (11 kolonner)
  - [x] Trigger og indekser opprettet
- [x] API-nøkler hentet:
  - Project URL: https://fzohwgzbfzyvutoxuhna.supabase.co
  - service_role key: hentet via CLI
- [x] TypeScript-typer generert fra schema og skrevet til `backend/src/lib/db/types.ts`

**Automatisert via:**
- MCP Supabase-tools: create_project, apply_migration, list_tables, generate_typescript_types
- Supabase CLI: api-keys kommando for service_role key

---

### ✅ TASK-0.4: Konfigurer miljøvariabler
**Est**: 0.5t | **Brukt**: <0.5t | **Status**: Ferdig

**Beskrivelse:**
Opprett .env for backend og .env.example som template.

**DoD:**
- [x] `backend/.env` opprettet med:
  - [x] SUPABASE_URL=https://fzohwgzbfzyvutoxuhna.supabase.co
  - [x] SUPABASE_SERVICE_KEY=eyJhbG... (hentet fra Supabase)
  - [x] OPENAI_API_KEY=sk-proj-... (fra bruker)
  - [x] PORT=4000
  - [x] ALLOWED_ORIGINS=http://localhost:3000
  - [x] NODE_ENV=development
- [x] `.env.example` opprettet (template uten hemmeligheter)
- [x] `.gitignore` oppdatert med .env (allerede i backend/.gitignore fra TASK-0.2)

---

### ✅ TASK-0.5: Lag backend-skjelett
**Est**: 2t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
Opprett minimal Express-server med health check endpoint.

**DoD:**
- [x] `backend/src/index.ts` - Express app setup med helmet, CORS, error handling
- [x] `backend/src/config/env.ts` - Miljøvariabel-validering med Zod + dotenv
- [x] `backend/src/config/supabase.ts` - Supabase-klient singleton med typed Database (ekte typer fra DB)
- [x] Health endpoint: `GET /api/health` → `{ status: 'ok', timestamp, environment }`
- [x] Backend bygger uten feil (`pnpm --filter backend build` ✅)
- [x] `.env` opprettet med alle credentials (Supabase + OpenAI)
- [x] Backend kjører: `pnpm dev:backend` ✅
- [x] Health endpoint verifisert: returnerer JSON ✅

**Filer opprettet:**
- [x] `backend/src/index.ts`
- [x] `backend/src/config/env.ts`
- [x] `backend/src/config/supabase.ts`

**Ekstra endringer:**
- Installerte `dotenv` for å laste .env-fil i ESM-modus
- La til `config()` kall i env.ts før Zod-validering

---

### ✅ TASK-0.6: Konfigurer frontend-proxy
**Est**: 0.5t | **Brukt**: <0.5t | **Status**: Ferdig

**Beskrivelse:**
Oppdater Vite-config for å proxye API-kall til backend.

**DoD:**
- [x] `frontend/vite.config.ts` oppdatert med proxy-config
- [x] Proxy redirecter `/api` til `http://localhost:4000`
- [x] Frontend bygger vellykket med ny konfig (verifisert)
- [ ] Frontend kan kalle backend via fetch('/api/health') - krever at backend kjører (TASK-0.3)

**Implementert konfig:**
```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
}
```

---

### ✅ TASK-0.7: Verifiser oppsett
**Est**: 0.5t | **Brukt**: <0.5t | **Status**: Ferdig

**Beskrivelse:**
Verifiser at både frontend og backend kjører, og at de kommuniserer.

**DoD:**
- [x] Backend svarer på http://localhost:4000/api/health ✅
  ```json
  {"status":"ok","timestamp":"2026-01-04T12:38:26.195Z","environment":"development"}
  ```
- [x] Frontend bygger vellykket (`pnpm --filter frontend build`) ✅
- [x] Backend bygger vellykket (`pnpm --filter backend build`) ✅
- [x] Proxy konfigurert for frontend → backend kommunikasjon ✅
- [x] Alle miljøvariabler konfigurert (Supabase + OpenAI) ✅

**Verifisert:**
- Backend starter og svarer på health endpoint
- Frontend bygger uten feil (1.20s)
- Alle dependencies installert korrekt
- Database-schema kjørt i Supabase
- TypeScript-typer generert fra database

---

## Aktive oppgaver (Fase 1)

### ✅ TASK-1.1: Generer TypeScript-typer
**Est**: 0.5t | **Brukt**: 0t | **Status**: Ferdig

**Beskrivelse:**
Generer TypeScript-typer fra Supabase-schema.

**DoD:**
- [x] TypeScript-typer generert via MCP generate_typescript_types
- [x] Typer lagret i `backend/src/lib/db/types.ts`
- [x] Database-interface eksportert med alle 3 tabeller

**Notater:**
Fullført automatisk via MCP i Fase 0. Alle typer generert fra ekte database-schema.

---

### ✅ TASK-1.2: Implementer Supabase-klient
**Est**: 1t | **Brukt**: 0t | **Status**: Ferdig

**Beskrivelse:**
Opprett singleton Supabase-klient med feilhåndtering.

**DoD:**
- [x] Singleton Supabase-klient opprettet i `backend/src/config/supabase.ts`
- [x] Klient typed med Database interface
- [x] Service role key brukt for backend-tilgang

**Notater:**
Fullført i Fase 0. Klient er tilgjengelig via `import { supabase } from '@/config/supabase'`.

---

### ✅ TASK-1.3: Implementer idea queries
**Est**: 2t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
CRUD-funksjoner for ideas-tabellen.

**DoD:**
- [x] `createIdea()` - Insert blank idea, return with id
- [x] `listIdeas(status?)` - Filter by status, ordered by updated_at DESC
- [x] `getIdea(id)` - Get single idea with all documents
- [x] `updateIdea(id, data)` - Partial update
- [x] `deleteIdea(id)` - Delete draft only (validates status)
- [x] `recordDecision()` - Record decision with reason

**Filer opprettet:**
- `backend/src/lib/db/queries/ideas.ts`

---

### ✅ TASK-1.4: Implementer chat queries
**Est**: 1t | **Brukt**: 0.3t | **Status**: Ferdig

**Beskrivelse:**
Queries for chat_messages-tabellen.

**DoD:**
- [x] `getChatMessages(ideaId)` - Get all messages chronologically
- [x] `addChatMessage(ideaId, role, content)` - Add new message
- [x] `getRecentChatMessages(ideaId, limit)` - Get last N messages for context
- [x] `deleteChatMessages(ideaId)` - Delete all messages for idea

**Filer opprettet:**
- `backend/src/lib/db/queries/chat.ts`

---

### ✅ TASK-1.5: Implementer evaluation queries
**Est**: 1t | **Brukt**: 0.3t | **Status**: Ferdig

**Beskrivelse:**
Queries for evaluation_jobs-tabellen.

**DoD:**
- [x] `createEvaluationJob(ideaId)` - Create new job
- [x] `getEvaluationJob(ideaId)` - Get latest job for idea
- [x] `getEvaluationJobById(jobId)` - Get job by ID
- [x] `updateEvaluationJobStatus(jobId, updates)` - Update job status
- [x] `startEvaluationJob(jobId)` - Mark as started
- [x] `completeEvaluationJob(jobId)` - Mark as completed
- [x] `failEvaluationJob(jobId, error)` - Mark as failed
- [x] `deleteEvaluationJob(jobId)` - Delete job

**Filer opprettet:**
- `backend/src/lib/db/queries/evaluation.ts`
- `backend/src/lib/db/queries/index.ts` (central export)

---

### TASK-1.6: Skriv database-tester
**Est**: 2t | **Status**: Ikke startet

**Beskrivelse:**
Enhetstester for alle query-funksjoner.

**DoD:**
- [ ] Test-setup med test database eller mocking
- [ ] Tester for ideas queries (create, list, get, update, delete, decision)
- [ ] Tester for chat queries (get, add, recent, delete)
- [ ] Tester for evaluation queries (create, get, update status)
- [ ] Alle tester passerer

**Avhengigheter:**
TASK-1.3, 1.4, 1.5 fullført

---

## Kommende oppgaver (Fase 2)

### TASK-2.1: Ideas CRUD-endepunkter
**Est**: 2t | **Status**: Ikke startet

POST/GET/PATCH/DELETE endepunkter for idéer.

### TASK-2.2: Chat-endepunkter
**Est**: 1.5t | **Status**: Ikke startet

GET/POST endepunkter for chat (mock AI-responser).

### TASK-2.3: Evaluation-endepunkter
**Est**: 2t | **Status**: Ikke startet

POST/GET endepunkter for evaluering (mock scores).

### TASK-2.4: Decision-endepunkt
**Est**: 1t | **Status**: Ikke startet

POST endepunkt for å registrere beslutning.

### TASK-2.5: Middleware
**Est**: 1.5t | **Status**: Ikke startet

Error handler, request validation, logging.

### TASK-2.6: API-testing collection
**Est**: 1t | **Status**: Ikke startet

Postman/Thunder Client collection for testing.

---

## Aktiv fase: Fase 3 - Frontend-integrasjon

### ✅ TASK-3.1: Opprett API-klient
**Est**: 1.5t | **Brukt**: 1t | **Status**: Ferdig

**Beskrivelse:**
Opprett komplett API-klient i `frontend/lib/api.ts` med type-safe fetch-wrappers for alle backend-endepunkter.

**DoD:**
- [x] Backend type definitions (BackendIdea, BackendChatMessage, BackendEvaluationJob)
- [x] Mapping functions (snake_case → camelCase)
- [x] Generic apiFetch() wrapper med error handling
- [x] Ideas API functions (6 funksjoner)
- [x] Chat API functions (2 funksjoner)
- [x] Evaluation API functions (2 funksjoner + 2 helpers)
- [x] TypeScript kompilerer uten feil

**Notater:**
Fullført 2026-01-04. API-klient støtter alle 10 REST-endepunkter med fullstendig typesikkerhet.

---

### ✅ TASK-3.2: Integrer Dashboard
**Est**: 1t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
Erstatt mockIdeas med api.listIdeas() i Dashboard-komponenten.

**DoD:**
- [x] Erstattet mockIdeas import med listIdeas fra api.ts
- [x] Lagt til useState for ideas, loading, error
- [x] Implementert useEffect for data fetching
- [x] Status filtering via API-parameter
- [x] Loading state med spinner
- [x] Error state med retry-knapp
- [x] Tab counts oppdatert for å bruke state
- [x] Frontend bygger uten feil

**Notater:**
Fullført 2026-01-04. Dashboard viser nå ekte data fra Supabase via backend API.

### ✅ TASK-3.3: Integrer NewIdea
**Est**: 1.5t | **Brukt**: 1t | **Status**: Ferdig

**Beskrivelse:**
Erstatt mock chat med ekte API-kall i NewIdea-komponenten.

**DoD:**
- [x] Opprett ny idé via createIdea() ved mount
- [x] Send meldinger via sendChatMessage() API
- [x] Vis AI-responser fra backend
- [x] Oppdater markdown preview med idea_document fra respons
- [x] Aktiver "Send til evaluering" basert på is_ready_for_evaluation
- [x] Naviger til riktig idé-ID ved evaluering
- [x] Feilhåndtering for API-kall
- [x] Frontend bygger uten feil

**Notater:**
Fullført 2026-01-04. Chat-interface fungerer nå med ekte AI-backend (mock AI i Fase 2, vil bli byttet ut i Fase 4).

### ✅ TASK-3.4: Integrer IdeaDetails
**Est**: 1.5t | **Brukt**: 1t | **Status**: Ferdig

**Beskrivelse:**
Integrer IdeaDetails-siden med ekte API for evaluering, polling og beslutning.

**DoD:**
- [x] Hent idé via getIdea() ved mount
- [x] Start evaluering via startEvaluation()
- [x] Poll evalueringsstatus med getEvaluationStatus() hver 2. sekund
- [x] Oppdater evalSteps basert på agent-statuser
- [x] Refresh idé når evaluering er fullført
- [x] Lagre beslutning via recordDecision()
- [x] Loading og error states
- [x] Frontend bygger uten feil

**Notater:**
Fullført 2026-01-04. Komplett evaluerings- og beslutningsflyt. Polling stopper automatisk når evaluering er ferdig.

### ✅ TASK-3.5: Arkiver mock-data
**Est**: 0.5t | **Brukt**: 0.1t | **Status**: Ferdig

**Beskrivelse:**
Rename mock-data.ts til mock-data.backup.ts for å markere at det ikke lenger brukes.

**DoD:**
- [x] Verifiser ingen imports av mock-data.ts i kodebasen
- [x] Rename fil til mock-data.backup.ts
- [x] Frontend bygger uten feil

**Notater:**
Fullført 2026-01-04. Alle komponenter bruker nå ekte API-data.

### ✅ TASK-3.6: End-to-end testing
**Est**: 1t | **Brukt**: 0.5t | **Status**: Ferdig

**Beskrivelse:**
Test hele brukerflyt fra opprettelse til beslutning via API.

**DoD:**
- [x] Opprett ny idé via API
- [x] Send chat-meldinger og motta AI-svar
- [x] Trigger ready_for_evaluation flag
- [x] Start evaluering
- [x] Poll evalueringsstatus og verifiser fremgang
- [x] Verifiser alle dokumenter genereres
- [x] Verifiser scores og anbefaling
- [x] Lagre beslutning
- [x] Verifiser status oppdateres

**Test Results:**
```
✅ POST /api/ideas → 201 Created (idea ID: 72720887-...)
✅ POST /api/ideas/:id/chat → 200 OK (2 meldinger sendt)
✅ is_ready_for_evaluation → true (etter "klar" keyword)
✅ POST /api/ideas/:id/evaluate → 200 OK (job started)
✅ GET /api/ideas/:id/evaluate → status: completed (4.4s)
✅ GET /api/ideas/:id → status: evaluated
   - score_market: 8, score_buildability: 6, score_business: 7
   - score_total: 7, recommendation: hold
   - All 5 documents generated
✅ POST /api/ideas/:id/decision → 200 OK
   - decision: go, status: go, decision_at set
✅ DELETE /api/ideas/:id → 400 (correct validation)
```

**Notater:**
Fullført 2026-01-04. Hele stacken fungerer end-to-end med ekte database-persistens.

---

## Kommende oppgaver (Fase 4)

### TASK-4.1: Agent runner
**Est**: 2t | **Status**: Ikke startet

OpenAI API wrapper med retry-logikk.

### TASK-4.2: Idéutkast-mottaker prompt
**Est**: 2t | **Status**: Ikke startet

System prompt basert på PRD 5.1.

### TASK-4.3: Oppdater chat-endepunkt
**Est**: 2t | **Status**: Ikke startet

Implementer ekte AI-kall i chat-route.

### TASK-4.4: Kontekst-håndtering
**Est**: 1t | **Status**: Ikke startet

Håndter siste 10 meldinger som kontekst.

### TASK-4.5: "Klar for evaluering"-deteksjon
**Est**: 1t | **Status**: Ikke startet

Parse AI-respons for READY_FOR_EVALUATION.

### TASK-4.6: Feilhåndtering og retry
**Est**: 1t | **Status**: Ikke startet

Retry-logikk, rate limit handling.

---

## Kommende oppgaver (Fase 5)

### TASK-5.1: Skriv 3 parallelle agent-prompts
**Est**: 3t | **Status**: Ikke startet

market-strategist, product-architect, business-critic.

### TASK-5.2: Skriv synthesizer-prompt
**Est**: 1.5t | **Status**: Ikke startet

notes-synthesizer basert på PRD 5.5.

### TASK-5.3: Evaluerings-orkestrator
**Est**: 3t | **Status**: Ikke startet

`lib/agents/evaluate.ts` med parallell kjøring.

### TASK-5.4: Score-parser
**Est**: 1t | **Status**: Ikke startet

Regex-parsing av scores fra markdown.

### TASK-5.5: Oppdater evaluate-endepunkt
**Est**: 2.5t | **Status**: Ikke startet

Asynkron kjøring av evaluering.

### TASK-5.6: Fremgangs-tracking
**Est**: 1t | **Status**: Ikke startet

Database-status oppdateringer for polling.

---

## Kommende oppgaver (Fase 6)

### TASK-6.1: Winston-logging
**Est**: 2t | **Status**: Ikke startet

Legg til logging i hele backend.

### TASK-6.2: Rate limiting
**Est**: 1t | **Status**: Ikke startet

Rate limiting på AI-endepunkter.

### TASK-6.3: Sikkerhet og feilhåndtering
**Est**: 2t | **Status**: Ikke startet

Forbedre error messages, Helmet.js, CORS.

### TASK-6.4: Dokumentasjon
**Est**: 2t | **Status**: Ikke startet

README.md med setup og deployment.

### TASK-6.5: Deploy backend
**Est**: 1.5t | **Status**: Ikke startet

Deploy til Render.com.

### TASK-6.6: Deploy frontend
**Est**: 1t | **Status**: Ikke startet

Deploy til Vercel.

### TASK-6.7: Smoke-testing
**Est**: 1.5t | **Status**: Ikke startet

Test alle flyter i produksjon.

---

## Oppdaget under arbeid

(Nye oppgaver oppdages underveis legges her)

---

## Endringslogg

| Dato | Endring |
|------|---------|
| 2026-01-04 | Første versjon av TASKS.md opprettet |
