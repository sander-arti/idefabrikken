# PRD: Idéfabrikken

> AI-drevet plattform for strukturering og evaluering av produktidéer

**Versjon**: 1.0  
**Sist oppdatert**: 2026-01-04  
**Eier**: ARTI Consult (Sander, Vegard, Jørgen)

---

## 1. Sammendrag

Idéfabrikken er en intern plattform som lar ARTI-teamet legge inn produktidéer, strukturere dem gjennom en AI-assistert samtale, og få dem evaluert av flere spesialiserte AI-agenter. Målet er å gå fra "løs idé" til "informert beslutning" på minutter i stedet for dager.

### 1.1 Problemet vi løser

ARTI Consult ønsker å systematisk evaluere og prioritere produktidéer for å bygge B2B AI-løsninger raskt. I dag skjer dette ad-hoc gjennom samtaler og magefølelse. Det mangler:

- Strukturert måte å fange og dokumentere idéer
- Objektiv evaluering på tvers av marked, teknologi og forretning
- Historikk og læring fra tidligere vurderinger
- Konsistent beslutningsgrunnlag

### 1.2 Løsningen

En webapplikasjon der:

1. Bruker beskriver en idé i naturlig språk
2. AI-agent strukturerer idéen gjennom oppfølgingsspørsmål
3. Tre spesialiserte AI-agenter evaluerer parallelt (marked, teknologi, forretning)
4. En syntese-agent samler evalueringene til én anbefaling
5. Bruker tar beslutning basert på komplett dokumentasjon

### 1.3 Suksesskriterier

| Metrikk | Mål |
|---------|-----|
| Tid fra idé til beslutningsgrunnlag | < 5 minutter |
| Struktureringssamtale | Maks 5 meldinger før idé er klar |
| Evalueringskvalitet | Teamet opplever evalueringene som nyttige og presise |
| Adopsjon | All idéevaluering skjer i plattformen innen 2 uker |

---

## 2. Scope

### 2.1 MVP Scope (Fase 1)

**Må ha:**

- [ ] Dashboard med oversikt over alle idéer og statuser
- [ ] Opprette ny idé og starte struktureringssamtale
- [ ] Interaktiv chat med AI-agent som stiller oppfølgingsspørsmål
- [ ] Live preview av strukturert idé (IDÉUTKAST.md) under samtalen
- [ ] Trigger evaluering når idé er strukturert
- [ ] Parallell kjøring av 3 evaluerings-agenter
- [ ] Syntese-agent som samler evalueringer
- [ ] Visning av evalueringsresultat med scores og anbefaling
- [ ] Tilgang til alle 5 dokumenter (idéutkast + 4 evalueringer)
- [ ] Ta beslutning (Gå videre / Avvent / Forkast) med valgfri begrunnelse
- [ ] Filtrering av idéer på status
- [ ] Persistent lagring av alt i database

**Ikke i MVP:**

- ❌ Autentisering/brukerkontoer (alle har tilgang)
- ❌ Automatiske sensorer (AI-nyheter, etc.)
- ❌ Analyzer/Ideator-agenter
- ❌ Loop 1/2 (bygging og lansering)
- ❌ Slack-integrasjon
- ❌ Eksport til PDF
- ❌ Mobil-optimalisering

### 2.2 Future Scope (Fase 2+)

**Fase 2: Autentisering og team**
- Supabase Auth med magic link
- Brukerinfo på idéer (hvem opprettet, hvem besluttet)
- Enkel rolle-håndtering

**Fase 3: Automatiske sensorer**
- Sensor #2-6: AI-nyheter, newsletters, podcasts, Doffin, trendscout
- Analyzer-agent for signalkondensering
- Ideator-agent for idégenerering
- Flere HIL-gates i flyten

**Fase 4: Loop 1 - Build & Launch**
- Start Loop 1 fra "Gå videre"-beslutning
- Dev Agent, Launch Agent, QA Agent
- KPI-tracking og rapportering
- 10-dagers build-syklus

**Fase 5: Skalering**
- Loop 2 for vekst
- Parallelle produktspor
- Portfolio-dashboard
- Slack-integrasjon for alle HIL-gates

---

## 3. Brukerreiser

### 3.1 Hovedflyt: Ny idé → Beslutning

