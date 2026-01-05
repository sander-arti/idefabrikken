/**
 * Perplexity API Mock Responses
 *
 * Realistic mock responses for all 3 agent types (market, product, business)
 */

import type { Citation } from '../../providers/types.js';

/**
 * Mock Perplexity API response structure
 */
export interface MockPerplexityResponse {
  content: string;
  citations: Citation[];
}

/**
 * Mock research response for Market Strategist agent
 */
export const mockMarketResearch: MockPerplexityResponse = {
  content: `# Markedsundersøkelse: AI-drevet kundeserviceløsning for SMB

## 1. MARKEDSSTØRRELSE

**Global marked:**
Det globale markedet for AI-drevet kundeservice ble verdsatt til $1.6 milliarder i 2023 og forventes å nå $9.4 milliarder innen 2030, med en CAGR på 28.9%. Nord-Amerika og Europa utgjør til sammen ca. 65% av dette markedet.

**Nordisk marked:**
Det nordiske markedet for AI i kundeservice er estimert til ca. $150-200 millioner årlig (2024). Norge utgjør ca. 20-25% av dette, altså $30-50 millioner.

**TAM/SAM/SOM:**
- TAM (Total Addressable Market): $9.4 milliarder globalt innen 2030
- SAM (Serviceable Addressable Market): $150-200 millioner i Norden
- SOM (Serviceable Obtainable Market): $5-10 millioner i Norge (SMB-segment)

## 2. KONKURRANSELANDSKAP

**Internasjonale aktører:**
- Zendesk AI: Markedsleder med 40% markedsandel
- Intercom: 25% markedsandel, fokus på SMB
- Freshdesk: 15% markedsandel, priskonkurrerende
- Ada: 10% markedsandel, spesialist på AI

**Nordiske aktører:**
- Kindly (Norge): Chatbot-plattform for nordiske språk, 200+ kunder
- Certainly (Danmark): Conversational AI, fokus på e-handel
- Boost.ai (Norge): Enterprise-fokus, 100+ store kunder

**Differensiering:**
Eksisterende løsninger er enten (1) dyre enterprise-plattformer ($500+/mnd) eller (2) generiske chatbots uten SMB-tilpasning. Det er et gap for norsk-tilpassede, rimelige løsninger.

## 3. PRISSTRUKTUR

**Typiske prismodeller:**
- Zendesk AI: $99-299/agent/måned
- Intercom: $79-499/måned (avhenger av volum)
- Freshdesk: $29-99/agent/måned
- Kindly: Kr 2,000-10,000/måned (avhenger av volum)

**Betalingsvilje SMB:**
Norske SMB-er er villige til å betale kr 1,500-5,000/måned for AI-kundeservice hvis de:
- Ser 30%+ reduksjon i support-tid
- Får norsk språk og support
- Enkel integrasjon (< 1 dag setup)

## 4. MARKEDSTRENDER

**Vekstdrivere:**
1. COVID-19 akselererte digitalisering av kundeservice (+200% vekst 2020-2023)
2. Arbeidskraftmangel i service-roller (+15% ledige stillinger)
3. Forventninger om 24/7 support fra kunder
4. GPT-4 og lignende teknologier gjør AI mer accessible

**Adopsjonshindre:**
1. Skepsis til AI-kvalitet (50% av SMB-er bekymret)
2. Integrasjonskompleksitet med eksisterende systemer
3. Manglende norsk språkstøtte i internasjonale løsninger
4. Datapersonvern (GDPR compliance)

## 5. MÅLGRUPPE

**Primær ICP:**
- Norske SMB-er (10-100 ansatte)
- E-handel, SaaS, profesjonelle tjenester
- > 100 kundehenvendelser/måned
- Eksisterende kundeservice-team (1-5 personer)
- Tech-savvy ledelse

**Sekundær ICP:**
- Soloprenører/mikrobedrifter med høyt support-volum
- Vekstbedrifter som skalerer kundeservice

**Segmentstørrelse:**
Ca. 15,000 norske SMB-er matcher primær ICP, hvorav ~3,000 er "early adopters" (tech-forward).`,
  citations: [
    {
      url: 'https://www.marketsandmarkets.com/Market-Reports/conversational-ai-market-49043506.html',
      title: 'Conversational AI Market Size, Growth | Global Forecast to 2030',
      snippet:
        'The global conversational AI market size is expected to grow from USD 1.6 billion in 2023 to USD 9.4 billion by 2030',
    },
    {
      url: 'https://www.zendesk.com/pricing/',
      title: 'Zendesk Pricing Plans',
      snippet: 'Suite Team: $55/agent/month, Suite Growth: $89/agent/month, Suite Professional: $115/agent/month',
    },
    {
      url: 'https://kindly.ai/pricing',
      title: 'Kindly Pricing',
      snippet: 'Starter: NOK 2,000/month, Professional: NOK 5,000/month, Enterprise: Custom pricing',
    },
    {
      url: 'https://www.ssb.no/virksomheter-foretak-og-regnskap/faktaside/bedrifter',
      title: 'Bedrifter i Norge - SSB',
      snippet: 'Det er ca. 300,000 registrerte foretak i Norge, hvorav ca. 15,000 har 10-100 ansatte',
    },
  ],
};

