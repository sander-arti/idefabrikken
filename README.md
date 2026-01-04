# Idéfabrikken - AI-Powered Idea Evaluation Platform

Idéfabrikken is an internal tool for ARTI Consult that helps structure and evaluate product ideas using AI agents. Go from "vague idea" to "informed decision" in minutes.

## Features

- **AI-Assisted Structuring**: Chat with an AI agent that helps refine rough ideas into complete, structured idea documents (IDÉUTKAST.md)
- **Multi-Agent Evaluation**: 4 specialized AI agents analyze your idea from different angles:
  - Market Strategist (TAM/SAM/SOM, competition, pricing)
  - Product Architect (technical feasibility, MVP scope, stack)
  - Business Critic (unit economics, sales cycle, scalability)
  - Notes Synthesizer (holistic evaluation + recommendation)
- **Decision Tracking**: Record decisions (Go/Hold/Reject) with rationale
- **Complete Documentation**: Auto-generated reports for market, technical, and business analysis

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o
- **Hosting**: Vercel (frontend), Render/Railway (backend)

## Project Structure

```
idéfabrikken/
├── frontend/           # Next.js frontend
│   ├── components/     # React components
│   ├── pages/          # Page components (Dashboard, NewIdea, IdeaDetails)
│   ├── lib/            # API client, utilities
│   └── types.ts        # TypeScript types
├── backend/            # Express.js backend
│   ├── src/
│   │   ├── api/        # REST API routes
│   │   ├── lib/        # Business logic (agents, DB queries)
│   │   └── config/     # Environment validation
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd idéfabrikken

# Install dependencies for both frontend and backend
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the database schema:

```sql
-- Copy schema from backend/docs/database-schema.sql
-- Or use Supabase migrations if available
```

3. Get your API credentials from Settings → API:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_KEY`: Service role key (keep secret!)

### 3. Configure Environment Variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
OPENAI_API_KEY=sk-your-openai-key-here
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

**Frontend:**

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Run Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
pnpm dev
```

Backend starts on [http://localhost:4000](http://localhost:4000)

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm dev
```

Frontend starts on [http://localhost:3000](http://localhost:3000)

### 5. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Ny idé"
3. Chat with the AI to structure your idea
4. Click "Send til evaluering" when ready
5. View evaluation results with all generated documents
6. Record a decision (Go/Hold/Reject)

## API Documentation

### REST Endpoints

**Ideas:**
- `GET /api/ideas` - List all ideas (filterable by status)
- `POST /api/ideas` - Create new idea
- `GET /api/ideas/:id` - Get idea by ID
- `PATCH /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea (draft only)

**Chat:**
- `GET /api/ideas/:id/chat` - Get chat history
- `POST /api/ideas/:id/chat` - Send message to AI (Idea Receiver agent)

**Evaluation:**
- `POST /api/ideas/:id/evaluate` - Start evaluation (runs 4 AI agents)
- `GET /api/ideas/:id/evaluate` - Get evaluation status/progress

**Decision:**
- `POST /api/ideas/:id/decision` - Record decision (go/hold/reject)

### Rate Limits

- General API: 100 req / 15 min per IP
- Chat: 20 req / 5 min per IP
- Evaluation: 5 req / 10 min per IP

## Deployment

### Backend (Render/Railway)

1. Create new Web Service
2. Connect your Git repository
3. Set environment variables (same as `.env`)
4. Build command: `cd backend && pnpm install && pnpm build`
5. Start command: `cd backend && pnpm start`

### Frontend (Vercel)

1. Import project from Git
2. Set root directory to `frontend`
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Database (Supabase)

- Already hosted on Supabase
- Consider upgrading to Pro plan for production ($25/month)

## Cost Estimates

**OpenAI API (GPT-4o):**
- Chat structuring: ~$0.01-0.02 per conversation
- Evaluation (4 agents): ~$0.10-0.20 per idea
- Monthly estimate: ~$20-50 for moderate usage (50-100 ideas/month)

**Supabase:**
- Free tier: Good for development
- Pro tier: $25/month (recommended for production)

**Vercel & Render:**
- Free tiers sufficient for internal tool

## Development

### Run TypeScript Checks

```bash
# Backend
cd backend && pnpm tsc --noEmit

# Frontend
cd frontend && pnpm tsc --noEmit
```

### Run Linter

```bash
# Backend
cd backend && pnpm lint

# Frontend
cd frontend && pnpm lint
```

### Build for Production

```bash
# Backend
cd backend && pnpm build

# Frontend
cd frontend && pnpm build
```

## Troubleshooting

**Backend won't start:**
- Check `.env` file exists with all required variables
- Verify OpenAI API key starts with `sk-`
- Verify Supabase URL is valid HTTPS URL

**Frontend can't connect to backend:**
- Ensure backend is running on port 4000
- Check `VITE_API_URL` in `frontend/.env.local`
- Check CORS settings in `backend/src/index.ts`

**Evaluation fails:**
- Check OpenAI API key has credits
- Check Supabase connection
- View backend logs for detailed error

**Rate limit errors:**
- Wait for rate limit window to expire
- Adjust limits in `backend/src/api/middleware/rateLimiter.ts` for development

## Security

- Never commit `.env` files to git
- Use environment variables for all secrets
- OpenAI API key should have spending limits set
- Supabase service key should only be used server-side

## Support

For issues or questions, contact the development team or create an issue in the repository.

## License

Internal tool for ARTI Consult - not for public distribution.