```
┌─────────────────────────────────────────────────────────────────┐
│  STEG 1: OPPRETT IDÉ                                            │
│                                                                 │
│  Bruker: Klikker "Ny idé" på dashboard                          │
│  System: Åpner chat-interface med AI-agent                      │
│  System: Viser tom preview på høyre side                        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 2: STRUKTURERINGSSAMTALE                                  │
│                                                                 │
│  AI: "Hei! Fortell meg om idéen din. Hva er problemet du        │
│       ønsker å løse, og hvem har dette problemet?"              │
│                                                                 │
│  Bruker: Beskriver idéen i naturlig språk                       │
│                                                                 │
│  AI: Stiller oppfølgingsspørsmål om:                            │
│      - Målgruppe (hvem har problemet?)                          │
│      - Problemets alvorlighet (hvor vondt gjør det?)            │
│      - Eksisterende løsninger (hva gjør de i dag?)              │
│      - Timing (hvorfor er dette aktuelt nå?)                    │
│      - Forretningsmodell (hvem betaler for hva?)                │
│                                                                 │
│  System: Oppdaterer preview med strukturert innhold løpende     │
│                                                                 │
│  AI: "Jeg har nok info nå. Se over utkastet - ser det riktig    │
│       ut? Du kan sende til evaluering når du er klar."          │
│                                                                 │
│  Bruker: Klikker "Send til evaluering"                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 3: EVALUERING                                             │
│                                                                 │
│  System: Viser evalueringsstatus med progress-indikator         │
│                                                                 │
│  [Parallelt]                                                    │
│  ├── Market Strategist: Analyserer marked...                    │
│  ├── Product Architect: Vurderer byggbarhet...                  │
│  └── Business Critic: Evaluerer forretningsmodell...            │
│                                                                 │
│  [Sekvensielt etter parallell]                                  │
│  └── Notes Synthesizer: Samler evalueringer...                  │
│                                                                 │
│  System: Redirecter til resultatside når ferdig                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 4: RESULTAT & BESLUTNING                                  │
│                                                                 │
│  System: Viser total score (f.eks. 7.7/10)                      │
│  System: Viser breakdown (Marked: 8, Byggbarhet: 8, Forr: 7)    │
│  System: Viser AI-anbefaling med begrunnelse                    │
│  System: Viser faner for alle 5 dokumenter                      │
│                                                                 │
│  Bruker: Leser sammendrag og evt. dykker ned i rapporter        │
│                                                                 │
│  Bruker: Tar beslutning:                                        │
│          [Gå videre] - Denne skal vi bygge                      │
│          [Avvent] - Interessant, men trenger mer info           │
│          [Forkast] - Ikke aktuell nå                            │
│                                                                 │
│  Bruker: Legger til valgfri begrunnelse                         │
│                                                                 │
│  System: Lagrer beslutning, oppdaterer status                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Sekundærflyt: Se tidligere idéer

1. Bruker åpner dashboard
2. Bruker filtrerer på status (f.eks. "Gå videre")
3. Bruker klikker på idé
4. System viser evalueringsresultat og beslutning
5. Bruker kan lese alle dokumenter

### 3.3 Sekundærflyt: Fortsette utkast

1. Bruker åpner dashboard
2. Bruker ser idé med status "Utkast"
3. Bruker klikker på idéen
4. System gjenopptar chat-samtalen
5. Bruker fortsetter struktureringen

---

## 4. Funksjonelle krav

### 4.1 Dashboard

**FR-001**: Dashboard skal vise liste over alle idéer

**FR-002**: Hver idé i listen skal vise:
- Tittel
- Kort beskrivelse (maks 2 linjer)
- Status med visuell indikator
- Score (hvis evaluert)
- Anbefaling (hvis evaluert)
- Opprettet dato
- Sist oppdatert

**FR-003**: Bruker skal kunne filtrere idéer på status:
- Alle
- Utkast
- Under evaluering
- Venter beslutning (evaluert, men ingen beslutning)
- Gå videre
- Avvent
- Forkastet

**FR-004**: Filter-tabs skal vise antall idéer i hver kategori

**FR-005**: Idéer skal sorteres etter sist oppdatert (nyeste først)

**FR-006**: Dashboard skal ha prominent "Ny idé" knapp

### 4.2 Struktureringssamtale

**FR-010**: System skal starte samtale med åpent spørsmål om problem og målgruppe

**FR-011**: AI-agent skal stille oppfølgingsspørsmål når informasjon mangler for å fylle ut IDÉUTKAST-strukturen

**FR-012**: AI-agent skal oppdatere preview av IDÉUTKAST.md etter hver respons

**FR-013**: Preview skal markere seksjoner som mangler info med visuell indikator

**FR-014**: Bruker skal kunne se hele chat-historikken

**FR-015**: Bruker skal kunne lagre utkast og fortsette senere

**FR-016**: "Send til evaluering" skal kun være aktiv når AI-agent vurderer idéen som tilstrekkelig strukturert

**FR-017**: Ved "Send til evaluering" skal IDÉUTKAST.md lagres og evaluering startes

### 4.3 Evaluering

**FR-020**: Evaluering skal kjøre 3 agenter parallelt:
- Market Strategist
- Product Architect  
- Business Critic

**FR-021**: Når alle 3 er ferdig, skal Notes Synthesizer kjøre

**FR-022**: System skal vise sanntids fremdrift under evaluering

**FR-023**: Hvert agent-steg skal vise status: venter / kjører / ferdig / feilet

**FR-024**: Ved feil i én agent skal de andre fortsette

**FR-025**: Bruker skal kunne navigere bort og komme tilbake uten å miste fremdrift

**FR-026**: Total evalueringstid skal logges for optimalisering

### 4.4 Evalueringsresultat

**FR-030**: Resultatside skal vise total score (0-10, én desimal)

**FR-031**: Resultatside skal vise breakdown av scores:
- Markedspotensial (0-10)
- Byggbarhet (0-10)
- Forretningsmodell (0-10)

**FR-032**: Resultatside skal vise AI-anbefaling (Gå videre / Avvent / Forkast)

**FR-033**: Resultatside skal vise kort begrunnelse for anbefalingen

**FR-034**: Resultatside skal ha faner for alle 5 dokumenter:
- Sammendrag (EVALUATE_SUMMARY.md)
- Markedsanalyse (MARKET_REPORT.md)
- Produktkrav (PRD.md)
- Risikovurdering (RISK_ASSESSMENT.md)
- Idéutkast (IDÉUTKAST.md)

**FR-035**: Hvert dokument skal rendres som formatert Markdown

**FR-036**: Hvert dokument skal ha "Kopier Markdown" funksjon

### 4.5 Beslutning

**FR-040**: Bruker skal kunne velge mellom tre beslutninger:
- Gå videre
- Avvent
- Forkast

**FR-041**: Bruker skal kunne legge til valgfri begrunnelse

**FR-042**: Beslutning skal lagres med tidsstempel

**FR-043**: Etter beslutning skal status oppdateres og vises på dashboard

**FR-044**: Beslutning skal være permanent (kan ikke endres i MVP)

---

## 5. AI-Agenter

### 5.1 Idéutkast-mottaker

**Formål**: Strukturere løse idéer til komplett IDÉUTKAST.md gjennom samtale

**Type**: Interaktiv chat-agent

**Atferd**:
- Starter med åpent spørsmål om problem og målgruppe
- Stiller ett oppfølgingsspørsmål av gangen
- Fokuserer på det viktigste som mangler
- Unngår ja/nei-spørsmål - bruker åpne spørsmål
- Oppsummerer forståelse før den spør videre
- Signaliserer tydelig når den har nok info

**Spørsmålsområder** (ikke nødvendigvis i denne rekkefølgen):
1. Problemet (hva er smerten, hvor vondt gjør det)
2. Målgruppe (hvem har problemet, rolle, bransje, størrelse)
3. Nåværende løsning (hva gjør de i dag)
4. Timing (hvorfor er dette aktuelt akkurat nå)
5. Verdiforslag (hvordan løser vi det bedre)
6. Forretningsmodell (hvem betaler, for hva)

**Output**: IDÉUTKAST.md med følgende struktur:

```markdown
# [Produktnavn]

