# SmartNotes Backend - FastAPI Server

A robust FastAPI backend for the SmartNotes AI-enhanced note-taking application with JWT authentication, PostgreSQL database, and Gemini AI integration.

## Features

- **JWT Authentication**: Secure user authentication with bcrypt password hashing
- **User Management**: Signup, login, and user profile endpoints
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Security**: HTTP Bearer token authentication with protected routes
- **AI Integration**: Ready for Gemini 2.0 Flash API integration
- **Notes API**: CRUD endpoints with AI summaries, manual tags, pin/archive helpers, and search filters
- **Async Support**: Built on FastAPI with async/await patterns
- **CORS Enabled**: Configured for Next.js frontend

## Project Structure

```
server/
├── app/
│   ├── core/
│   │   ├── config.py          # Application settings
│   │   ├── security.py        # JWT & password hashing
│   │   └── dependencies.py    # Auth dependencies
│   ├── db/
│   │   ├── base.py            # SQLAlchemy base
│   │   ├── session.py         # Database session
│   │   └── models/
│   │       └── user.py        # User model
│   ├── routers/
│   │   └── auth.py            # Authentication endpoints
│   ├── schemas/
│   │   └── user_schema.py     # Pydantic schemas
│   ├── services/              # Business logic (AI, notes)
│   └── main.py                # FastAPI application
├── alembic/                   # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip or poetry

### 2. Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb smartnotes

# Or using psql
psql -U postgres
CREATE DATABASE smartnotes;
\q
```

### 4. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret (generate with: `openssl rand -hex 32`)
- `GEMINI_API_KEY`: Google Gemini API key

### 5. Database Migration

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration with users table"

# Apply migration
alembic upgrade head
```

### 6. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python app/main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-01-07T12:00:00"
}
```

#### POST `/api/auth/login`
Authenticate and get JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET `/api/auth/me`
Get current user information (protected route).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-01-07T12:00:00"
}
```

#### POST `/api/auth/logout`
Logout endpoint (client-side token removal).

**Response:**
```json
{
  "message": "Successfully logged out. Please remove the token from client storage."
}
```

### Notes (protected)

#### GET `/api/notes`
List current user's notes. Supports `search` and `include_archived` query params.

#### POST `/api/notes`
Create a new note (optionally trigger AI enrichment).

**Request Body:**
```json
{
  "title": "Sprint recap",
  "content": "Key learnings from our AI exploration...",
  "tags": ["retro", "ai"],
  "is_pinned": true,
  "use_ai": true
}
```

**Response:**
```json
{
  "id": 42,
  "owner_id": 1,
  "title": "Sprint recap",
  "content": "Key learnings from our AI exploration...",
  "tags": ["retro", "ai"],
  "ai_summary": "Concise AI summary...",
  "ai_tags": ["ai", "learning", "retro"],
  "is_pinned": true,
  "is_archived": false,
  "created_at": "...",
  "updated_at": "..."
}
```

#### PUT `/api/notes/{note_id}`
Update note fields. Include `regenerate_ai: true` to re-run Gemini on demand.

#### DELETE `/api/notes/{note_id}`
Hard delete the note (cascade from the owning user).

### Other Endpoints

#### GET `/`
Root endpoint with API information.

#### GET `/health`
Health check endpoint.

## Using Protected Routes

To access protected routes, include the JWT token in the Authorization header:

```python
import requests

# Login
response = requests.post("http://localhost:8000/api/auth/login", json={
    "username": "johndoe",
    "password": "securepassword123"
})
token = response.json()["access_token"]

# Access protected route
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/auth/me", headers=headers)
print(response.json())
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: HS256 algorithm with configurable expiration
3. **HTTP Bearer Authentication**: Secure token transmission
4. **User Activation**: Active/inactive user status
5. **Protected Routes**: Dependency injection for authentication

## Common Issues

### Issue: Database connection error
**Solution**: Check your DATABASE_URL in .env and ensure PostgreSQL is running.

### Issue: "Could not validate credentials"
**Solution**: Token may be expired or invalid. Login again to get a new token.

### Issue: "Username already registered"
**Solution**: Choose a different username or use the existing account.

## Development

### Running Tests
```bash
pytest
```

The suite spins up an isolated SQLite database, exercises the auth + notes flow, and tears everything down automatically.

### Code Formatting
```bash
# Install formatting tools
pip install black isort

# Format code
black app/
isort app/
```

## Next Steps

1. Add semantic search + embeddings (pgvector)
2. Implement refresh tokens + remember-me sessions
3. Add rate limiting / audit logging
4. Create end-to-end tests for the React client
5. Containerize (Dockerfile + compose)
6. Add observability (structured logs, OpenTelemetry)

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT License
