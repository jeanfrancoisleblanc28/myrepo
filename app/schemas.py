"""Pydantic schemas for request/response validation."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ──────────────────────────────────────────────
# Borrower
# ──────────────────────────────────────────────

class BorrowerBase(BaseModel):
    legal_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class BorrowerCreate(BorrowerBase):
    pass


class BorrowerUpdate(BorrowerBase):
    legal_name: Optional[str] = Field(None, min_length=1, max_length=255)


class BorrowerOut(BorrowerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Loan
# ──────────────────────────────────────────────

class LoanBase(BaseModel):
    borrower_id: int
    loan_number: str = Field(..., min_length=1, max_length=50)
    principal_amount: Decimal = Field(..., gt=0, decimal_places=2)
    annual_interest_rate: Decimal = Field(..., ge=0, decimal_places=6)
    term_months: int = Field(..., gt=0)
    start_date: date
    payment_frequency: str = "monthly"

    @field_validator("annual_interest_rate")
    @classmethod
    def rate_not_above_100(cls, v: Decimal) -> Decimal:
        if v > 1:
            raise ValueError(
                "annual_interest_rate doit être exprimé en décimal (ex: 0.065 pour 6.5%)"
            )
        return v


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    status: Optional[str] = None
    annual_interest_rate: Optional[Decimal] = Field(None, ge=0)


class AmortizationEntryOut(BaseModel):
    period_number: int
    due_date: date
    opening_balance: Decimal
    scheduled_payment: Decimal
    interest_portion: Decimal
    principal_portion: Decimal
    closing_balance: Decimal

    model_config = {"from_attributes": True}


class LoanOut(LoanBase):
    id: int
    status: str
    outstanding_principal: Decimal
    day_count_convention: str
    created_at: datetime
    borrower: Optional[BorrowerOut] = None
    amortization_schedule: List[AmortizationEntryOut] = []

    model_config = {"from_attributes": True}


class LoanSummaryOut(BaseModel):
    id: int
    loan_number: str
    borrower_name: str
    start_date: date
    principal_amount: Decimal
    annual_interest_rate: Decimal
    term_months: int
    outstanding_principal: Decimal
    status: str

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Payment
# ──────────────────────────────────────────────

class PaymentCreate(BaseModel):
    loan_id: int
    payment_date: date
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    notes: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    loan_id: int
    payment_date: date
    amount: Decimal
    interest_applied: Decimal
    principal_applied: Decimal
    balance_after: Decimal
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