**Slagord**: [Én setning som fanger essensen]

## Problemet
[Hvem har problemet? Hva er det konkret? Hvor vondt gjør det?]

## Ideell kunde (ICP)
- **Rolle**: [f.eks. prosjektleder]
- **Bransje**: [f.eks. bygg og anlegg]
- **Bedriftsstørrelse**: [f.eks. 10-100 ansatte]

## Oppgaver som skal løses (JTBD)
- Som [rolle] vil jeg [oppgave] for å [resultat]
- Som [rolle] vil jeg [oppgave] for å [resultat]

## Hvorfor nå?
[Hva har endret seg i teknologi/marked/regulering som gjør dette aktuelt?]

## Antakelser vi bygger på
- [Forretningsantakelse 1]
- [Teknisk antakelse 1]
- [Markedsantakelse 1]

## Potensielle utfordringer
- [Utfordring 1]
- [Utfordring 2]
- [Utfordring 3]

## Spørsmål til validering
- [Spørsmål vi bør stille potensielle kunder]
- [Spørsmål vi bør stille potensielle kunder]
```

### 5.2 Market Strategist

**Formål**: Vurdere markedsmuligheten

**Type**: Analyse-agent (én kjøring, ikke interaktiv)

**Input**: IDÉUTKAST.md

**Analyserer**:
- Markedsstørrelse (TAM/SAM/SOM for Norge/Norden)
- Konkurrentlandskap (hvem løser dette i dag, hvordan, til hvilken pris)
- Betalingsvilje (hva er verdien for kunden, hva kan vi ta betalt)
- Timing (hvorfor har ingen gjort dette før, hva har endret seg)
- Inngangsbarrierer (hva hindrer andre fra å kopiere)

**Output**: MARKET_REPORT.md + score 0-10

```markdown
# Markedsrapport: [Produktnavn]

## Markedsstørrelse

### TAM (Total Addressable Market)
[Beskrivelse og tall]

### SAM (Serviceable Addressable Market)
[Beskrivelse og tall]

### SOM (Serviceable Obtainable Market)
[Realistisk år 1-3, med begrunnelse]

## Konkurrentanalyse

| Aktør | Løsning | Pris | Styrke | Svakhet |
|-------|---------|------|--------|---------|
| [Konkurrent 1] | ... | ... | ... | ... |

### Vårt differensieringspunkt
[Hva gjør oss unike]

## Betalingsvilje

### Verdiberegning
[Hva sparer/tjener kunden]

### Prissammenligning
[Hva koster alternativer]

### Anbefalt prispunkt
[Pris med begrunnelse]

## Timing

