"""Payment allocation service.

Payments are applied in the following order:
  1. Accrued interest (interest that has been earned since the last payment or loan start).
  2. Remaining amount reduces outstanding principal.

Accrued interest is calculated using the 30/360 convention:
    accrued_interest = outstanding_principal * (APR / 360) * days_elapsed_360

where days_elapsed_360 counts elapsed months * 30.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

CENT = Decimal("0.01")


def _round(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def compute_accrued_interest(
    outstanding_principal: Decimal,
    annual_rate: Decimal,
    from_date: date,
    to_date: date,
) -> Decimal:
    """Compute accrued interest between two dates using 30/360 convention.

    Days elapsed = (Y2-Y1)*360 + (M2-M1)*30 + (D2-D1)
    where D1 and D2 are capped at 30.
    """
    if to_date <= from_date:
        return Decimal("0.00")

    d1 = min(from_date.day, 30)
    d2 = min(to_date.day, 30)
    days_360 = (
        (to_date.year - from_date.year) * 360
        + (to_date.month - from_date.month) * 30
        + (d2 - d1)
    )
    if days_360 <= 0:
        return Decimal("0.00")

    daily_rate = annual_rate / Decimal(360)
    return _round(outstanding_principal * daily_rate * Decimal(days_360))


@dataclass
class PaymentAllocation:
    interest_applied: Decimal
    principal_applied: Decimal
    balance_after: Decimal
    is_overpayment: bool


def allocate_payment(
    payment_amount: Decimal,
    outstanding_principal: Decimal,
    annual_rate: Decimal,
    last_event_date: date,
    payment_date: date,
) -> PaymentAllocation:
    """Allocate a payment to interest first, then principal.

    Args:
        payment_amount: Total amount received.
        outstanding_principal: Current outstanding principal before this payment.
        annual_rate: Annual interest rate (e.g. 0.065 for 6.5%).
        last_event_date: Date of the previous payment or loan start date.
        payment_date: Date this payment is being recorded.

    Returns:
        PaymentAllocation with breakdown and updated balance.
    """
    if payment_amount <= 0:
        raise ValueError("Le montant du paiement doit être positif.")

    accrued = compute_accrued_interest(
        outstanding_principal, annual_rate, last_event_date, payment_date
    )

    interest_applied = min(accrued, payment_amount)
    remainder = payment_amount - interest_applied

    # Apply remainder to principal (cannot exceed outstanding principal)
    principal_applied = min(remainder, outstanding_principal)
    is_overpayment = remainder > outstanding_principal

    balance_after = _round(outstanding_principal - principal_applied)
    if balance_after < 0:
        balance_after = Decimal("0.00")

    return PaymentAllocation(
        interest_applied=_round(interest_applied),
        principal_applied=_round(principal_applied),
        balance_after=balance_after,
        is_overpayment=is_overpayment,
    )