/**
 * Mock research response for Product Architect agent
 */
export const mockProductResearch: MockPerplexityResponse = {
  content: `# Produktundersøkelse: AI-drevet kundeserviceløsning

## 1. TEKNISK LANDSKAP

**AI/LLM Teknologi:**
- OpenAI GPT-4o: $2.50-10/M tokens, beste for norsk
- Anthropic Claude 3.5: $3-15/M tokens, god reasoning
- Google Gemini 1.5: $0.35-10.5/M tokens, billigst
- Azure OpenAI: Enterprise-grade, GDPR-compliant hosting

**Chatbot-rammeverk:**
- LangChain: Python/TS, populært for LLM-apps
- Botpress: Open source, visuell builder
- Rasa: Open source, full kontroll
- Custom-bygg: Mest fleksibilitet

**Vector databases (for RAG):**
- Pinecone: $70/måned starter, managed
- Weaviate: Open source, selvhostet mulig
- Qdrant: Open source, rust-basert, rask
- Supabase pgvector: Gratis med Postgres

## 2. DATAKILDER OG API-ER

**Integrasjoner (må-ha for SMB):**
- Email: Gmail API, Outlook API, IMAP
- Chat: Slack API, Microsoft Teams, Messenger
- CRM: HubSpot, Pipedrive, Salesforce
- Help desk: Zendesk, Freshdesk, Intercom
- E-handel: Shopify, WooCommerce, Stripe

**Norsk språk-støtte:**
- OpenAI GPT-4: Excellent norsk (bokmål/nynorsk)
- NB-BERT: Norsk språkmodell (gratis, open source)
- AI21 Labs: Multilingual, inkludert nordisk

**GDPR-compliant hosting:**
- Azure Norway datacenters
- Google Cloud europe-north1 (Finland)
- AWS eu-north-1 (Stockholm)
- Supabase EU hosting

## 3. EKSISTERENDE PRODUKTER

**Open source:**
- Rasa: Python, full kontroll, steep learning curve
- Botpress: TypeScript, visuell, enklere
- ChatterBot: Python, enkel, ikke production-ready
- Botkit: Node.js, Slack/Teams focus

**SaaS-plattformer:**
- Intercom: $79-499/mnd, modern UI
- Zendesk AI: $99-299/agent/mnd, feature-rich
- Freshdesk: $29-99/agent/mnd, value option
- Kindly: Kr 2,000-10,000/mnd, nordisk

**Gap:**
Ingen norsk-first, SMB-optimalisert løsning med:
- < Kr 2,000/måned entry point
- Norsk UI og onboarding
- 1-click integrasjoner
- GDPR-by-default

## 4. TEKNISK FEASIBILITY

**MVP stack (anbefalt):**
- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Supabase (Postgres + Auth + Edge Functions)
- AI: OpenAI GPT-4o via Azure (GDPR-compliant)
- Hosting: Vercel (frontend) + Supabase (backend)
- Vector DB: Supabase pgvector (inkludert i Postgres)

**Utviklingstid:**
- MVP (chatbot + email integrasjon): 6-8 uker
- Beta (+ Slack/CRM integrasjoner): 12-16 uker
- Production (+ analytics, workflows): 20-24 uker

**Kritiske tekniske risikoer:**
1. LLM hallucinations: Trenger RAG + prompt engineering
2. Latency: GPT-4 kan være treg (2-5s response)
3. Cost: AI-kostnader kan skalere raskt ($0.05-0.20 per samtale)
4. Integrasjon complexity: Hver integrasjon = 1-2 uker arbeid

## 5. DATA OG COMPLIANCE

**GDPR requirements:**
- Data processing agreement (DPA) med OpenAI/Azure
- EU data residency (Azure Norway eller EU-region)
- Right to deletion (må slette chat-historikk på forespørsel)
- Consent management (må ha opt-in for data processing)

**Data storage:**
- Chat logs: Supabase Postgres (EU-hosted)
- Embeddings: pgvector (same Postgres)
- Files/attachments: Supabase Storage (EU-region)

**Security:**
- Supabase RLS (row-level security) for multi-tenant
- Auth: Supabase Auth (JWT, ES256)
- API: Rate limiting (Upstash Redis)
- Monitoring: Sentry + Supabase logs`,
  citations: [
    {
      url: 'https://platform.openai.com/docs/models/gpt-4o',
      title: 'GPT-4o - OpenAI API Documentation',
      snippet: 'GPT-4o is our most advanced model, optimized for chat and multimodal tasks. Pricing: $2.50/1M input tokens',
    },
    {
      url: 'https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/#geographies',
      title: 'Azure Geographies - Norway',
      snippet: 'Azure has datacenters in Norway (Oslo and Stavanger) for GDPR-compliant hosting',
    },
    {
      url: 'https://supabase.com/docs/guides/ai/vector-databases',
      title: 'Vector databases with Supabase',
      snippet: 'Supabase supports pgvector extension for storing and querying embeddings directly in PostgreSQL',
    },
    {
      url: 'https://www.intercom.com/pricing',
      title: 'Intercom Pricing',
      snippet: 'Essential: $79/month, Advanced: $299/month, Expert: $499/month',
    },
    {
      url: 'https://langchain.com/',
      title: 'LangChain - Building applications with LLMs',
      snippet: 'LangChain is a framework for developing applications powered by language models',
    },
  ],
};

