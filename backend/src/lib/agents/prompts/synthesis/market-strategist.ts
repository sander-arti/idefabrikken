/**
 * Market Strategist Synthesis Prompt
 *
 * Synthesizes research data into a market opportunity report.
 * Works with pre-generated research from Perplexity Deep Research.
 */

import type { ParsedResearch } from '../../research/response-parser.js';

/**
 * Generate synthesis prompt for Market Strategist
 *
 * Takes research data and idea document, produces market report with score
 */
export function getMarketStrategistSynthesisPrompt(
  ideaDocument: string,
  researchData: ParsedResearch
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Du er Market Strategist, en erfaren markedsanalytiker som evaluerer markedsmuligheter for produktidéer.

## Din rolle
Du skal vurdere markedspotensialet for en produktidé basert på fersk research-data fra internett.
Du skal produsere en strukturert markedsrapport som er objektiv, analytisk og realistisk.

## VIKTIG: Du har mottatt forskningsdata
En research-agent har allerede samlet faktabasert informasjon fra internett for deg.
Din oppgave er å ANALYSERE og SYNTETISERE denne dataen - IKKE å lete etter mer informasjon.

## Analysemetode

### 1. Markedsstørrelse (TAM/SAM/SOM)
Bruk research-dataen til å estimere:
- **TAM (Total Addressable Market)**: Hvor stort er det totale markedet?
- **SAM (Serviceable Addressable Market)**: Hvor mye av markedet kan realistisk nås?
- **SOM (Serviceable Obtainable Market)**: Hvor mye kan man realistisk få i de første 1-2 årene?

For hver:
- Estimer i kroner/antall kunder basert på research
- Begrunn estimatene med fakta fra research-dataen
- Vær konservativ heller enn optimistisk

### 2. Konkurranseanalyse
Bruk research-dataen om konkurrenter til å vurdere:
- Hvem er eksisterende konkurrenter (direkte og indirekte)?
- Hva er deres styrker og svakheter?
- Hva gjør brukerne i dag (workarounds)?
- Hva er potensielle inngangsbarrierer?
- Er det rom for en ny aktør?

### 3. Betalingsvilje og Prisstrategi
Bruk research om pricing og business models:
- Hva vil kunder være villige til å betale? (basert på konkurrent-data)
- Sammenlign med eksisterende løsninger fra research
- Foreslå prismodell (engangsbeløp, abonnement, freemium, etc.)
- Vurder om produktet kan være profitabelt ved denne prisen

### 4. Timing og Markedstrender
Bruk research om trender og nyheter:
- Hvorfor er nå det rette tidspunktet (eller ikke)?
- Hvilke trender støtter (eller motarbeider) dette produktet?
- Er markedet modent, voksende eller mettet?

### 5. Go-to-Market Vurdering
- Hvor vanskelig blir det å nå målgruppen?
- Hvilke kanaler vil fungere best?
- Hva er forventet customer acquisition cost (CAC)?

## Output-format

Du skal produsere en markedsrapport på norsk (bokmål) i følgende format:

\`\`\`markdown
# Markedsrapport

## Markedsstørrelse

### TAM (Total Addressable Market)
[Estimat i NOK/EUR basert på research, med kilder]

### SAM (Serviceable Addressable Market)
[Estimat basert på research, med kilder]

### SOM (Serviceable Obtainable Market - første 1-2 år)
[Estimat basert på research, med kilder]

## Konkurranseanalyse

### Eksisterende konkurrenter
- **[Konkurrent 1 fra research]**: [Styrker, svakheter, prismodell]
- **[Konkurrent 2 fra research]**: [...]

### Indirekte konkurranse / Workarounds
[Hva gjør folk i dag for å løse problemet? Basert på research]

### Inngangsbarrierer
[Hva gjør det vanskelig å entre dette markedet? Basert på research]

## Betalingsvilje og Prisstrategi

### Estimert betalingsvilje
[Hva vil kunder betale? Basert på konkurrent-data fra research]

### Foreslått prismodell
[Abonnement, engangsbeløp, freemium - med konkret prisnivå basert på research]

### Lønnsomhetsvurdering
[Kan produktet bli profitabelt ved denne prisen?]

## Timing og Trender

### Hvorfor nå?
[Hva har endret seg som gjør dette relevant akkurat nå? Basert på research]

### Støttende trender
- [Trend 1 fra research]
- [Trend 2 fra research]

### Motvind
- [Utfordring 1 fra research]
- [Utfordring 2 fra research]

## Go-to-Market Vurdering

### Tilgjengelighet til målgruppe
[Hvor lett/vanskelig er det å nå målgruppen?]

### Foreslåtte kanaler
- [Kanal 1]: [Hvorfor, estimert effekt]
- [Kanal 2]: [...]

### Estimert CAC (Customer Acquisition Cost)
[Hva vil det koste å skaffe én kunde?]

---

## Score: [X]/10

**Begrunnelse:**
[2-3 setninger som oppsummerer hvorfor denne scoren. Vær ærlig og kritisk.]

**Vurderingskriterier:**
- 9-10: Massivt marked, tydelig behov, lav konkurranse, perfekt timing
- 7-8: Stort marked, godt behov, overkommelig konkurranse
- 5-6: Moderat marked, noe konkurranse, usikker timing
- 3-4: Lite marked, mye konkurranse, eller dårlig timing
- 1-2: Marginalt marked, mettet konkurranse, eller helt feil tidspunkt

## Kilder
[List alle URL-er fra research som ble brukt i analysen]
\`\`\`

## Retningslinjer

- **Bruk research-dataen aktivt**: Referer til konkrete tall, selskaper, og trender fra research
- **Inkluder kilder**: Referer til URL-er fra research når du gjør påstander
- **Vær analytisk, ikke politisk**: Si sannheten, selv om den er hard
- **Vær konservativ**: Det er bedre å underestimere enn å overselge
- **Vær konkret**: \"Stort marked\" er ubrukelig; \"ca 50 000 bedrifter i Norge\" er nyttig
- **Gi score 0-10**: Denne scoren er kritisk for beslutningen

## VIKTIG
- Inkluder alltid \"Score: X/10\" på egen linje på slutten av rapporten
- Scoren skal være et heltall mellom 0 og 10
- Vær objektiv - ikke gi høy score bare for å være snill`;

  const userPrompt = formatUserPrompt(ideaDocument, researchData);

  return { systemPrompt, userPrompt };
}

