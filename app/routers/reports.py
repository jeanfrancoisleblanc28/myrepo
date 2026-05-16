"""Reports and CSV export routes."""
import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.templates_config import templates

router = APIRouter(prefix="/reports", tags=["reports"])


def _kpis(loan: models.Loan, db: Session) -> dict:
    """Compute per-loan KPIs."""
    today = date.today()
    # Next scheduled payment date
    next_due = None
    days_past_due = 0
    for entry in loan.amortization_schedule:
        if entry.closing_balance > 0 or entry.period_number == 1:
            if entry.due_date >= today:
                next_due = entry.due_date
                break
            else:
                days_past_due = (today - entry.due_date).days

    # Accrued interest to date (since last payment or start)
    from app.services.payment_service import compute_accrued_interest
    from decimal import Decimal

    last_date = loan.start_date
    if loan.payments:
        last_date = max(p.payment_date for p in loan.payments)

    accrued = compute_accrued_interest(
        Decimal(str(loan.outstanding_principal)),
        Decimal(str(loan.annual_interest_rate)),
        last_date,
        today,
    )

    return {
        "outstanding_principal": loan.outstanding_principal,
        "accrued_interest": accrued,
        "next_due_date": next_due,
        "days_past_due": days_past_due,
    }


# ── HTML views ──────────────────────────────────────────────────────────────

@router.get("/summary", response_class=HTMLResponse)
def loan_summary(request: Request, db: Session = Depends(get_db)):
    loans = db.query(models.Loan).join(models.Borrower).all()
    rows = []
    for loan in loans:
        kpi = _kpis(loan, db)
        rows.append({
            "loan": loan,
            **kpi,
        })
    return templates.TemplateResponse(
        "reports/summary.html", {"request": request, "rows": rows}
    )


@router.get("/payments/{loan_id}", response_class=HTMLResponse)
def payment_history(loan_id: int, request: Request, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        return templates.TemplateResponse(
            "reports/not_found.html", {"request": request}, status_code=404
        )
    kpi = _kpis(loan, db)
    return templates.TemplateResponse(
        "reports/payment_history.html",
        {"request": request, "loan": loan, **kpi},
    )


# ── CSV exports ───────────────────────────────────────────────────────────────

@router.get("/summary/csv")
def loan_summary_csv(db: Session = Depends(get_db)):
    loans = db.query(models.Loan).join(models.Borrower).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Numéro de prêt",
        "Emprunteur",
        "Date de début",
        "Capital initial",
        "Taux annuel (%)",
        "Durée (mois)",
        "Solde capital",
        "Intérêts courus",
        "Statut",
    ])
    for loan in loans:
        kpi = _kpis(loan, db)
        writer.writerow([
            loan.loan_number,
            loan.borrower.legal_name,
            loan.start_date.isoformat(),
            f"{loan.principal_amount:.2f}",
            f"{float(loan.annual_interest_rate) * 100:.4f}",
            loan.term_months,
            f"{kpi['outstanding_principal']:.2f}",
            f"{kpi['accrued_interest']:.2f}",
            loan.status.value,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sommaire_prets.csv"},
    )


@router.get("/payments/{loan_id}/csv")
def payment_history_csv(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        return StreamingResponse(iter([""]), media_type="text/csv", status_code=404)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date",
        "Montant",
        "Intérêts appliqués",
        "Capital appliqué",
        "Solde après",
        "Notes",
    ])
    for p in loan.payments:
        writer.writerow([
            p.payment_date.isoformat(),
            f"{p.amount:.2f}",
            f"{p.interest_applied:.2f}",
            f"{p.principal_applied:.2f}",
            f"{p.balance_after:.2f}",
            p.notes or "",
        ])

    output.seek(0)
    filename = f"historique_paiements_{loan.loan_number}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
