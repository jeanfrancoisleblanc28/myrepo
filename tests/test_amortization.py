"""Tests for amortization schedule generation."""
from datetime import date
from decimal import Decimal

import pytest

from app.services.amortization import (
    compute_monthly_payment,
    generate_amortization_schedule,
    ScheduleEntry,
)


class TestComputeMonthlyPayment:
    def test_standard_loan(self):
        """Classic 12-month, 6% APR, $10,000 loan."""
        pmt = compute_monthly_payment(Decimal("10000"), Decimal("0.06"), 12)
        # Expected: ~$861.00 (standard amortization tables)
        assert Decimal("855") < pmt < Decimal("870")

    def test_zero_interest(self):
        """Zero-rate loan: each payment = principal / n."""
        pmt = compute_monthly_payment(Decimal("12000"), Decimal("0"), 12)
        assert pmt == Decimal("1000.00")

    def test_small_rate(self):
        """Very small rate should not blow up."""
        pmt = compute_monthly_payment(Decimal("5000"), Decimal("0.001"), 24)
        assert pmt > 0


class TestGenerateAmortizationSchedule:
    def test_period_count(self):
        schedule = generate_amortization_schedule(
            Decimal("10000"), Decimal("0.06"), 12, date(2024, 1, 1)
        )
        assert len(schedule) == 12

    def test_first_period_opening_balance(self):
        schedule = generate_amortization_schedule(
            Decimal("10000"), Decimal("0.06"), 12, date(2024, 1, 1)
        )
        assert schedule[0].opening_balance == Decimal("10000")

    def test_last_period_closing_balance_zero(self):
        """The final closing balance must be 0."""
        schedule = generate_amortization_schedule(
            Decimal("10000"), Decimal("0.06"), 12, date(2024, 1, 1)
        )
        assert schedule[-1].closing_balance == Decimal("0.00")

    def test_balance_chain(self):
        """Each period's opening balance equals the prior period's closing balance."""
        schedule = generate_amortization_schedule(
            Decimal("50000"), Decimal("0.07"), 60, date(2023, 6, 15)
        )
        for i in range(1, len(schedule)):
            assert schedule[i].opening_balance == schedule[i - 1].closing_balance

    def test_interest_plus_principal_equals_payment(self):
        schedule = generate_amortization_schedule(
            Decimal("20000"), Decimal("0.05"), 24, date(2024, 3, 1)
        )
        for entry in schedule[:-1]:  # last entry may differ by 1 cent due to rounding
            assert entry.interest_portion + entry.principal_portion == entry.scheduled_payment

    def test_payment_frequency_monthly_due_dates(self):
        """Due dates should be monthly increments from start_date."""
        start = date(2024, 1, 31)
        schedule = generate_amortization_schedule(
            Decimal("10000"), Decimal("0.06"), 3, start
        )
        # 2024-01-31 + 1 month = 2024-02-29 (leap year cap), +2 = 2024-03-31, +3 = 2024-04-30
        assert schedule[0].due_date == date(2024, 2, 29)
        assert schedule[1].due_date == date(2024, 3, 31)
        assert schedule[2].due_date == date(2024, 4, 30)

    def test_zero_interest_schedule(self):
        schedule = generate_amortization_schedule(
            Decimal("12000"), Decimal("0"), 12, date(2024, 1, 1)
        )
        for entry in schedule:
            assert entry.interest_portion == Decimal("0.00")
        assert schedule[-1].closing_balance == Decimal("0.00")

    def test_invalid_principal(self):
        with pytest.raises(ValueError, match="capital"):
            generate_amortization_schedule(
                Decimal("-1000"), Decimal("0.05"), 12, date(2024, 1, 1)
            )

    def test_invalid_term(self):
        with pytest.raises(ValueError, match="durée"):
            generate_amortization_schedule(
                Decimal("10000"), Decimal("0.05"), 0, date(2024, 1, 1)
            )

    def test_large_loan(self):
        """Stress test: 300-month (25-year) mortgage-style loan."""
        schedule = generate_amortization_schedule(
            Decimal("500000"), Decimal("0.045"), 300, date(2020, 1, 1)
        )
        assert len(schedule) == 300
        assert schedule[-1].closing_balance == Decimal("0.00")
