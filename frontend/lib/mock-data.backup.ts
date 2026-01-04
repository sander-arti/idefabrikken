import { Idea } from '../types';

export const MOCK_MARKDOWN_DRAFT = `# Anbudsagenten

**Slagord**: AI som finner relevante anbud for deg

## Problemet
Prosjektledere i entreprenørfirmaer bruker 5-6 timer ukentlig på å manuelt søke gjennom Doffin etter relevante anbud. Den største smerten er at de ofte oppdager anbud for sent til å rekke søknadsfristen.

## Ideell kunde (ICP)
- **Rolle**: Prosjektleder
- **Bransje**: Bygg og anlegg (entreprenør)
- **Bedriftsstørrelse**: 10+ ansatte

## Oppgaver som skal løses
- Som prosjektleder vil jeg automatisk få varsel om relevante anbud for å spare tid
- Som prosjektleder vil jeg oppdage anbud i tide for å rekke søknadsfrister

## Hvorfor nå?
[Må avklares: Hva har endret seg som gjør dette mulig/aktuelt akkurat nå?]

## Antakelser
- Entreprenører sjekker Doffin regelmessig
- De er villige til å betale for tidsbesparelse

## Potensielle utfordringer
- Tilgang til Doffin-data (API?)
- Presisjon i AI-matching
- Konkurranse fra eksisterende løsninger`;

const SUMMARY_MD = `# Helhetlig vurdering

## Sammendrag
AI-verktøy som automatisk finner og filtrerer relevante offentlige anbud for entreprenører. Løser et konkret tidsproblem (5-6 t/uke) for en klart definert målgruppe.

## Styrker
- ✅ Klart, validert problem fra faktisk kundesamtale
- ✅ Veldefinert målgruppe (prosjektledere i entreprenørfirma 10+)
- ✅ Høy margin (90%) og lav anskaffelseskostnad

## Svakheter
- ⚠️ Avhengig av Doffin API (single point of failure)
- ⚠️ AI-matching må bevise kvalitet i praksis

## Anbefaling: GÅ VIDERE
Idéen scorer godt på alle dimensjoner. Problemet er validert, teknisk løsbart på under 2 uker.`;

const MARKET_MD = `# Markedsrapport

## Markedsstørrelse
- Totalt antall entreprenører med 10+ ansatte: ~8.000
- Andel som aktivt følger Doffin: ~25% = 2.000
- Realistisk oppnåelig år 1: 50-100 kunder

## Konkurrentanalyse
| Aktør | Løsning | Pris |
|-------|---------|------|
| Mercell | Varslingstjeneste | 15.000 kr/år |
| Doffin direkte | Gratis søk | 0 |`;

const PRD_MD = `# Produktkrav (PRD)

## MVP-scope
### Må ha (for demo)
- [ ] Brukerregistrering og bedriftsprofil
- [ ] Integrasjon mot Doffin (hente nye anbud daglig)
- [ ] AI-matching basert på profil
- [ ] Daglig e-post med topp 10 matchende anbud`;

const RISK_MD = `# Risikovurdering

## Unit Economics
| Metrikk | Verdi |
|---------|-------|
| ARPA | 2.000 kr/mnd |
| COGS | ~200 kr/mnd |
| Bruttomargin | 90% |

## Kritiske risikoer
**Doffin API-avhengighet**: Hele produktet avhenger av tilgang til Doffin-data.`;

export const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "Anbudsagenten",
    description: "AI som automatisk finner og filtrerer relevante offentlige anbud for entreprenører.",
    status: "go",
    scores: { market: 8, buildability: 8, business: 7, total: 7.7 },
    recommendation: "go",
    createdAt: "2 dager siden",
    createdBy: { name: "Vegard", avatar: "V" },
    idea_document: MOCK_MARKDOWN_DRAFT,
    evaluation_summary: SUMMARY_MD,
    market_report: MARKET_MD,
    prd: PRD_MD,
    risk_assessment: RISK_MD
  },
  {
    id: "2", 
    title: "Verdivurdering AI",
    description: "AI-drevet verktøy for automatisk verdivurdering av boliger basert på bilder og data.",
    status: "evaluated",
    scores: { market: 7, buildability: 7, business: 6, total: 6.8 },
    recommendation: "hold",
    createdAt: "3 dager siden",
    createdBy: { name: "Sander", avatar: "S" },
    evaluation_summary: SUMMARY_MD
  },
  {
    id: "3",
    title: "HMS-sjekkliste Bot",
    description: "Chatbot som hjelper entreprenører med HMS-dokumentasjon og compliance på byggeplass.",
    status: "evaluating",
    createdAt: "1 time siden",
    createdBy: { name: "Jørgen", avatar: "J" }
  },
  {
    id: "4",
    title: "Kontraktsanalysator", 
    description: "AI som leser og oppsummerer komplekse kontrakter og identifiserer risiko mot NS-standarder.",
    status: "draft",
    createdAt: "4 timer siden",
    createdBy: { name: "Vegard", avatar: "V" }
  },
  {
    id: "5",
    title: "Prosjektstyrings-assistent",
    description: "AI-assistent som hjelper prosjektledere med planlegging, oppfølging og rapportering i Jira.",
    status: "hold",
    scores: { market: 6, buildability: 5, business: 5, total: 5.2 },
    recommendation: "hold",
    createdAt: "1 uke siden",
    createdBy: { name: "Sander", avatar: "S" },
    evaluation_summary: SUMMARY_MD
  },
  {
    id: "6",
    title: "Faktura-automatisering",
    description: "OCR-basert system for automatisk fakturahåndtering og regnskapsføring for små bedrifter.",
    status: "reject",
    scores: { market: 4, buildability: 5, business: 4, total: 4.1 },
    recommendation: "reject",
    createdAt: "2 uker siden",
    createdBy: { name: "Jørgen", avatar: "J" },
    evaluation_summary: SUMMARY_MD
  },
  {
    id: "7",
    title: "Kundeservice AI for SaaS",
    description: "AI-agent som svarer på kundehenvendelser basert på dokumentasjon og tidligere tickets.",
    status: "evaluated",
    scores: { market: 7, buildability: 8, business: 7, total: 7.3 },
    recommendation: "go",
    createdAt: "2 uker siden",
    createdBy: { name: "Vegard", avatar: "V" },
    evaluation_summary: SUMMARY_MD
  },
  {
    id: "8",
    title: "Møtereferat AI",
    description: "Automatisk transkribering og oppsummering av møter med action items integrert i Notion.",
    status: "evaluated", 
    scores: { market: 7, buildability: 8, business: 7, total: 7.2 },
    recommendation: "go",
    createdAt: "3 uker siden",
    createdBy: { name: "Sander", avatar: "S" },
    evaluation_summary: SUMMARY_MD
  }
];