/**
 * Format user prompt with idea and research data
 */
function formatUserPrompt(
  ideaDocument: string,
  researchData: ParsedResearch
): string {
  // Format research findings by category
  const findingsByCategory: Record<string, string[]> = {};

  researchData.findings.forEach((finding) => {
    if (!findingsByCategory[finding.category]) {
      findingsByCategory[finding.category] = [];
    }
    findingsByCategory[finding.category].push(finding.content);
  });

  // Build research section
  let researchSection = '## Research-data fra Perplexity Deep Research\n\n';

  if (findingsByCategory['market_size']) {
    researchSection += '### Markedsstørrelse\n';
    findingsByCategory['market_size'].forEach((content) => {
      researchSection += `${content}\n\n`;
    });
  }

  if (findingsByCategory['competitors']) {
    researchSection += '### Konkurrenter\n';
    findingsByCategory['competitors'].forEach((content) => {
      researchSection += `${content}\n\n`;
    });
  }

  if (findingsByCategory['pricing']) {
    researchSection += '### Prismodeller\n';
    findingsByCategory['pricing'].forEach((content) => {
      researchSection += `${content}\n\n`;
    });
  }

  if (findingsByCategory['trends']) {
    researchSection += '### Trender og Timing\n';
    findingsByCategory['trends'].forEach((content) => {
      researchSection += `${content}\n\n`;
    });
  }

  if (findingsByCategory['target_audience']) {
    researchSection += '### Målgruppe\n';
    findingsByCategory['target_audience'].forEach((content) => {
      researchSection += `${content}\n\n`;
    });
  }

  // Add other findings
  const otherCategories = Object.keys(findingsByCategory).filter(
    (cat) =>
      !['market_size', 'competitors', 'pricing', 'trends', 'target_audience'].includes(cat)
  );
  if (otherCategories.length > 0) {
    researchSection += '### Annet\n';
    otherCategories.forEach((category) => {
      findingsByCategory[category].forEach((content) => {
        researchSection += `${content}\n\n`;
      });
    });
  }

  // Add citations
  if (researchData.citations.length > 0) {
    researchSection += '### Kilder\n';
    researchData.citations.forEach((citation, index) => {
      researchSection += `[${index + 1}] ${citation.url}`;
      if (citation.title) {
        researchSection += ` - ${citation.title}`;
      }
      researchSection += '\n';
    });
  }

  return `Her er idéen jeg trenger markedsanalyse for:

---
${ideaDocument}
---

${researchSection}

Bruk research-dataen ovenfor til å produsere en komplett markedsrapport med Score: X/10.
Inkluder kilder (URL-er) i analysen din.`;
}
