"""SQLAlchemy ORM models for the Loan Manager application."""
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Numeric, Date, DateTime,
    ForeignKey, Enum, Text, Boolean,
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class LoanStatus(str, enum.Enum):
    active = "active"
    closed = "closed"


class PaymentFrequency(str, enum.Enum):
    monthly = "monthly"


class Borrower(Base):
    __tablename__ = "borrowers"

    id = Column(Integer, primary_key=True, index=True)
    legal_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    loans = relationship("Loan", back_populates="borrower")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer, ForeignKey("borrowers.id"), nullable=False)
    loan_number = Column(String(50), unique=True, nullable=False, index=True)
    principal_amount = Column(Numeric(15, 2), nullable=False)
    annual_interest_rate = Column(Numeric(8, 6), nullable=False)  # e.g. 0.065 = 6.5%
    term_months = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    payment_frequency = Column(
        Enum(PaymentFrequency), default=PaymentFrequency.monthly, nullable=False
    )
    # Day-count convention: 30/360 — each month is treated as 30 days, year as 360 days
    day_count_convention = Column(String(20), default="30/360", nullable=False)
    status = Column(Enum(LoanStatus), default=LoanStatus.active, nullable=False)
    # Running balances (updated on each payment)
    outstanding_principal = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    borrower = relationship("Borrower", back_populates="loans")
    amortization_schedule = relationship(
        "AmortizationEntry", back_populates="loan", order_by="AmortizationEntry.period_number"
    )
    payments = relationship("Payment", back_populates="loan", order_by="Payment.payment_date")


class AmortizationEntry(Base):
    """One row per period in the amortization schedule."""
    __tablename__ = "amortization_schedule"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    period_number = Column(Integer, nullable=False)  # 1-based
    due_date = Column(Date, nullable=False)
    opening_balance = Column(Numeric(15, 2), nullable=False)
    scheduled_payment = Column(Numeric(15, 2), nullable=False)
    interest_portion = Column(Numeric(15, 2), nullable=False)
    principal_portion = Column(Numeric(15, 2), nullable=False)
    closing_balance = Column(Numeric(15, 2), nullable=False)

    loan = relationship("Loan", back_populates="amortization_schedule")


class Payment(Base):
    """Immutable record of each payment received."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    interest_applied = Column(Numeric(15, 2), nullable=False, default=0)
    principal_applied = Column(Numeric(15, 2), nullable=False, default=0)
    balance_after = Column(Numeric(15, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    loan = relationship("Loan", back_populates="payments")
