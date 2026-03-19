Gym AI Tracker
==============

Monorepo full-stack fitness tracker with:
- React + Vite + Tailwind + Chart.js frontend
- Node.js + Express + MongoDB backend with JWT auth
- Python FastAPI ML microservice for weight prediction
- Gemini-powered AI food and workout recommendations

## Apps and Services

- `frontend/` – React SPA, dark themed fitness dashboard UI
- `backend/` – REST API, authentication, business logic, AI/Gemini integration
- `ml-service/` – FastAPI service exposing `/predict` for weight change estimation
- `docker/` – Dockerfiles and `docker-compose` configuration

## Environment Variables

Create a `.env` file in the repo root based on `.env.example`.

Core variables:
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – secret key for signing JWTs
- `ML_SERVICE_URL` – base URL for the FastAPI ML service (e.g. `http://ml-service:8000`)
- `GEMINI_API_KEY` – API key for Google Gemini

## Getting Started (High Level)

1. Install Node.js (LTS) and Python 3.10+.
2. Install dependencies in `backend/`, `frontend/`, and `ml-service/`.
3. Start MongoDB (or use Docker).
4. Run the backend API, ML service, and frontend dev server.

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# ML service
cd ../ml-service
python -m venv .venv && .venv\\Scripts\\activate  # on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../frontend
npm install
npm run dev
```

The apps will be available at:
- Backend API: `http://localhost:4000/api`
- ML service: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Docker

To run everything with Docker:

```bash
docker compose up --build
```

Then open the frontend at `http://localhost:5173`.

Detailed setup instructions will be added after implementation.

