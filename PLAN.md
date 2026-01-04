# Idéfabrikken - Utviklingsplan

**Versjon**: 1.0
**Sist oppdatert**: 2026-01-04
**Aktiv fase**: Fase 4 - AI Agents (Chat)

---

## Oversikt

Dette dokumentet beskriver utviklingsfasene for Idéfabrikken MVP, fra bootstrap til produksjonsklar løsning.

**Nåværende situasjon (2026-01-04):**
- ✅ Komplett Vite + React frontend med polert UI
- ✅ Express.js backend med 10 REST-endepunkter
- ✅ Supabase PostgreSQL med 3 tabeller (ideas, chat_messages, evaluation_jobs)
- ✅ Full frontend-backend-database integrasjon
- ✅ Mock AI (keyword-basert) - klar for OpenAI-implementering
- 🔄 OpenAI GPT-4o integrasjon gjenstår (Fase 4-5)

**Målsituasjon (MVP):**
- Fungerende backend med Express.js + TypeScript
- Supabase PostgreSQL for persistering
- OpenAI GPT-4o for 5 AI-agenter
- Full integrasjon som erstatter all mock data

---

## Fase 0: Bootstrap & Setup

**Mål**: Prosjektstruktur klar, Supabase konfigurert, begge servere kjører
**Varighet**: 4-6 timer
**Status**: ✅ Fullført
**Avhengigheter**: Ingen

### Oppgaver

- [x] 0.1: Opprett prosjektartefakter (PLAN.md, TASKS.md, kontekst/)
- [x] 0.2: Konverter til monorepo-struktur (pnpm workspaces)
- [x] 0.3: Sett opp Supabase-prosjekt og kjør schema
- [x] 0.4: Konfigurer miljøvariabler (.env)
- [x] 0.5: Lag backend-skjelett (Express + TypeScript)
- [x] 0.6: Konfigurer frontend-proxy (Vite)
- [x] 0.7: Verifiser oppsett (begge servere kjører)

### Suksesskriterier

- ✅ Backend svarer på http://localhost:4000/api/health
- ✅ Frontend kjører på http://localhost:3000
- ✅ Frontend kan kalle backend via proxy
- ✅ Supabase-tabeller opprettet og tilgjengelige
- ✅ Build og lint passerer

---

## Fase 1: Databaselag

**Mål**: Database-queries fungerer, typer matcher schema
**Varighet**: 3-4 timer
**Status**: Pågår
**Avhengigheter**: Fase 0 fullført

### Oppgaver

- [x] 1.1: Generer TypeScript-typer fra Supabase-schema
- [x] 1.2: Implementer Supabase-klient (singleton)
- [x] 1.3: Implementer queries for ideas (CRUD)
- [x] 1.4: Implementer queries for chat_messages
- [x] 1.5: Implementer queries for evaluation_jobs
- [ ] 1.6: Skriv tester for query-funksjoner

### Suksesskriterier

- ✅ Alle queries testet mot ekte Supabase
- ✅ TypeScript strict mode passerer
- ✅ Kan opprette, lese, oppdatere idéer/meldinger/jobber

---

## Fase 2: API-endepunkter (uten AI)

**Mål**: REST API komplett med mock AI-responser
**Varighet**: 4-6 timer
**Status**: ✅ Fullført
**Avhengigheter**: Fase 1 fullført

### Oppgaver

- [x] 2.1: Implementer ideas CRUD-endepunkter
- [x] 2.2: Implementer chat-endepunkter (mock AI)
- [x] 2.3: Implementer evaluation-endepunkter (mock scores)
- [x] 2.4: Implementer decision-endepunkt
- [x] 2.5: Legg til middleware (error handling, validation)
- [ ] 2.6: Opprett Postman/Thunder Client collection (optional)

### Suksesskriterier

- ✅ Alle 10 endepunkter fungerer
- ✅ Request-validering med Zod
- ✅ Feilhåndtering returnerer JSON
- ✅ Data persisterer i database

---

## Fase 3: Frontend-integrasjon

**Mål**: Erstatt all mock data med ekte API-kall
**Varighet**: 4-6 timer (Faktisk: 4 timer)
**Status**: ✅ Fullført
**Avhengigheter**: Fase 2 fullført
**Fullført**: 2026-01-04

### Oppgaver

- [x] 3.1: Opprett API-klient (`frontend/lib/api.ts`) med type-safe wrappers
- [x] 3.2: Integrer Dashboard med ekte data (listIdeas, loading, error states)
- [x] 3.3: Integrer NewIdea (chat) med ekte API (createIdea, sendChatMessage)
- [x] 3.4: Integrer IdeaDetails med polling for evaluering (getEvaluationStatus)
- [x] 3.5: Arkiver mock-data.ts → mock-data.backup.ts
- [x] 3.6: Test alle flyter end-to-end (komplett brukerflyt testet)

### Suksesskriterier

- ✅ Dashboard viser ekte idéer fra database med filtering
- ✅ Chat lagrer meldinger og mottar mock AI-svar
- ✅ Evaluering viser fremgang via polling (2s interval)
- ✅ Beslutning persisterer etter refresh
- ✅ Alle builds grønne, ingen mock-data imports
- ✅ End-to-end test bekreftet: opprett → chat → evaluer → beslutt

---

## Fase 4: AI-agenter - Chat

