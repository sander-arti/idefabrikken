/**
 * Research Prompt Generator
 *
 * Generates agent-specific research prompts for Perplexity Deep Research
 * All prompts are in Norwegian (bokmål)
 */

export type AgentType = 'market' | 'product' | 'business';

export interface ResearchPrompt {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Base system prompt for all research agents
 */
const BASE_SYSTEM_PROMPT = `Du er en forskningsassistent som samler faktabasert informasjon fra internett.

Din oppgave er å finne pålitelige data, statistikk og kilder som er relevante for å evaluere en produktidé.

VIKTIG: Du skal IKKE analysere eller gi anbefalinger. Bare samle og presentere fakta.

Fokuser på:
- Konkrete tall og data
- Navngitte selskaper og produkter
- Nylige trender og nyheter (2024-2025)
- Pålitelige kilder (bransjeanalyser, forskningsrapporter, nyhetsartikler)

Presenter funnene strukturert med kilder. Inkluder URL-er der mulig.`;

/**
 * Agent-specific research queries
 */
const AGENT_RESEARCH_QUERIES: Record<AgentType, string> = {
  market: `
Søk etter følgende markedsinformasjon for denne idéen:

## 1. MARKEDSSTØRRELSE
- Globalt marked for denne typen løsning/produkt
- Nordisk/norsk marked spesifikt
- Vekstrater i markedet (CAGR)
- Historiske størrelser og fremskrivninger

## 2. KONKURRENTER
- Eksisterende selskaper som løser lignende problemer
- Deres prismodeller og markedsandeler
- Nylige lanseringer i dette segmentet
- Finansiering/investeringer i bransjen

## 3. TRENDER OG TIMING
- Relevante teknologitrender som påvirker markedet
- Regulatoriske endringer
- Nylige investeringer/exits i segmentet
- Mediadekning og buzz

## 4. MÅLGRUPPE-INNSIKT
- Studier om målgruppens atferd
- Betalingsvilje-data hvis tilgjengelig
- Bransjeanalyser om segmentet
- Brukerforskning og statistikk

Presenter funnene med kilder og konkrete tall.
`,

  product: `
Søk etter følgende teknisk informasjon for denne idéen:

## 1. TEKNISK LANDSKAP
- Eksisterende teknologier og rammeverk som kan brukes
- API-er og tjenester som er tilgjengelige
- Open source prosjekter i samme domene
- Tekniske standarder i bransjen

## 2. DATA TILGJENGELIGHET
- Offentlige datakilder som er relevante
- API-er med relevant data (navngitte tjenester)
- Kostnader for datatilgang
- Datakvalitet og oppdateringsfrekvens

## 3. LIGNENDE IMPLEMENTASJONER
- Case studies fra lignende produkter
- Tekniske arkitekturer som er brukt
- Vanlige utfordringer og løsninger
- Tekniske blogginnlegg og dokumentasjon

## 4. INTEGRASJONER
- Populære verktøy målgruppen bruker
- Integrasjonsmuligheter (navngitte plattformer)
- Tekniske standarder og protokoller
- Developer-friendly API-er

Presenter funnene med lenker til dokumentasjon og konkrete eksempler.
`,

  business: `
Søk etter følgende forretningsinformasjon for denne idéen:

## 1. FORRETNINGSMODELLER
- Vanlige prismodeller i segmentet (eksempler fra navngitte selskaper)
- Eksempler på enhetøkonomi (ARPU, CAC, LTV)
- Marginstrukturer i bransjen
- Subscription vs one-time pricing

## 2. SALGSSYKLUS OG DISTRIBUSJON
- Typiske salgssykluser for B2B/B2C i segmentet
- Distribusjonskanaler som fungerer (med eksempler)
- CAC-benchmarks i bransjen
- Customer acquisition strategier som fungerer

## 3. RISIKOFAKTORER
- Regulatoriske rammer (GDPR, AI Act, bransjekrav)
- Historiske eksempler på feil i segmentet
- Typiske fallgruver (med case studies)
- Compliance-krav

## 4. SKALERINGSMULIGHETER
- Eksempler på selskaper som har skalert i segmentet
- Investeringsrunder (series A/B/C størrelser)
- Exit-eksempler (oppkjøp, IPO)
- Vekstmønstre og timelines

Presenter funnene med konkrete eksempler fra navngitte selskaper og tall.
`,
};

/**
 * Generate research prompt for a specific agent type
 */
export function generateResearchPrompt(
  agentType: AgentType,
  ideaDocument: string
): ResearchPrompt {
  const agentQuery = AGENT_RESEARCH_QUERIES[agentType];

  if (!agentQuery) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  return {
    systemPrompt: BASE_SYSTEM_PROMPT,
    userPrompt: `
Her er idéen jeg trenger informasjon om:

---
${ideaDocument}
---

${agentQuery}

Presenter funnene strukturert med kilder. Inkluder URL-er der mulig.
`,
  };
}
