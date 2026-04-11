"""Borrower CRUD routes."""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.templates_config import templates

router = APIRouter(prefix="/borrowers", tags=["borrowers"])


def get_borrower_or_404(borrower_id: int, db: Session) -> models.Borrower:
    b = db.query(models.Borrower).filter(models.Borrower.id == borrower_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Emprunteur introuvable")
    return b


# ── HTML views ──────────────────────────────────────────────────────────────

@router.get("/", response_class=HTMLResponse)
def list_borrowers(request: Request, db: Session = Depends(get_db)):
    borrowers = db.query(models.Borrower).order_by(models.Borrower.legal_name).all()
    return templates.TemplateResponse(
        "borrowers/list.html", {"request": request, "borrowers": borrowers}
    )


@router.get("/new", response_class=HTMLResponse)
def new_borrower_form(request: Request):
    return templates.TemplateResponse(
        "borrowers/form.html", {"request": request, "borrower": None, "errors": []}
    )


@router.post("/new")
async def create_borrower_form(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    errors = []
    legal_name = form.get("legal_name", "").strip()
    if not legal_name:
        errors.append("Le nom légal est obligatoire.")
    if errors:
        return templates.TemplateResponse(
            "borrowers/form.html",
            {"request": request, "borrower": None, "errors": errors, "form": form},
        )
    borrower = models.Borrower(
        legal_name=legal_name,
        email=form.get("email") or None,
        phone=form.get("phone") or None,
        address=form.get("address") or None,
    )
    db.add(borrower)
    db.commit()
    return RedirectResponse(url="/borrowers/", status_code=303)


@router.get("/{borrower_id}", response_class=HTMLResponse)
def view_borrower(borrower_id: int, request: Request, db: Session = Depends(get_db)):
    b = get_borrower_or_404(borrower_id, db)
    return templates.TemplateResponse(
        "borrowers/detail.html", {"request": request, "borrower": b}
    )


@router.get("/{borrower_id}/edit", response_class=HTMLResponse)
def edit_borrower_form(borrower_id: int, request: Request, db: Session = Depends(get_db)):
    b = get_borrower_or_404(borrower_id, db)
    return templates.TemplateResponse(
        "borrowers/form.html", {"request": request, "borrower": b, "errors": []}
    )


@router.post("/{borrower_id}/edit")
async def update_borrower(
    borrower_id: int, request: Request, db: Session = Depends(get_db)
):
    b = get_borrower_or_404(borrower_id, db)
    form = await request.form()
    errors = []
    legal_name = form.get("legal_name", "").strip()
    if not legal_name:
        errors.append("Le nom légal est obligatoire.")
    if errors:
        return templates.TemplateResponse(
            "borrowers/form.html",
            {"request": request, "borrower": b, "errors": errors, "form": form},
        )
    b.legal_name = legal_name
    b.email = form.get("email") or None
    b.phone = form.get("phone") or None
    b.address = form.get("address") or None
    db.commit()
    return RedirectResponse(url=f"/borrowers/{b.id}", status_code=303)


# ── JSON API endpoints ───────────────────────────────────────────────────────

@router.get("/api/list", response_model=list[schemas.BorrowerOut])
def api_list_borrowers(db: Session = Depends(get_db)):
    return db.query(models.Borrower).all()


@router.post("/api/", response_model=schemas.BorrowerOut, status_code=201)
def api_create_borrower(data: schemas.BorrowerCreate, db: Session = Depends(get_db)):
    borrower = models.Borrower(**data.model_dump())
    db.add(borrower)
    db.commit()
    db.refresh(borrower)
    return borrower