### Hvorfor nå?
[Teknologi/marked/regulering som muliggjør dette]

### Risiko
[Hva kan endre seg]

## Markedspotensial Score: [X]/10

**Begrunnelse**: [2-3 setninger]
```

### 5.3 Product Architect

**Formål**: Vurdere teknisk gjennomførbarhet og definere MVP

**Type**: Analyse-agent (én kjøring, ikke interaktiv)

**Input**: IDÉUTKAST.md

**Analyserer**:
- Teknisk kompleksitet (hva må bygges, hvor vanskelig)
- Datakilder (hvor får vi data, API vs scraping, juridisk OK)
- AI-oppgaver (hva må AI gjøre, er det realistisk med dagens modeller)
- Stack-fit (passer dette ARTI sin stack)
- Byggetid (realistisk estimat for MVP)

**Output**: PRD.md + score 0-10

```markdown
# PRD: [Produktnavn]

## Demo-kriterium

> "[Én setning som beskriver når MVP er klar for demo]"

## MVP Scope

### Må ha (for demo)
- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

### Ikke bygge nå
- ❌ [Feature som kan vente til v2]
- ❌ [Feature som kan vente til v2]

## Teknisk arkitektur

```
[Enkel ASCII-diagram av systemet]
```

### Stack
- **Frontend**: [teknologi]
- **Backend**: [teknologi]
- **Database**: [teknologi]
- **AI**: [teknologi]
- **Integrasjoner**: [eksterne systemer]

### Datakilder
| Kilde | Tilgang | Juridisk | Risiko |
|-------|---------|----------|--------|
| [Kilde 1] | API/Scraping | OK/Usikker | Lav/Medium/Høy |

## Estimat

| Oppgave | Tid |
|---------|-----|
| [Oppgave 1] | X dager |
| [Oppgave 2] | X dager |
| **Total** | **X dager** |

## Teknisk risiko

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|---------------|------------|------------|
| [Risiko 1] | Lav/Medium/Høy | Lav/Medium/Høy | [Tiltak] |

## Byggbarhet Score: [X]/10

**Begrunnelse**: [2-3 setninger]
```

### 5.4 Business Critic

**Formål**: Vurdere forretningslogikk og identifisere risikoer

**Type**: Analyse-agent (én kjøring, ikke interaktiv)

**Input**: IDÉUTKAST.md

**Analyserer**:
- Unit economics (ARPA, COGS, margin, LTV, CAC)
- Salgssyklus (hvem bestemmer, hvor lang tid, kompleksitet)
- Skalerbarhet (marginalkostnad, automatiseringsgrad)
- Kritiske risikoer (hva kan drepe dette)
- Avhengigheter (hva er vi avhengige av som vi ikke kontrollerer)

**Output**: RISK_ASSESSMENT.md + score 0-10

```markdown
# Risikovurdering: [Produktnavn]

## Unit Economics

| Metrikk | Verdi | Kommentar |
|---------|-------|-----------|
| ARPA (snittinntekt/kunde) | X kr/mnd | |
| COGS | X kr/mnd | |
| Bruttomargin | X% | |
| LTV (antatt X mnd retention) | X kr | |
| Estimert CAC | X kr | |
| LTV:CAC ratio | X:1 | |
| Payback | X måneder | |

### Vurdering
[Er unit economics sunn? Hva er sensitivt?]

## Salgssyklus

| Aspekt | Vurdering |
|--------|-----------|
| Beslutter | [Rolle] |
| Syklus | [Tid] |
| Kompleksitet | Lav/Medium/Høy |
| Self-serve mulig? | Ja/Nei |

### Vurdering
[Er dette en effektiv salgsmodell?]

## Skalerbarhet

### Positive faktorer
- ✅ [Faktor 1]
- ✅ [Faktor 2]

### Begrensende faktorer
- ⚠️ [Faktor 1]
- ⚠️ [Faktor 2]

### Vurdering
[Kan dette skalere? Hva er taket?]

## Kritiske risikoer

### 🔴 Høy risiko
**[Risiko 1]**
- Beskrivelse: [Hva kan skje]
- Konsekvens: [Hvor ille er det]
- Sannsynlighet: [Hvor sannsynlig]
- Mitigering: [Hva kan vi gjøre]

### 🟡 Medium risiko
**[Risiko 2]**
- ...

### 🟢 Lav risiko
**[Risiko 3]**
- ...

## Forretningsmodell Score: [X]/10

**Begrunnelse**: [2-3 setninger]
```

### 5.5 Notes Synthesizer

**Formål**: Samle evalueringer til én helhetlig vurdering med anbefaling

**Type**: Syntese-agent (én kjøring, ikke interaktiv)

**Input**: 
- IDÉUTKAST.md
- MARKET_REPORT.md
- PRD.md
- RISK_ASSESSMENT.md

**Analyserer**:
- Er agentene enige eller uenige?
- Hva er de viktigste styrkene?
- Hva er de kritiske svakhetene?
- Er det hull ingen har dekket?
- Hva er totalt risikobilde?

**Output**: EVALUATE_SUMMARY.md + total score + anbefaling

```markdown
# Helhetlig vurdering: [Produktnavn]

