"""Black-box tests for global invoice amount batching."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = (
    Path(__file__).parents[1]
    / "outlook-archive-invoices"
    / "scripts"
    / "batch_invoices.py"
)


def load_module():
    """Load the batch script through its public filesystem entrypoint."""
    spec = importlib.util.spec_from_file_location("batch_invoices", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load script: {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class GlobalInvoiceBatchTests(unittest.TestCase):
    """Verify exact cross-month selection and reversible moves."""

    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name) / "invoice"
        (self.root / "2026" / "07").mkdir(parents=True)
        (self.root / "2026" / "08").mkdir(parents=True)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def create_invoice(self, relative_directory: str, name: str) -> Path:
        """Create one distinguishable synthetic PDF."""
        path = self.root / relative_directory / name
        path.write_bytes(f"synthetic:{relative_directory}/{name}".encode())
        return path

    def test_selects_one_exact_global_batch_and_prefers_earlier_tie(self) -> None:
        """Equal exact totals must choose the chronologically earlier combination."""
        module = load_module()
        july_400 = self.create_invoice("2026/07", "0701-400.00¥.pdf")
        july_600 = self.create_invoice("2026/07", "0702-600.00¥.pdf")
        self.create_invoice("2026/08", "0801-500.00¥.pdf")
        self.create_invoice("2026/08", "0802-500.00¥.pdf")

        plan = module.build_plan(self.root, 100_000)

        self.assertEqual(plan.total_cents, 100_000)
        self.assertEqual(
            tuple(invoice.path for invoice in plan.selected),
            (july_400, july_600),
        )

    def test_uses_closest_overshoot_and_ignores_below_minimum(self) -> None:
        """The result must be the mathematical minimum over target across months."""
        module = load_module()
        self.create_invoice("2026/07", "0701-9.99¥.pdf")
        early = self.create_invoice("2026/07", "0718-244.52¥.pdf")
        middle = self.create_invoice("2026/08", "0803-283.00¥.pdf")
        late = self.create_invoice("2026/08", "0804-490.00¥.pdf")
        self.create_invoice("2026/08", "0805-1779.00¥.pdf")

        plan = module.build_plan(self.root, 100_000)

        self.assertEqual(plan.total_cents, 101_752)
        self.assertEqual(
            tuple(invoice.path for invoice in plan.selected), (early, middle, late)
        )

    def test_apply_creates_one_root_batch_and_rollback_restores_months(self) -> None:
        """Apply must preserve names and rollback must restore original month paths."""
        module = load_module()
        july = self.create_invoice("2026/07", "0731-600.00¥.pdf")
        august = self.create_invoice("2026/08", "0801-450.00¥.pdf")
        plan = module.build_plan(self.root, 100_000)

        batch_directory = module.apply_plan(plan)

        self.assertEqual(batch_directory, self.root / "1050.00¥")
        self.assertTrue((batch_directory / july.name).is_file())
        self.assertTrue((batch_directory / august.name).is_file())
        self.assertFalse(july.exists())
        self.assertFalse(august.exists())

        module.rollback_batch(batch_directory)

        self.assertTrue(july.is_file())
        self.assertTrue(august.is_file())
        self.assertFalse(batch_directory.exists())

    def test_selects_all_eligible_invoices_when_archive_total_is_insufficient(self) -> None:
        """An insufficient archive must be explicit and must still exclude tiny invoices."""
        module = load_module()
        july = self.create_invoice("2026/07", "0701-300.00¥.pdf")
        august = self.create_invoice("2026/08", "0801-400.00¥.pdf")
        self.create_invoice("2026/08", "0802-0.50¥.pdf")

        plan = module.build_plan(self.root, 100_000)

        self.assertFalse(plan.is_sufficient)
        self.assertEqual(plan.total_cents, 70_000)
        self.assertEqual(
            tuple(invoice.path for invoice in plan.selected), (july, august)
        )


if __name__ == "__main__":
    unittest.main()
