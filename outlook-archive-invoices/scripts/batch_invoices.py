#!/usr/bin/env python3
"""Plan, apply, or roll back chronological monthly invoice batches."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import NamedTuple


MINIMUM_CENTS = 1_000
MAX_SUBSET_STATES = 1_000_000
MANIFEST_NAME = ".invoice-batch.json"
YEAR_PATTERN = re.compile(r"^\d{4}$")
MONTH_PATTERN = re.compile(r"^(0[1-9]|1[0-2])$")
START_MONTH_PATTERN = re.compile(r"^(?P<year>\d{4})-(?P<month>0[1-9]|1[0-2])$")
INVOICE_PATTERN = re.compile(
    r"^(?P<month>\d{2})(?P<day>\d{2})-(?P<amount>\d+\.\d{2})¥"
    r"(?:_[0-9a-f]{10})?\.pdf$"
)


class Invoice(NamedTuple):
    """One eligible invoice parsed from a canonical year/month path."""

    path: Path
    relative_path: Path
    date_key: str
    amount_cents: int


class MonthBatch(NamedTuple):
    """Invoices allocated to one chronological month folder."""

    month_directory: Path
    selected: tuple[Invoice, ...]
    total_cents: int


class BatchPlan(NamedTuple):
    """A deterministic multi-month plan ready for preview or application."""

    root: Path
    start_month: str
    target_cents: int
    months: tuple[MonthBatch, ...]
    total_cents: int
    is_sufficient: bool


def decimal_to_cents(value: str) -> int:
    """Parse a positive amount with at most two decimal places into cents."""
    try:
        amount = Decimal(value)
    except InvalidOperation as error:
        raise ValueError("amount must be a decimal number") from error
    if not amount.is_finite() or amount <= 0 or amount.as_tuple().exponent < -2:
        raise ValueError("amount must be positive with at most two decimal places")
    return int(amount.quantize(Decimal("0.01")) * 100)


def cents_text(value: int) -> str:
    """Format cents as a two-decimal amount."""
    return f"{Decimal(value) / Decimal(100):.2f}"


def parse_start_month(value: str) -> tuple[str, str]:
    """Return a strict ``(year, month)`` pair from ``YYYY-MM``."""
    match = START_MONTH_PATTERN.fullmatch(value)
    if match is None:
        raise ValueError("start month must use YYYY-MM")
    return match.group("year"), match.group("month")


def discover_invoices(root: Path) -> tuple[Invoice, ...]:
    """Discover eligible PDFs only from canonical ``YYYY/MM`` directories."""
    if not root.is_dir():
        raise NotADirectoryError(f"invoice root is unavailable: {root}")
    invoices: list[Invoice] = []
    for year_directory in root.iterdir():
        if not year_directory.is_dir() or YEAR_PATTERN.fullmatch(year_directory.name) is None:
            continue
        for month_directory in year_directory.iterdir():
            if (
                not month_directory.is_dir()
                or MONTH_PATTERN.fullmatch(month_directory.name) is None
            ):
                continue
            for path in month_directory.iterdir():
                if not path.is_file():
                    continue
                match = INVOICE_PATTERN.fullmatch(path.name)
                if match is None or match.group("month") != month_directory.name:
                    continue
                amount_cents = decimal_to_cents(match.group("amount"))
                if amount_cents < MINIMUM_CENTS:
                    continue
                relative_path = path.relative_to(root)
                date_key = (
                    f"{year_directory.name}{month_directory.name}{match.group('day')}"
                )
                invoices.append(Invoice(path, relative_path, date_key, amount_cents))
    invoices.sort(key=lambda invoice: (invoice.date_key, str(invoice.relative_path)))
    return tuple(invoices)


def select_invoice_subset(
    invoices: tuple[Invoice, ...], target_cents: int
) -> tuple[Invoice, ...]:
    """Select the closest total at or above target, preferring earlier invoices on ties."""
    if target_cents <= 0:
        raise ValueError("target must be positive")
    if not invoices:
        return ()
    if sum(invoice.amount_cents for invoice in invoices) < target_cents:
        return invoices
    states: dict[int, tuple[int, ...]] = {0: ()}
    for index, invoice in enumerate(invoices):
        additions: dict[int, tuple[int, ...]] = {}
        for current_total, indices in states.items():
            next_total = current_total + invoice.amount_cents
            candidate = indices + (index,)
            existing = states.get(next_total) or additions.get(next_total)
            if existing is None or candidate < existing:
                additions[next_total] = candidate
        for total, indices in additions.items():
            existing = states.get(total)
            if existing is None or indices < existing:
                states[total] = indices
        if len(states) > MAX_SUBSET_STATES:
            raise RuntimeError(
                f"exact selection exceeded {MAX_SUBSET_STATES} subset states"
            )
    winning_total = min(total for total in states if total >= target_cents)
    return tuple(invoices[index] for index in states[winning_total])


def build_plan(root: Path, start_month: str, target_cents: int) -> BatchPlan:
    """Allocate earlier months fully, then optimize the first month able to finish."""
    if target_cents <= 0:
        raise ValueError("target must be positive")
    start_year, start_month_number = parse_start_month(start_month)
    start_key = f"{start_year}{start_month_number}"
    resolved_root = root.absolute()
    grouped: dict[Path, list[Invoice]] = {}
    for invoice in discover_invoices(resolved_root):
        month_key = f"{invoice.relative_path.parts[0]}{invoice.relative_path.parts[1]}"
        if month_key >= start_key:
            grouped.setdefault(invoice.path.parent, []).append(invoice)

    months: list[MonthBatch] = []
    accumulated_cents = 0
    for month_directory in sorted(grouped, key=lambda path: str(path.relative_to(resolved_root))):
        invoices = tuple(grouped[month_directory])
        remaining_cents = target_cents - accumulated_cents
        available_cents = sum(invoice.amount_cents for invoice in invoices)
        selected = (
            invoices
            if available_cents < remaining_cents
            else select_invoice_subset(invoices, remaining_cents)
        )
        month_total = sum(invoice.amount_cents for invoice in selected)
        months.append(MonthBatch(month_directory, selected, month_total))
        accumulated_cents += month_total
        if accumulated_cents >= target_cents:
            break
    return BatchPlan(
        resolved_root,
        start_month,
        target_cents,
        tuple(months),
        accumulated_cents,
        accumulated_cents >= target_cents,
    )


def sha256(path: Path) -> str:
    """Return the SHA-256 digest of one PDF."""
    digest = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def plan_dict(plan: BatchPlan) -> dict[str, object]:
    """Return the public machine-readable representation of a plan."""
    return {
        "root": str(plan.root),
        "start_month": plan.start_month,
        "target": cents_text(plan.target_cents),
        "total": cents_text(plan.total_cents),
        "is_sufficient": plan.is_sufficient,
        "months": [
            {
                "month": str(month.month_directory.relative_to(plan.root)),
                "total": cents_text(month.total_cents),
                "selected": [str(invoice.relative_path) for invoice in month.selected],
            }
            for month in plan.months
        ],
    }


def batch_manifest(plan: BatchPlan, month: MonthBatch) -> dict[str, object]:
    """Build the rollback manifest for one monthly folder."""
    return {
        "version": 2,
        "root": str(plan.root),
        "start_month": plan.start_month,
        "target": cents_text(plan.target_cents),
        "month": str(month.month_directory.relative_to(plan.root)),
        "total": cents_text(month.total_cents),
        "files": [
            {
                "name": invoice.path.name,
                "source": str(invoice.relative_path),
                "sha256": sha256(invoice.path),
            }
            for invoice in month.selected
        ],
    }


def apply_plan(plan: BatchPlan) -> tuple[Path, ...]:
    """Create all monthly folders atomically and move every selected PDF."""
    if not plan.months:
        raise ValueError("no eligible invoices are available")
    operations: list[tuple[MonthBatch, Path, dict[str, object]]] = []
    for month in plan.months:
        batch_directory = month.month_directory / f"{cents_text(month.total_cents)}¥"
        if batch_directory.exists():
            raise FileExistsError(f"batch directory already exists: {batch_directory}")
        for invoice in month.selected:
            if not invoice.path.is_file() or invoice.path.parent != month.month_directory:
                raise FileNotFoundError(
                    f"planned invoice changed before apply: {invoice.path}"
                )
        operations.append((month, batch_directory, batch_manifest(plan, month)))

    created: list[Path] = []
    moved: list[tuple[Path, Path]] = []
    try:
        for month, batch_directory, manifest in operations:
            batch_directory.mkdir()
            created.append(batch_directory)
            manifest_path = batch_directory / MANIFEST_NAME
            with manifest_path.open("x", encoding="utf-8") as file_handle:
                json.dump(manifest, file_handle, ensure_ascii=False, indent=2, sort_keys=True)
                file_handle.flush()
                os.fsync(file_handle.fileno())
            file_records = manifest["files"]
            if not isinstance(file_records, list):
                raise TypeError("generated manifest files must be a list")
            for invoice, file_record in zip(month.selected, file_records):
                if not isinstance(file_record, dict):
                    raise TypeError("generated manifest file record must be an object")
                destination = batch_directory / invoice.path.name
                invoice.path.rename(destination)
                moved.append((invoice.path, destination))
                if sha256(destination) != file_record["sha256"]:
                    raise RuntimeError(f"digest changed after move: {destination}")
    except Exception:
        for source, destination in reversed(moved):
            destination.rename(source)
        for batch_directory in reversed(created):
            (batch_directory / MANIFEST_NAME).unlink(missing_ok=True)
            batch_directory.rmdir()
        raise
    return tuple(operation[1] for operation in operations)


def rollback_batch(batch_directory: Path) -> None:
    """Restore one monthly batch to its original direct-child paths."""
    resolved_batch = batch_directory.resolve()
    manifest_path = resolved_batch / MANIFEST_NAME
    with manifest_path.open(encoding="utf-8") as file_handle:
        manifest = json.load(file_handle)
    root = Path(manifest["root"]).resolve()
    month_directory = root / manifest["month"]
    if resolved_batch.parent != month_directory.resolve():
        raise ValueError("manifest month does not match batch parent")
    files = manifest["files"]
    for record in files:
        source = resolved_batch / record["name"]
        destination = root / record["source"]
        if not source.is_file() or destination.exists() or destination.parent != month_directory:
            raise RuntimeError(f"rollback precondition failed for: {record['name']}")
        if sha256(source) != record["sha256"]:
            raise RuntimeError(f"rollback digest mismatch: {source}")
    moved: list[tuple[Path, Path]] = []
    try:
        for record in files:
            source = resolved_batch / record["name"]
            destination = root / record["source"]
            source.rename(destination)
            moved.append((source, destination))
        manifest_path.unlink()
        resolved_batch.rmdir()
    except Exception:
        for source, destination in reversed(moved):
            destination.rename(source)
        raise


def parse_args() -> argparse.Namespace:
    """Parse plan, apply, and rollback commands."""
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("plan", "apply"):
        subparser = subparsers.add_parser(command)
        subparser.add_argument("--root", required=True, type=Path)
        subparser.add_argument("--start-month", required=True)
        subparser.add_argument("--target", required=True)
    rollback = subparsers.add_parser("rollback")
    rollback.add_argument("--batch-dir", required=True, type=Path)
    return parser.parse_args()


def main() -> None:
    """Execute one command and print one JSON result."""
    args = parse_args()
    if args.command == "rollback":
        rollback_batch(args.batch_dir)
        print(json.dumps({"status": "rolled_back", "batch_dir": str(args.batch_dir)}))
        return
    plan = build_plan(args.root, args.start_month, decimal_to_cents(args.target))
    result = plan_dict(plan)
    result["status"] = "planned"
    if args.command == "apply":
        result["batch_dirs"] = [str(path) for path in apply_plan(plan)]
        result["status"] = "applied"
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
