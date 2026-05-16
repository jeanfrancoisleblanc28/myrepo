"""Tests for payment allocation logic."""
from datetime import date
from decimal import Decimal

import pytest

from app.services.payment_service import allocate_payment, compute_accrued_interest


class TestComputeAccruedInterest:
    def test_one_month(self):
        """30/360: exactly one month (30 days) of interest."""
        interest = compute_accrued_interest(
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            from_date=date(2024, 1, 1),
            to_date=date(2024, 2, 1),
        )
        # 10000 * 0.06 / 360 * 30 = 50.00
        assert interest == Decimal("50.00")

    def test_zero_days(self):
        """Same date → zero interest."""
        interest = compute_accrued_interest(
            Decimal("10000"), Decimal("0.06"), date(2024, 1, 1), date(2024, 1, 1)
        )
        assert interest == Decimal("0.00")

    def test_to_before_from(self):
        """to_date before from_date → zero interest."""
        interest = compute_accrued_interest(
            Decimal("10000"), Decimal("0.06"), date(2024, 2, 1), date(2024, 1, 1)
        )
        assert interest == Decimal("0.00")

    def test_one_year(self):
        """360 days (30/360) = full year of interest."""
        interest = compute_accrued_interest(
            Decimal("10000"),
            Decimal("0.06"),
            date(2024, 1, 1),
            date(2025, 1, 1),
        )
        # 10000 * 0.06 = 600
        assert interest == Decimal("600.00")

    def test_zero_rate(self):
        interest = compute_accrued_interest(
            Decimal("10000"), Decimal("0"), date(2024, 1, 1), date(2024, 7, 1)
        )
        assert interest == Decimal("0.00")


class TestAllocatePayment:
    def test_full_payment_covers_interest_and_principal(self):
        """Exact monthly payment covers interest + reduces principal."""
        result = allocate_payment(
            payment_amount=Decimal("861.00"),
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        # Interest = 10000 * 0.06 / 360 * 30 = 50.00
        assert result.interest_applied == Decimal("50.00")
        assert result.principal_applied == Decimal("811.00")
        assert result.balance_after == Decimal("9189.00")
        assert not result.is_overpayment

    def test_partial_payment_only_covers_interest(self):
        """Payment exactly equals accrued interest: no principal reduction."""
        result = allocate_payment(
            payment_amount=Decimal("50.00"),
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        assert result.interest_applied == Decimal("50.00")
        assert result.principal_applied == Decimal("0.00")
        assert result.balance_after == Decimal("10000.00")

    def test_partial_payment_less_than_interest(self):
        """Payment less than accrued interest: goes entirely to interest."""
        result = allocate_payment(
            payment_amount=Decimal("30.00"),
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        assert result.interest_applied == Decimal("30.00")
        assert result.principal_applied == Decimal("0.00")
        assert result.balance_after == Decimal("10000.00")

    def test_overpayment(self):
        """Payment exceeds outstanding balance + interest."""
        result = allocate_payment(
            payment_amount=Decimal("10100.00"),
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        # Interest = 50, principal = 10000, total needed = 10050
        assert result.interest_applied == Decimal("50.00")
        assert result.principal_applied == Decimal("10000.00")
        assert result.balance_after == Decimal("0.00")
        assert result.is_overpayment

    def test_final_payoff(self):
        """Exact payoff amount brings balance to zero."""
        result = allocate_payment(
            payment_amount=Decimal("10050.00"),
            outstanding_principal=Decimal("10000"),
            annual_rate=Decimal("0.06"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        assert result.balance_after == Decimal("0.00")
        assert not result.is_overpayment

    def test_zero_rate_loan(self):
        """Zero-interest loan: all payment goes to principal."""
        result = allocate_payment(
            payment_amount=Decimal("500.00"),
            outstanding_principal=Decimal("6000"),
            annual_rate=Decimal("0"),
            last_event_date=date(2024, 1, 1),
            payment_date=date(2024, 2, 1),
        )
        assert result.interest_applied == Decimal("0.00")
        assert result.principal_applied == Decimal("500.00")
        assert result.balance_after == Decimal("5500.00")

    def test_invalid_payment_amount(self):
        with pytest.raises(ValueError, match="paiement"):
            allocate_payment(
                payment_amount=Decimal("0"),
                outstanding_principal=Decimal("10000"),
                annual_rate=Decimal("0.06"),
                last_event_date=date(2024, 1, 1),
                payment_date=date(2024, 2, 1),
            )
