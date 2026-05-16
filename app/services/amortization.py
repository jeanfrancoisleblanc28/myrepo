"""Amortization schedule generation using 30/360 day-count convention.

Convention 30/360:
- Each month is treated as exactly 30 days.
- A year is treated as exactly 360 days.
- Monthly interest rate = APR / 12.

Standard annuity formula:
    PMT = P * r / (1 - (1 + r)^-n)
where:
    P = principal amount
    r = monthly interest rate (APR / 12)
    n = number of periods (term_months)

For a zero-interest loan each payment is simply P / n.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List


CENT = Decimal("0.01")


def _round(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


@dataclass
class ScheduleEntry:
    period_number: int
    due_date: date
    opening_balance: Decimal
    scheduled_payment: Decimal
    interest_portion: Decimal
    principal_portion: Decimal
    closing_balance: Decimal


def _add_months(d: date, months: int) -> date:
    """Add `months` to a date, keeping the day (capped at month-end)."""
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    import calendar
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def compute_monthly_payment(
    principal: Decimal,
    annual_rate: Decimal,
    term_months: int,
) -> Decimal:
    """Return the fixed monthly payment amount (rounded to cents)."""
    if annual_rate == 0:
        return _round(principal / Decimal(term_months))
    r = annual_rate / Decimal(12)
    pmt = principal * r / (1 - (1 + r) ** (-term_months))
    return _round(pmt)


def generate_amortization_schedule(
    principal: Decimal,
    annual_rate: Decimal,
    term_months: int,
    start_date: date,
) -> List[ScheduleEntry]:
    """Generate the full amortization schedule for a loan.

    The first payment is due one period after start_date.
    The last payment is adjusted so that the closing balance is exactly 0
    (avoids rounding drift).
    """
    if principal <= 0:
        raise ValueError("Le capital (principal) doit être positif.")
    if annual_rate < 0:
        raise ValueError("Le taux d'intérêt ne peut pas être négatif.")
    if term_months <= 0:
        raise ValueError("La durée doit être supérieure à zéro.")

    monthly_rate = annual_rate / Decimal(12)
    pmt = compute_monthly_payment(principal, annual_rate, term_months)

    schedule: List[ScheduleEntry] = []
    balance = principal

    for period in range(1, term_months + 1):
        due_date = _add_months(start_date, period)
        opening = balance

        interest = _round(opening * monthly_rate)
        # Last period: clear remaining balance precisely
        if period == term_months:
            principal_portion = opening
            payment = _round(interest + principal_portion)
        else:
            principal_portion = _round(pmt - interest)
            payment = pmt

        # Guard against negative principal portion (can happen with very low rates)
        if principal_portion < 0:
            principal_portion = Decimal("0.00")
            payment = interest

        closing = _round(opening - principal_portion)
        if closing < 0:
            closing = Decimal("0.00")

        schedule.append(
            ScheduleEntry(
                period_number=period,
                due_date=due_date,
                opening_balance=opening,
                scheduled_payment=payment,
                interest_portion=interest,
                principal_portion=principal_portion,
                closing_balance=closing,
            )
        )
        balance = closing

    return schedule