## Sammendrag
[3-4 setninger som oppsummerer idéen og hovedkonklusjonen]

## Styrker
- ✅ [Styrke 1 - fra hvilken analyse]
- ✅ [Styrke 2]
- ✅ [Styrke 3]

## Svakheter / Usikkerheter
- ⚠️ [Svakhet 1]
- ⚠️ [Svakhet 2]
- ⚠️ [Svakhet 3]

## Motstridende signaler
[Hvis agentene er uenige, beskriv hva og hvorfor]

## Kritiske avklaringer før bygging
- [ ] [Hva må valideres/avklares]
- [ ] [Hva må valideres/avklares]
- [ ] [Hva må valideres/avklares]

## Scores

| Kategori | Score | Kommentar |
|----------|-------|-----------|
| Marked | X/10 | [Kort] |
| Byggbarhet | X/10 | [Kort] |
| Forretning | X/10 | [Kort] |
| **Total** | **X.X/10** | |

---

## Anbefaling: [✅ GÅ VIDERE / ⏸️ AVVENT / ❌ FORKAST]

**Begrunnelse**: 
[2-3 setninger som forklarer anbefalingen]

### Hvis GÅ VIDERE - Neste steg:
1. [Konkret steg 1]
2. [Konkret steg 2]
3. [Konkret steg 3]

### Go/No-go kriterier:
- ✅ Go hvis: [Kriterium]
- ❌ No-go hvis: [Kriterium]
```

**Anbefalingslogikk**:
- **GÅ VIDERE**: Total score ≥ 7.0 OG ingen scores under 5 OG ingen kritiske røde risikoer uten mitigering
- **AVVENT**: Total score 5.0-6.9 ELLER én score under 5 ELLER kritiske avklaringer som må gjøres først
- **FORKAST**: Total score < 5.0 ELLER flere scores under 5 ELLER uløselige kritiske risikoer

---

## 6. Datamodell

### 6.1 Database Schema (Supabase/PostgreSQL)

```sql
-- Idéer
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'evaluating', 'evaluated', 'go', 'hold', 'reject')),
  
  -- Dokumenter (Markdown)
  idea_document TEXT,
  market_report TEXT,
  prd TEXT,
  risk_assessment TEXT,
  evaluation_summary TEXT,
  
  -- Scores (0-10, én desimal)
  score_market DECIMAL(3,1),
  score_buildability DECIMAL(3,1),
  score_business DECIMAL(3,1),
  score_total DECIMAL(3,1),
  
  -- AI-anbefaling
  recommendation TEXT CHECK (recommendation IN ('go', 'hold', 'reject')),
  recommendation_reason TEXT,
  
  -- Menneskelig beslutning
  decision TEXT CHECK (decision IN ('go', 'hold', 'reject')),
  decision_reason TEXT,
  decision_at TIMESTAMPTZ,
  decision_by TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Chat-meldinger for struktureringssamtalen
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rask henting av chat-historikk
CREATE INDEX idx_chat_messages_idea_id ON chat_messages(idea_id);

-- Evalueringsjobber for å tracke fremdrift
CREATE TABLE evaluation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  
  -- Agent-status
  market_strategist_status TEXT DEFAULT 'pending' 
    CHECK (market_strategist_status IN ('pending', 'running', 'completed', 'failed')),
  product_architect_status TEXT DEFAULT 'pending'
    CHECK (product_architect_status IN ('pending', 'running', 'completed', 'failed')),
  business_critic_status TEXT DEFAULT 'pending'
    CHECK (business_critic_status IN ('pending', 'running', 'completed', 'failed')),
  notes_synthesizer_status TEXT DEFAULT 'pending'
    CHECK (notes_synthesizer_status IN ('pending', 'running', 'completed', 'failed')),
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Feilhåndtering
  error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kun én aktiv jobb per idé
CREATE UNIQUE INDEX idx_evaluation_jobs_idea_id ON evaluation_jobs(idea_id) 
  WHERE status IN ('pending', 'running');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 6.2 TypeScript Types

```typescript
// Status-typer
type IdeaStatus = 'draft' | 'evaluating' | 'evaluated' | 'go' | 'hold' | 'reject';
type Recommendation = 'go' | 'hold' | 'reject';
type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';
type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Hovedentitet
interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  
  // Dokumenter
  idea_document: string | null;
  market_report: string | null;
  prd: string | null;
  risk_assessment: string | null;
  evaluation_summary: string | null;
  
  // Scores
  score_market: number | null;
  score_buildability: number | null;
  score_business: number | null;
  score_total: number | null;
  
  // AI-anbefaling
  recommendation: Recommendation | null;
  recommendation_reason: string | null;
  
  // Beslutning
  decision: Recommendation | null;
  decision_reason: string | null;
  decision_at: string | null;
  decision_by: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Chat-melding
interface ChatMessage {
  id: string;
  idea_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Evalueringsjobb
interface EvaluationJob {
  id: string;
  idea_id: string;
  status: JobStatus;
  market_strategist_status: AgentStatus;
  product_architect_status: AgentStatus;
  business_critic_status: AgentStatus;
  notes_synthesizer_status: AgentStatus;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  created_at: string;
}

// For frontend - idé med ekstra info
interface IdeaWithDetails extends Idea {
  chat_messages?: ChatMessage[];
  evaluation_job?: EvaluationJob;
}
```

