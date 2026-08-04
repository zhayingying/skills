#!/usr/bin/env python3
"""Plan, apply, or roll back one exact cross-month invoice amount batch."""

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


class BatchPlan(NamedTuple):
    """A deterministic global selection ready for preview or application."""

    root: Path
    target_cents: int
    selected: tuple[Invoice, ...]
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


def build_plan(root: Path, target_cents: int) -> BatchPlan:
    """Build one deterministic batch plan across the entire invoice archive."""
    resolved_root = root.absolute()
    invoices = discover_invoices(resolved_root)
    selected = select_invoice_subset(invoices, target_cents)
    total_cents = sum(invoice.amount_cents for invoice in selected)
    return BatchPlan(
        resolved_root,
        target_cents,
        selected,
        total_cents,
        total_cents >= target_cents,
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
        "target": cents_text(plan.target_cents),
        "total": cents_text(plan.total_cents),
        "is_sufficient": plan.is_sufficient,
        "selected": [str(invoice.relative_path) for invoice in plan.selected],
    }


def apply_plan(plan: BatchPlan) -> Path:
    """Create one root batch, move selected PDFs, and persist rollback metadata."""
    if not plan.selected:
        raise ValueError("no eligible invoices are available")
    batch_directory = plan.root / f"{cents_text(plan.total_cents)}¥"
    if batch_directory.exists():
        raise FileExistsError(f"batch directory already exists: {batch_directory}")
    for invoice in plan.selected:
        if not invoice.path.is_file() or invoice.path.resolve() != (
            plan.root / invoice.relative_path
        ).resolve():
            raise FileNotFoundError(f"planned invoice changed before apply: {invoice.path}")

    files = [
        {
            "name": invoice.path.name,
            "source": str(invoice.relative_path),
            "sha256": sha256(invoice.path),
        }
        for invoice in plan.selected
    ]
    if len({record["name"] for record in files}) != len(files):
        raise FileExistsError("selected invoices contain duplicate destination names")
    manifest = {"version": 1, **plan_dict(plan), "files": files}
    batch_directory.mkdir()
    manifest_path = batch_directory / MANIFEST_NAME
    moved: list[tuple[Path, Path]] = []
    try:
        with manifest_path.open("x", encoding="utf-8") as file_handle:
            json.dump(manifest, file_handle, ensure_ascii=False, indent=2, sort_keys=True)
            file_handle.flush()
            os.fsync(file_handle.fileno())
        for invoice, file_record in zip(plan.selected, files):
            destination = batch_directory / invoice.path.name
            invoice.path.rename(destination)
            moved.append((invoice.path, destination))
            if sha256(destination) != file_record["sha256"]:
                raise RuntimeError(f"digest changed after move: {destination}")
    except Exception:
        for source, destination in reversed(moved):
            destination.rename(source)
        manifest_path.unlink(missing_ok=True)
        batch_directory.rmdir()
        raise
    return batch_directory


def rollback_batch(batch_directory: Path) -> None:
    """Restore every manifested PDF to its original year/month directory."""
    resolved_batch = batch_directory.resolve()
    manifest_path = resolved_batch / MANIFEST_NAME
    with manifest_path.open(encoding="utf-8") as file_handle:
        manifest = json.load(file_handle)
    root = Path(manifest["root"]).resolve()
    if resolved_batch.parent != root:
        raise ValueError("manifest root does not match batch parent")
    files = manifest["files"]
    for record in files:
        source = resolved_batch / record["name"]
        destination = root / record["source"]
        if not source.is_file() or destination.exists() or not destination.parent.is_dir():
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
    plan = build_plan(args.root, decimal_to_cents(args.target))
    result = plan_dict(plan)
    result["status"] = "planned"
    if args.command == "apply":
        result["batch_dir"] = str(apply_plan(plan))
        result["status"] = "applied"
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
