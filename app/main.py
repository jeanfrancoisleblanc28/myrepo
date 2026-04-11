"""Loan Manager — FastAPI application entry point."""
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine
from app import models
from app.routers import borrowers, loans, payments, reports
from app.templates_config import templates

# Create all tables on startup (for development / SQLite)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestionnaire de prêts à terme",
    description="Application de gestion des prêts à terme pour un organisme de développement économique.",
    version="1.0.0",
)

# ── Static files ─────────────────────────────────────────────────────────────
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(borrowers.router)
app.include_router(loans.router)
app.include_router(payments.router)
app.include_router(reports.router)


# ── Root redirect ─────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
