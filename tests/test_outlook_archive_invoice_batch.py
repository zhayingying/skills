"""Black-box tests for chronological monthly invoice batching."""

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


class MonthlyInvoiceBatchTests(unittest.TestCase):
    """Verify chronological monthly allocation and reversible moves."""

    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name) / "invoice"
        (self.root / "2026" / "07").mkdir(parents=True)
        (self.root / "2026" / "08").mkdir(parents=True)
        (self.root / "2026" / "09").mkdir(parents=True)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def create_invoice(self, relative_directory: str, name: str) -> Path:
        """Create one distinguishable synthetic PDF."""
        path = self.root / relative_directory / name
        path.write_bytes(f"synthetic:{relative_directory}/{name}".encode())
        return path

    def test_uses_all_of_insufficient_start_month_then_fills_from_next_month(self) -> None:
        """July 800 plus the closest August 200 must produce two month folders."""
        module = load_module()
        july_300 = self.create_invoice("2026/07", "0701-300.00¥.pdf")
        july_500 = self.create_invoice("2026/07", "0702-500.00¥.pdf")
        august_90 = self.create_invoice("2026/08", "0801-90.00¥.pdf")
        august_110 = self.create_invoice("2026/08", "0802-110.00¥.pdf")
        self.create_invoice("2026/08", "0803-250.00¥.pdf")

        plan = module.build_plan(self.root, "2026-07", 100_000)

        self.assertTrue(plan.is_sufficient)
        self.assertEqual(plan.total_cents, 100_000)
        self.assertEqual(
            tuple(invoice.path for invoice in plan.months[0].selected),
            (july_300, july_500),
        )
        self.assertEqual(
            tuple(invoice.path for invoice in plan.months[1].selected),
            (august_90, august_110),
        )
        self.assertEqual(plan.months[0].total_cents, 80_000)
        self.assertEqual(plan.months[1].total_cents, 20_000)

    def test_final_month_uses_closest_overshoot_and_prefers_earlier_tie(self) -> None:
        """Only the final month optimizes against the remaining target."""
        module = load_module()
        self.create_invoice("2026/07", "0701-800.00¥.pdf")
        early_80 = self.create_invoice("2026/08", "0801-80.00¥.pdf")
        early_130 = self.create_invoice("2026/08", "0802-130.00¥.pdf")
        self.create_invoice("2026/08", "0803-100.00¥.pdf")
        self.create_invoice("2026/08", "0804-110.00¥.pdf")

        plan = module.build_plan(self.root, "2026-07", 100_000)

        self.assertEqual(plan.total_cents, 101_000)
        self.assertEqual(
            tuple(invoice.path for invoice in plan.months[1].selected),
            (early_80, early_130),
        )

    def test_apply_creates_month_folders_and_rollback_restores_sources(self) -> None:
        """Apply must create one folder per used month and preserve rollback paths."""
        module = load_module()
        july = self.create_invoice("2026/07", "0731-800.00¥.pdf")
        august = self.create_invoice("2026/08", "0801-250.00¥.pdf")
        plan = module.build_plan(self.root, "2026-07", 100_000)

        batch_directories = module.apply_plan(plan)

        self.assertEqual(
            batch_directories,
            (self.root / "2026/07/800.00¥", self.root / "2026/08/250.00¥"),
        )
        self.assertTrue((batch_directories[0] / july.name).is_file())
        self.assertTrue((batch_directories[1] / august.name).is_file())

        for batch_directory in reversed(batch_directories):
            module.rollback_batch(batch_directory)

        self.assertTrue(july.is_file())
        self.assertTrue(august.is_file())

    def test_ignores_below_minimum_and_reports_total_insufficient(self) -> None:
        """All later months are used when the archive cannot reach the target."""
        module = load_module()
        july = self.create_invoice("2026/07", "0701-300.00¥.pdf")
        august = self.create_invoice("2026/08", "0801-400.00¥.pdf")
        self.create_invoice("2026/08", "0802-0.50¥.pdf")

        plan = module.build_plan(self.root, "2026-07", 100_000)

        self.assertFalse(plan.is_sufficient)
        self.assertEqual(plan.total_cents, 70_000)
        self.assertEqual(
            tuple(invoice.path for month in plan.months for invoice in month.selected),
            (july, august),
        )


if __name__ == "__main__":
    unittest.main()
