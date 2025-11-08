# SmartNotes – AI powered note taking

An end-to-end FastAPI + Next.js application for capturing notes, enriching them with Gemini summaries/tags, and sharing a polished demo with recruiters in minutes.

## Project structure

```
AI_notes/
├── server/   # FastAPI backend (JWT auth, Alembic, Gemini service)
└── client/   # Next.js frontend that consumes the API
```

## Features

- Secure signup/login with hashed passwords and JWT bearer auth
- Postgres (or SQLite for local/dev) storage via SQLAlchemy + Alembic
- AI enrichment service that generates summaries + tags with Gemini and falls back gracefully offline
- Note CRUD API with pin/archive/search helpers
- Ready-to-run Next.js UI that showcases auth, note composer, AI summaries, and note management
- Pytest suite that exercises the primary note workflow

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (or stick with SQLite for quick demos)

## Backend setup (FastAPI)

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

cp .env.example .env
# update DATABASE_URL, SECRET_KEY, GEMINI_API_KEY (optional) inside .env

# Initialize database
alembic upgrade head

# Run the API
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Frontend setup (Next.js + React)

```bash
cd client
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `client/.env.local` if the API is not at `http://localhost:8000/api`.

## Running tests

```bash
cd server
pytest
```

Tests run against an ephemeral SQLite database (no Postgres required) and cover the end-to-end auth + note flow.

## Demo workflow

1. Start the FastAPI server (`uvicorn app.main:app --reload`)
2. Start the Next.js dev server (`npm run dev`)
3. Visit http://localhost:3000, create an account, and start generating AI-enriched notes ✨

## Recruiter-ready talking points

- JWT-secured FastAPI backend with Alembic migrations
- AI enrichment service that gracefully falls back when an API key isn’t provided
- Clean Next.js UI that highlights authentication, composer UX, AI summaries, pin/archive filters
- Automated pytest ensuring CRUD + AI regeneration stays healthy