**Mål**: Ekte AI-drevet struktureringssamtale
**Varighet**: 6-8 timer
**Status**: Ikke startet
**Avhengigheter**: Fase 3 fullført

### Oppgaver

- [ ] 4.1: Implementer agent runner (OpenAI wrapper)
- [ ] 4.2: Skriv Idéutkast-mottaker prompt (basert på PRD 5.1)
- [ ] 4.3: Oppdater chat-endepunkt med ekte AI-kall
- [ ] 4.4: Implementer kontekst-håndtering (siste 10 meldinger)
- [ ] 4.5: Implementer "klar for evaluering"-deteksjon
- [ ] 4.6: Legg til retry-logikk og feilhåndtering

### Suksesskriterier

- ✅ Chat-agent strukturerer idéer gjennom samtale
- ✅ Preview oppdateres med ekte IDÉUTKAST.md
- ✅ Agent signaliserer når klar for evaluering
- ✅ Samtale persisteres i database

---

## Fase 5: AI-agenter - Evaluering

**Mål**: Ekte evaluering med 4 AI-agenter (3 parallelle + 1 sekvensiel)
**Varighet**: 8-12 timer
**Status**: Ikke startet
**Avhengigheter**: Fase 4 fullført

### Oppgaver

- [ ] 5.1: Skriv prompts for 3 parallelle agenter (market/product/business)
- [ ] 5.2: Skriv prompt for synthesizer-agent
- [ ] 5.3: Implementer evaluerings-orkestrator (`lib/agents/evaluate.ts`)
- [ ] 5.4: Implementer score-parser (regex fra markdown)
- [ ] 5.5: Oppdater evaluate-endepunkt med asynkron kjøring
- [ ] 5.6: Implementer fremgangs-tracking (database-status)

### Suksesskriterier

- ✅ 3 agenter kjører parallelt (~30-60s totalt)
- ✅ Synthesizer produserer sammendrag med anbefaling
- ✅ Alle 5 dokumenter lagres i database
- ✅ Scores og anbefaling lagres
- ✅ Frontend poller/subscriber til evaluerings-fremgang

---

## Fase 6: Produksjonspolering

**Mål**: Deployment-klar med proper logging og dokumentasjon
**Varighet**: 6-8 timer
**Status**: Ikke startet
**Avhengigheter**: Fase 5 fullført

### Oppgaver

- [ ] 6.1: Legg til Winston-logging i hele backend
- [ ] 6.2: Implementer rate limiting på AI-endepunkter
- [ ] 6.3: Forbedre feilmeldinger og sikkerhet
- [ ] 6.4: Skriv README.md med setup og deployment
- [ ] 6.5: Deploy backend (Render.com)
- [ ] 6.6: Deploy frontend (Vercel)
- [ ] 6.7: Smoke-test alle flyter i produksjon

### Suksesskriterier

- ✅ Backend deployed og tilgjengelig
- ✅ Frontend deployed og koblet til backend
- ✅ Full flyt fungerer: Opprett → Chat → Evaluer → Beslutt
- ✅ README har komplett setup + deployment-guide
- ✅ MVP klar for lansering

---

## Milepæler

| Milepæl | Beskrivelse | Planlagt dato | Status |
|---------|-------------|---------------|--------|
| M0 | Backend + frontend kjører lokalt | Dag 1 | Pågår |
| M1 | Database-lag fungerer | Dag 1-2 | Ikke startet |
| M2 | API komplett (mock AI) | Dag 2 | Ikke startet |
| M3 | Frontend integrert | Dag 2-3 | Ikke startet |
| M4 | AI chat fungerer | Dag 3-4 | Ikke startet |
| M5 | AI evaluering fungerer | Dag 4-5 | Ikke startet |
| M6 | Deployed til produksjon | Dag 5-7 | Ikke startet |

---

## Future Scope (etter MVP)

### Fase 7: Autentisering og Team (ikke i MVP)
- Supabase Auth med magic link
- Brukerinfo på idéer
- Enkel rolle-håndtering

### Fase 8: Automatiske sensorer (ikke i MVP)
- Sensor #2-6: AI-nyheter, newsletters, podcasts, Doffin
- Analyzer-agent for signalkondensering
- Ideator-agent for idégenerering

### Fase 9: Loop 1 - Build & Launch (ikke i MVP)
- Start Loop 1 fra "Gå videre"-beslutning
- Dev Agent, Launch Agent, QA Agent
- 10-dagers build-syklus

### Fase 10: Skalering (ikke i MVP)
- Loop 2 for vekst
- Parallelle produktspor
- Portfolio-dashboard
- Slack-integrasjon

---

## Risikoer

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|---------------|------------|------------|
| OpenAI rate limits | Medium | Høy | Retry-logikk, eksponentiell backoff, request-kø |
| Evaluering tar >2min | Medium | Lav | Vis fremgang, tillat navigering bort, poll i bakgrunnen |
| Frontend/backend type mismatch | Høy | Medium | Del typer via workspace, valider med Zod |
| AI hallucinations i scores | Medium | Medium | Iterer på prompts, valider outputs |

---

## Endringslogg

| Dato | Versjon | Endring |
|------|---------|---------|
| 2026-01-04 | 1.0 | Første versjon av PLAN.md basert på bootstrap-plan |
