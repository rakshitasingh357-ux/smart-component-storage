"""
FastAPI entrypoint for the Smart Component Storage mobile app backend.

Run locally:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Interactive API docs (useful while building the mobile app's networking layer):
    http://localhost:8000/docs
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth as auth_routes
from app.routes import inventory as inventory_routes
from app.routes import cabinet as cabinet_routes
from app.routes import alerts as alerts_routes
from app.services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)

# Creates tables if they don't exist yet (fine for prototype/hackathon use;
# use Alembic migrations for production).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Component Storage API",
    description="Backend for the smart cabinet + lifecycle management mobile app (SIH 2026).",
    version="1.0.0",
)

# Allow the mobile app (and a local dev web client) to call this API.
# Lock this down to your actual app's origin(s) before production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(inventory_routes.router)
app.include_router(inventory_routes.api_router)
app.include_router(cabinet_routes.router)
app.include_router(alerts_routes.router)

@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "smart-component-storage-api"}