---

## 7. API-design

### 7.1 Endepunkter

```
# Idéer
GET    /api/ideas              # Liste alle idéer (med filtrering)
POST   /api/ideas              # Opprett ny idé
GET    /api/ideas/:id          # Hent én idé med alle dokumenter
PATCH  /api/ideas/:id          # Oppdater idé (f.eks. lagre utkast)
DELETE /api/ideas/:id          # Slett idé (kun utkast)

# Chat
GET    /api/ideas/:id/chat     # Hent chat-historikk
POST   /api/ideas/:id/chat     # Send melding, få AI-respons

# Evaluering
POST   /api/ideas/:id/evaluate # Start evaluering
GET    /api/ideas/:id/evaluate # Hent evalueringsstatus

# Beslutning
POST   /api/ideas/:id/decision # Registrer beslutning
```

### 7.2 Request/Response-eksempler

**POST /api/ideas** - Opprett ny idé
```typescript
// Request
{ }  // Tom body, oppretter blank idé

// Response
{
  "id": "uuid",
  "title": "Ny idé",
  "status": "draft",
  "created_at": "2026-01-04T12:00:00Z"
}
```

**POST /api/ideas/:id/chat** - Send melding
```typescript
// Request
{
  "message": "Entreprenører bruker masse tid på å lete i Doffin..."
}

// Response
{
  "response": "Interessant! Noen oppfølgingsspørsmål...",
  "idea_document": "# Anbudsagenten\n\n**Slagord**: ...",
  "is_ready_for_evaluation": false
}
```

**POST /api/ideas/:id/evaluate** - Start evaluering
```typescript
// Request
{ }  // Tom body

// Response
{
  "job_id": "uuid",
  "status": "running"
}
```

**GET /api/ideas/:id/evaluate** - Hent status
```typescript
// Response
{
  "status": "running",
  "market_strategist_status": "completed",
  "product_architect_status": "running",
  "business_critic_status": "pending",
  "notes_synthesizer_status": "pending"
}
```

**POST /api/ideas/:id/decision** - Registrer beslutning
```typescript
// Request
{
  "decision": "go",
  "reason": "Solid marked, byggbart, skal validere med 3 kunder først"
}

// Response
{
  "id": "uuid",
  "status": "go",
  "decision": "go",
  "decision_reason": "Solid marked...",
  "decision_at": "2026-01-04T12:30:00Z"
}
```

---

## 8. Teknisk arkitektur