/**
 * Mock research response for Business Critic agent
 */
export const mockBusinessResearch: MockPerplexityResponse = {
  content: `# Forretningsanalyse: AI-drevet kundeserviceløsning

## 1. FORRETNINGSMODELLER OG PRISING

**Vanlige SaaS-modeller:**
- Per-agent pricing: $29-299/agent/måned (Zendesk, Freshdesk)
- Flat-rate tiered: Kr 2,000-10,000/måned (Kindly, Boost.ai)
- Usage-based: Per samtale eller per melding (sjelden i Norden)
- Freemium: Gratis tier + betalt oppgradering (Intercom)

**Anbefalt modell for SMB:**
- Starter: Kr 1,500/måned (500 samtaler, 1 integrasjon)
- Professional: Kr 3,500/måned (2,000 samtaler, 5 integrasjoner)
- Business: Kr 7,500/måned (ubegrenset, alle integrasjoner)

**Prisposisjonering:**
20-40% billigere enn Kindly, men premium vs. Freshdesk (som er per-agent).

## 2. UNIT ECONOMICS

**Customer Acquisition Cost (CAC):**
- Norsk B2B SaaS: Kr 5,000-15,000 per kunde (organisk + paid)
- Paid ads (Google/LinkedIn): Kr 150-300 per lead, 5-10% conversion = Kr 15,000-60,000 CAC
- Outbound sales: Kr 8,000-12,000 per kunde (hvis intern SDR)

**Lifetime Value (LTV):**
- ARPU: Kr 3,500/måned (blandet snitt)
- Churn: 5-10% per måned (SMB SaaS typisk)
- Avg. lifetime: 10-20 måneder
- LTV: Kr 35,000-70,000 per kunde

**LTV:CAC ratio:**
- Target: 3:1 (healthy SaaS)
- Estimat: 2.3:1 til 7:1 (avhenger av kanal)
- Verdict: Marginalt hvis CAC > Kr 15,000, godt hvis organisk vekst

## 3. GO-TO-MARKET STRATEGI

**Primary channels:**
1. Content marketing (blogg, SEO): Lavest CAC (kr 3,000-8,000)
2. Partner program (CRM/e-handel agencies): Scalable, Kr 5,000-10,000 CAC
3. LinkedIn ads + outbound: Høyest CAC (kr 15,000-30,000), men rask

**Sales cycle:**
- SMB SaaS: 2-6 uker fra lead til kunde
- Typisk journey: Demo → Trial (14 dager) → Onboarding → Betalt
- Conversion rate: 10-20% fra trial til betalt (industry standard)

**Critical first milestones:**
1. Month 1-3: 5-10 beta-kunder (gratis/rabatt)
2. Month 4-6: 20-30 betalende kunder (breakeven ~30 kunder)
3. Month 7-12: 100+ kunder (profitabelt)

## 4. SKALERBARHET

**Operasjonelle kostnader:**
- AI (OpenAI): Kr 50-150 per kunde per måned (avhenger av volum)
- Hosting (Vercel + Supabase): Kr 20-50 per kunde per måned
- Support (1 person per 100 kunder): Kr 50,000/måned per support-person
- Total COGS: Kr 70-200 per kunde per måned

**Gross margin:**
- Starter tier: 53-87% margin (kr 1,500 revenue - kr 200 COGS)
- Professional tier: 80-94% margin (kr 3,500 revenue - kr 200 COGS)
- Industry benchmark: 70-80% for SMB SaaS

**Scaling risks:**
1. AI costs explode med volum (må forhandle enterprise-avtale med OpenAI)
2. Support-burden øker (må bygge self-service tidlig)
3. Churn øker hvis produkt ikke leverer ROI raskt (< 3 måneder)

## 5. KRITISKE RISIKOER

**Markedsrisiko:**
- **Sannsynlighet: Medium (40%)**
- Risk: SMB-er er ikke klare for AI-adopsjon (teknologisk skepsis)
- Mitigation: Gratis trials, case studies, norsk support

**Teknisk risiko:**
- **Sannsynlighet: Medium-High (60%)**
- Risk: LLM hallucinations skaper dårlig kundeopplevelse
- Mitigation: RAG med kundedata, human-in-the-loop for kritiske svar

**Konkurranserisiko:**
- **Sannsynlighet: High (70%)**
- Risk: Kindly/Boost.ai lanserer billigere SMB-tier
- Mitigation: Raskere utvikling, bedre UX, spesialisering (eks. e-handel)

**Regulatorisk risiko:**
- **Sannsynlighet: Low-Medium (30%)**
- Risk: EU AI Act krever compliance (2025-2027)
- Mitigation: Bygge compliance-ready fra dag 1 (transparency, human oversight)

**Økonomisk risiko:**
- **Sannsynlighet: Medium (50%)**
- Risk: Recession = SMB kutter kostnader
- Mitigation: Vis clear ROI (time saved > subscription cost)

## 6. KONKURRANSEFORTRINN (MOAT)

**Potensielle moats:**
1. Norsk språk + kultur (lokal forståelse)
2. SMB-optimalisert onboarding (1-click integrasjoner)
3. Pricing (20-40% billigere enn Kindly)
4. Community (norsk support, nordisk nettverking)

**Sustainability:**
- Language moat: Medium (GPT-4 er allerede god på norsk)
- UX moat: Low (kan kopieres)
- Price moat: Low (race to bottom)
- Community moat: Medium-High (takes time to build)

**Verdict:**
Må bygge sterk community og customer success for å skape sustainable moat.`,
  citations: [
    {
      url: 'https://www.saasmetrics.co/ltv-cac-ratio/',
      title: 'LTV:CAC Ratio for SaaS Companies',
      snippet: 'A healthy LTV:CAC ratio is 3:1 or higher, meaning customer lifetime value should be at least 3x acquisition cost',
    },
    {
      url: 'https://www.klipfolio.com/resources/kpi-examples/saas/customer-churn-rate',
      title: 'Customer Churn Rate for SaaS',
      snippet: 'Average monthly churn for SMB SaaS is 3-7%, while enterprise SaaS is 0.5-1%',
    },
    {
      url: 'https://www.paddle.com/resources/saas-gross-margin',
      title: 'SaaS Gross Margin Benchmarks',
      snippet: 'SaaS companies should target 70-80% gross margins. Top quartile companies achieve 80-90%',
    },
    {
      url: 'https://www.europarl.europa.eu/topics/en/article/20230601STO93804/eu-ai-act-first-regulation-on-artificial-intelligence',
      title: 'EU AI Act - European Parliament',
      snippet: 'The EU AI Act will be rolled out gradually, with full compliance required by 2025-2027',
    },
    {
      url: 'https://openai.com/pricing',
      title: 'OpenAI API Pricing',
      snippet: 'GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens. Average conversation: 2,000-5,000 tokens',
    },
  ],
};

/**
 * Mock empty research (for edge case testing)
 */
export const mockEmptyResearch: MockPerplexityResponse = {
  content: `# Undersøkelse

Dessverre fant jeg ikke tilstrekkelig informasjon om dette temaet.

Det kan være at:
- Markedet er for nisje/nytt til å ha publisert data
- Søkeordene ikke traff relevante kilder
- Informasjonen er bak paywalls eller ikke offentlig tilgjengelig`,
  citations: [],
};

/**
 * Mock research with few citations (low quality)
 */
export const mockLowQualityResearch: MockPerplexityResponse = {
  content: `# Markedsundersøkelse

## Markedsstørrelse
Markedet ser ut til å være stort og voksende.

## Konkurrenter
Det finnes noen konkurrenter på markedet.

## Prising
Prisene varierer avhengig av leverandør.`,
  citations: [
    {
      url: 'https://example.com/generic-article',
      title: 'Generic Market Overview',
      snippet: 'Market is growing',
    },
  ],
};
