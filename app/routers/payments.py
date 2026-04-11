"""Payment recording routes."""
from datetime import date as date_type
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.payment_service import allocate_payment
from app.templates_config import templates

router = APIRouter(prefix="/payments", tags=["payments"])


def _get_last_event_date(loan: models.Loan) -> date_type:
    """Return the date of the most recent payment, or the loan start date."""
    if loan.payments:
        return max(p.payment_date for p in loan.payments)
    return loan.start_date


# ── HTML views ──────────────────────────────────────────────────────────────

@router.get("/new", response_class=HTMLResponse)
def new_payment_form(
    request: Request,
    loan_id: int = None,
    db: Session = Depends(get_db),
):
    loans = (
        db.query(models.Loan)
        .filter(models.Loan.status == models.LoanStatus.active)
        .all()
    )
    selected_loan = None
    if loan_id:
        selected_loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    return templates.TemplateResponse(
        "payments/form.html",
        {
            "request": request,
            "loans": loans,
            "selected_loan": selected_loan,
            "errors": [],
        },
    )


@router.post("/new")
async def record_payment_form(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    errors = []
    loans = (
        db.query(models.Loan)
        .filter(models.Loan.status == models.LoanStatus.active)
        .all()
    )

    try:
        loan_id = int(form.get("loan_id", 0))
        amount = Decimal(form.get("amount", "0"))
        payment_date = date_type.fromisoformat(form.get("payment_date", ""))
    except Exception:
        errors.append("Données invalides. Veuillez vérifier les champs.")

    if not errors:
        loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
        if not loan:
            errors.append("Prêt introuvable.")
        elif loan.status == models.LoanStatus.closed:
            errors.append("Ce prêt est fermé; aucun paiement ne peut être enregistré.")

    if errors:
        return templates.TemplateResponse(
            "payments/form.html",
            {"request": request, "loans": loans, "errors": errors, "form": form},
        )

    last_date = _get_last_event_date(loan)
    allocation = allocate_payment(
        payment_amount=amount,
        outstanding_principal=Decimal(str(loan.outstanding_principal)),
        annual_rate=Decimal(str(loan.annual_interest_rate)),
        last_event_date=last_date,
        payment_date=payment_date,
    )

    payment = models.Payment(
        loan_id=loan.id,
        payment_date=payment_date,
        amount=amount,
        interest_applied=allocation.interest_applied,
        principal_applied=allocation.principal_applied,
        balance_after=allocation.balance_after,
        notes=form.get("notes") or None,
    )
    loan.outstanding_principal = allocation.balance_after
    if allocation.balance_after == 0:
        loan.status = models.LoanStatus.closed

    db.add(payment)
    db.commit()
    return RedirectResponse(url=f"/loans/{loan.id}", status_code=303)


# ── JSON API ─────────────────────────────────────────────────────────────────

@router.post("/api/", response_model=schemas.PaymentOut, status_code=201)
def api_record_payment(data: schemas.PaymentCreate, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == data.loan_id).first()
    if not loan:
        raise HTTPException(404, detail="Prêt introuvable")
    if loan.status == models.LoanStatus.closed:
        raise HTTPException(400, detail="Prêt fermé")

    last_date = _get_last_event_date(loan)
    allocation = allocate_payment(
        payment_amount=Decimal(str(data.amount)),
        outstanding_principal=Decimal(str(loan.outstanding_principal)),
        annual_rate=Decimal(str(loan.annual_interest_rate)),
        last_event_date=last_date,
        payment_date=data.payment_date,
    )

    payment = models.Payment(
        loan_id=loan.id,
        payment_date=data.payment_date,
        amount=data.amount,
        interest_applied=allocation.interest_applied,
        principal_applied=allocation.principal_applied,
        balance_after=allocation.balance_after,
        notes=data.notes,
    )
    loan.outstanding_principal = allocation.balance_after
    if allocation.balance_after == 0:
        loan.status = models.LoanStatus.closed

    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
