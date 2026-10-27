# CareerFit AI — Deployment & Production Guide

This guide details running CareerFit AI locally in development mode or deploying with Docker.

---

## 1. Local Development Setup

### Prerequisites
- Node.js >= 18 (Tested on v22.19.0)
- Python >= 3.10 (Tested on 3.12.10)
- npm >= 9

### Step 1: Python AI/ML Service (:8000)
```bash
# Navigate to backend and activate venv
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows (or source venv/bin/activate on Linux/macOS)

# Install pinned dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Node.js Express Gateway (:5000)
```bash
# Navigate to server and install dependencies
cd server
npm install

# Start Express server with auto-reload
npm run dev
```

### Step 3: React Vite Client (:5173)
```bash
# Navigate to client and install dependencies
cd client
npm install

# Start Vite dev server
npm run dev
```

---

## 2. Docker Compose Deployment

A complete multi-container `docker-compose.yml` runs all three services together:

```bash
docker-compose up --build
```

Services exposed:
- Client Frontend: `http://localhost:5173`
- Express API Gateway: `http://localhost:5000`
- FastAPI AI Microservice: `http://localhost:8000`
- FastAPI Swagger Docs: `http://localhost:8000/docs`