### 8.1 System-oversikt

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    Next.js 14 (App Router)                      │
│                                                                 │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────────┐            │
│  │Dashboard│  │ Chat-       │  │ Evaluerings-     │            │
│  │         │  │ interface   │  │ resultat         │            │
│  └────┬────┘  └──────┬──────┘  └────────┬─────────┘            │
└───────┼──────────────┼─────────────────┼────────────────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                 │
│                   /api/ideas/*                                  │
│                   /api/ideas/:id/chat                           │
│                   /api/ideas/:id/evaluate                       │
└───────┬──────────────┬─────────────────┬────────────────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌───────────────┐ ┌────────────┐ ┌─────────────────────────────────┐
│   Supabase    │ │  OpenAI /  │ │      AGENT ORKESTRERING         │
│   Database    │ │  Anthropic │ │                                 │
│               │ │    API     │ │  ┌─────────────────────────┐    │
│ - ideas       │ │            │ │  │ Idéutkast-mottaker      │    │
│ - chat_msgs   │ │            │ │  │ (interaktiv)            │    │
│ - eval_jobs   │ │            │ │  └─────────────────────────┘    │
│               │ │            │ │                                 │
│               │ │            │ │  ┌──────────┬──────────┬─────┐  │
│               │ │            │ │  │ Market   │ Product  │Biz  │  │
│               │ │            │ │  │Strategist│Architect │Critic│ │
│               │ │            │ │  └────┬─────┴────┬─────┴──┬──┘  │
│               │ │            │ │       │          │        │     │
│               │ │            │ │       └────┬─────┴────────┘     │
│               │ │            │ │            ▼                    │
│               │ │            │ │  ┌─────────────────────────┐    │
│               │ │            │ │  │ Notes Synthesizer       │    │
│               │ │            │ │  └─────────────────────────┘    │
└───────────────┘ └────────────┘ └─────────────────────────────────┘
```

### 8.2 Tech Stack

**ACTUAL IMPLEMENTATION (oppdatert 2026-01-04):**

| Lag | Teknologi | Begrunnelse |
|-----|-----------|-------------|
| Frontend | Vite + React 18 + TypeScript | Eksisterende SPA, polert UI ferdig, rask utvikling |
| Backend | Express.js + TypeScript | Separat API-server, enkel deployment, ingen framework lock-in |
| Styling | Tailwind CSS (via CDN) | Rask utvikling, konsistent design |
| Animasjoner | Framer Motion | Polert UX med minimalt overhead |
| Database | Supabase (PostgreSQL) | Managed, realtime, gratis tier |
| Auth | Supabase Auth (fase 2) | Integrert med database |
| AI | OpenAI API (GPT-4o) | Best kvalitet for analyse |
| Hosting | Vercel (frontend) + Render.com (backend) | Separat deployment, gratis tiers |

**Arkitekturbeslutning:** Opprinnelig PRD spesifiserte Next.js 14, men eksisterende frontend er bygget med Vite + React. Beslutning tatt 2026-01-04: Behold Vite-frontend (production-ready UI), bygg separat Express backend. Dette gir raskere MVP-levering siden UI allerede er ferdig.

### 8.3 Agent-implementasjon

**Prinsipper:**
- Ingen rammeverk (LangChain, CrewAI, etc.) - direkte API-kall
- Prompter som separate TypeScript-filer
- Én `runAgent()` wrapper-funksjon for alle agenter
- Parallell kjøring med `Promise.all()` for evaluering
- Structured output: Markdown + JSON for scores

**Pseudokode:**

```typescript
// lib/agents/runner.ts
async function runAgent(options: {
  systemPrompt: string;
  userMessage: string;
  model?: string;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model: options.model ?? 'gpt-4o',
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userMessage }
    ],
    temperature: 0.7,
  });
  
  return response.choices[0].message.content;
}

// lib/agents/evaluate.ts
async function evaluateIdea(ideaDocument: string): Promise<EvaluationResult> {
  // Parallell kjøring av 3 agenter
  const [marketReport, prd, riskAssessment] = await Promise.all([
    runAgent({
      systemPrompt: MARKET_STRATEGIST_PROMPT,
      userMessage: ideaDocument
    }),
    runAgent({
      systemPrompt: PRODUCT_ARCHITECT_PROMPT,
      userMessage: ideaDocument
    }),
    runAgent({
      systemPrompt: BUSINESS_CRITIC_PROMPT,
      userMessage: ideaDocument
    })
  ]);
  
  // Parse scores fra rapportene
  const marketScore = parseScore(marketReport);
  const buildabilityScore = parseScore(prd);
  const businessScore = parseScore(riskAssessment);
  
  // Syntese
  const summary = await runAgent({
    systemPrompt: NOTES_SYNTHESIZER_PROMPT,
    userMessage: `
      ## Idéutkast
      ${ideaDocument}
      
      ## Markedsrapport (Score: ${marketScore}/10)
      ${marketReport}
      
      ## PRD (Score: ${buildabilityScore}/10)
      ${prd}
      
      ## Risikovurdering (Score: ${businessScore}/10)
      ${riskAssessment}
    `
  });
  
  return {
    marketReport,
    prd,
    riskAssessment,
    summary,
    scores: {
      market: marketScore,
      buildability: buildabilityScore,
      business: businessScore,
      total: (marketScore + buildabilityScore + businessScore) / 3
    }
  };
}
```

### 8.4 Filstruktur

```
/app
  /page.tsx                      # Dashboard
  /ideas
    /new/page.tsx                # Ny idé (chat)
    /[id]/page.tsx               # Idédetalj
  /api
    /ideas
      /route.ts                  # GET (list), POST (create)
      /[id]
        /route.ts                # GET, PATCH, DELETE
        /chat/route.ts           # POST (send message)
        /evaluate/route.ts       # POST (start), GET (status)
        /decision/route.ts       # POST
        
/components
  /ui/                           # shadcn komponenter
  /dashboard/
    /idea-card.tsx
    /idea-list.tsx
    /filter-tabs.tsx
  /chat/
    /chat-interface.tsx
    /chat-message.tsx
    /idea-preview.tsx
  /evaluation/
    /evaluation-progress.tsx
    /score-display.tsx
    /score-breakdown.tsx
    /document-viewer.tsx
    /document-tabs.tsx
  /decision/
    /decision-panel.tsx
  /common/
    /status-badge.tsx
    /page-header.tsx

/lib
  /agents/
    /prompts/
      /idea-receiver.ts
      /market-strategist.ts
      /product-architect.ts
      /business-critic.ts
      /notes-synthesizer.ts
    /runner.ts                   # LLM-kall wrapper
    /evaluate.ts                 # Orkestrering
    /parse-score.ts              # Parse score fra Markdown
  /db/
    /client.ts                   # Supabase client
    /queries/
      /ideas.ts
      /chat.ts
      /evaluation.ts
  /types/
    /idea.ts
    /chat.ts
    /evaluation.ts
  /utils/
    /markdown.ts
    /date.ts

/public
  /...
```

---

## 9. UI/UX-retningslinjer

### 9.1 Design-prinsipper

1. **Klarhet over pynt**: Informasjon skal være lett å finne og forstå
2. **Progressiv disclosure**: Vis sammendrag først, detaljer ved behov
3. **Feedback på handlinger**: Brukeren skal alltid vite hva som skjer
4. **Konsistens**: Samme mønstre og komponenter gjennom hele appen

### 9.2 Farger og status

| Status | Farge | Hex | Bruk |
|--------|-------|-----|------|
| Utkast | Grå | #71717a | Nøytral, ikke startet |
| Under evaluering | Oransje | #f97316 | Pågår, vent |
| Venter beslutning | Blå | #3b82f6 | Klar for handling |
| Gå videre | Grønn | #22c55e | Positiv beslutning |
| Avvent | Gul | #eab308 | Usikker, trenger mer |
| Forkastet | Rød | #ef4444 | Negativ beslutning |

### 9.3 Score-visualisering

| Score | Farge | Tolkning |
|-------|-------|----------|
| 8-10 | Grønn | Sterk |
| 6-7.9 | Gul | Moderat |
| 4-5.9 | Oransje | Svak |
| 0-3.9 | Rød | Kritisk |

### 9.4 Responsivitet

- **Desktop** (1024px+): Full layout med sidebar/split view
- **Tablet** (768-1023px): Komprimert layout, stacked der nødvendig
- **Mobil**: Ikke prioritert i MVP

---

## 10. Feilhåndtering

### 10.1 Agent-feil

| Scenario | Håndtering |
|----------|------------|
| Én agent feiler | Vis partial results, marker feilet agent |
| Alle agenter feiler | Vis feilmelding, tilby retry |
| Timeout (>60s per agent) | Avbryt, vis timeout-melding |
| Rate limit | Exponential backoff, max 3 retries |

### 10.2 Bruker-feedback

| Feil | Melding |
|------|---------|
| Nettverksfeil | "Kunne ikke koble til. Sjekk internettforbindelsen." |
| Server-feil | "Noe gikk galt. Prøv igjen om litt." |
| Validering | Spesifikk melding om hva som er feil |

---

## 11. Ytelse

### 11.1 Mål

| Metrikk | Mål |
|---------|-----|
| Dashboard load | < 1s |
| Chat-respons | < 5s |
| Evaluering total | < 120s |
| Enkelt agent-kall | < 30s |

### 11.2 Optimaliseringer

- **Streaming** for chat-responser (viser tekst mens den genereres)
- **Parallell kjøring** av evaluerings-agenter
- **Caching** av statiske prompts
- **Optimistic UI** for beslutninger

---

## 12. Sikkerhet

### 12.1 MVP (ingen auth)

- Alle har full tilgang
- Ingen sensitiv data lagres
- API-nøkler i miljøvariabler

### 12.2 Fase 2+ (med auth)

- Supabase Auth med magic link
- Row Level Security på alle tabeller
- API-routes sjekker auth
- Audit log for beslutninger

---

## 13. Lansering

### 13.1 MVP-sjekkliste

- [ ] Dashboard med idéliste og filtrering
- [ ] Opprett ny idé og chat-interface
- [ ] Live preview av strukturert idé
- [ ] Evaluering med progress-indikator
- [ ] Resultatvisning med scores og dokumenter
- [ ] Beslutningsflyt
- [ ] Supabase database satt opp
- [ ] Vercel deployment
- [ ] Grunnleggende feilhåndtering
- [ ] README med setup-instruksjoner

### 13.2 Test-scenarioer

1. **Happy path**: Opprett idé → strukturer → evaluer → beslutning
2. **Avbrutt flyt**: Lagre utkast → lukk → åpne → fortsett
3. **Feil-håndtering**: Simuler agent-feil, sjekk graceful degradation
4. **Edge cases**: Tom input, veldig lang input, spesialtegn

---

## 14. Fremtidige utvidelser

Se seksjon 2.2 for detaljert roadmap. Arkitekturen er designet for å støtte:

- Flere agent-typer uten kodeendringer i orkestrering
- Nye statuser og flyter
- Integrasjoner via webhooks/API
- Multi-tenant med auth

---

## 15. Ordliste

| Begrep | Definisjon |
|--------|------------|
| ICP | Ideal Customer Profile - beskrivelse av ideell kunde |
| JTBD | Jobs To Be Done - oppgaver kunden ønsker å løse |
| TAM | Total Addressable Market - totalt markedspotensial |
| SAM | Serviceable Addressable Market - tilgjengelig marked |
| SOM | Serviceable Obtainable Market - realistisk oppnåelig marked |
| ARPA | Average Revenue Per Account - snittinntekt per kunde |
| LTV | Lifetime Value - total kundeverdi over tid |
| CAC | Customer Acquisition Cost - kostnad per ny kunde |
| HIL | Human In the Loop - menneske i beslutningsprosessen |
| Loop 1 | Første bygge-syklus (10 dager) fra idé til soft-launch |

---

## Endringslogg

| Dato | Versjon | Endring |
|------|---------|---------|
| 2026-01-04 | 1.0 | Første versjon av PRD |
