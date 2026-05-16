"""Loan CRUD routes + amortization schedule."""
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.amortization import generate_amortization_schedule
from app.templates_config import templates

router = APIRouter(prefix="/loans", tags=["loans"])


def get_loan_or_404(loan_id: int, db: Session) -> models.Loan:
    loan = (
        db.query(models.Loan)
        .filter(models.Loan.id == loan_id)
        .first()
    )
    if not loan:
        raise HTTPException(status_code=404, detail="Prêt introuvable")
    return loan


def _create_loan_with_schedule(data: dict, db: Session) -> models.Loan:
    """Create the loan record and persist its amortization schedule."""
    principal = Decimal(str(data["principal_amount"]))
    rate = Decimal(str(data["annual_interest_rate"]))
    term = int(data["term_months"])
    start = data["start_date"]

    schedule = generate_amortization_schedule(principal, rate, term, start)

    loan = models.Loan(
        borrower_id=data["borrower_id"],
        loan_number=data["loan_number"],
        principal_amount=principal,
        annual_interest_rate=rate,
        term_months=term,
        start_date=start,
        outstanding_principal=principal,
        status=models.LoanStatus.active,
    )
    db.add(loan)
    db.flush()  # get loan.id

    entries = [
        models.AmortizationEntry(
            loan_id=loan.id,
            period_number=e.period_number,
            due_date=e.due_date,
            opening_balance=e.opening_balance,
            scheduled_payment=e.scheduled_payment,
            interest_portion=e.interest_portion,
            principal_portion=e.principal_portion,
            closing_balance=e.closing_balance,
        )
        for e in schedule
    ]
    db.add_all(entries)
    db.commit()
    db.refresh(loan)
    return loan


# ── HTML views ──────────────────────────────────────────────────────────────

@router.get("/", response_class=HTMLResponse)
def list_loans(request: Request, db: Session = Depends(get_db)):
    loans = (
        db.query(models.Loan)
        .join(models.Borrower)
        .order_by(models.Loan.loan_number)
        .all()
    )
    return templates.TemplateResponse(
        "loans/list.html", {"request": request, "loans": loans}
    )


@router.get("/new", response_class=HTMLResponse)
def new_loan_form(request: Request, db: Session = Depends(get_db)):
    borrowers = db.query(models.Borrower).order_by(models.Borrower.legal_name).all()
    return templates.TemplateResponse(
        "loans/form.html",
        {"request": request, "loan": None, "borrowers": borrowers, "errors": []},
    )


@router.post("/new")
async def create_loan_form(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    errors = []
    borrowers = db.query(models.Borrower).order_by(models.Borrower.legal_name).all()

    # Validate
    try:
        principal = Decimal(form.get("principal_amount", "0"))
        rate = Decimal(form.get("annual_interest_rate", "0"))
        term = int(form.get("term_months", "0"))
    except Exception:
        errors.append("Veuillez entrer des valeurs numériques valides.")

    loan_number = form.get("loan_number", "").strip()
    if not loan_number:
        errors.append("Le numéro de prêt est obligatoire.")

    if not errors:
        # check unique loan_number
        existing = db.query(models.Loan).filter(models.Loan.loan_number == loan_number).first()
        if existing:
            errors.append(f"Le numéro de prêt «{loan_number}» est déjà utilisé.")

    if errors:
        return templates.TemplateResponse(
            "loans/form.html",
            {"request": request, "loan": None, "borrowers": borrowers, "errors": errors, "form": form},
        )

    from datetime import date
    try:
        start_date = date.fromisoformat(form.get("start_date", ""))
    except ValueError:
        errors.append("Date de début invalide.")
        return templates.TemplateResponse(
            "loans/form.html",
            {"request": request, "loan": None, "borrowers": borrowers, "errors": errors, "form": form},
        )

    try:
        loan = _create_loan_with_schedule(
            {
                "borrower_id": int(form.get("borrower_id")),
                "loan_number": loan_number,
                "principal_amount": principal,
                "annual_interest_rate": rate,
                "term_months": term,
                "start_date": start_date,
            },
            db,
        )
    except Exception as exc:
        errors.append(str(exc))
        return templates.TemplateResponse(
            "loans/form.html",
            {"request": request, "loan": None, "borrowers": borrowers, "errors": errors, "form": form},
        )

    return RedirectResponse(url=f"/loans/{loan.id}", status_code=303)


@router.get("/{loan_id}", response_class=HTMLResponse)
def view_loan(loan_id: int, request: Request, db: Session = Depends(get_db)):
    loan = get_loan_or_404(loan_id, db)
    return templates.TemplateResponse(
        "loans/detail.html", {"request": request, "loan": loan}
    )


@router.post("/{loan_id}/close")
def close_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = get_loan_or_404(loan_id, db)
    loan.status = models.LoanStatus.closed
    db.commit()
    return RedirectResponse(url=f"/loans/{loan.id}", status_code=303)


# ── JSON API ─────────────────────────────────────────────────────────────────

@router.post("/api/", response_model=schemas.LoanOut, status_code=201)
def api_create_loan(data: schemas.LoanCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Loan).filter(models.Loan.loan_number == data.loan_number).first()
    if existing:
        raise HTTPException(400, detail="loan_number déjà utilisé")
    loan = _create_loan_with_schedule(data.model_dump(), db)
    return loan


@router.get("/api/{loan_id}", response_model=schemas.LoanOut)
def api_get_loan(loan_id: int, db: Session = Depends(get_db)):
    return get_loan_or_404(loan_id, db)
