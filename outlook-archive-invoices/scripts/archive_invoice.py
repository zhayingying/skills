#!/usr/bin/env python3
"""Validate, deduplicate, convert, and archive one invoice as PDF."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path


PDF_SUFFIX = ".pdf"
PNG_SUFFIX = ".png"
MINIMUM_ARCHIVE_AMOUNT = Decimal("10.00")
SOURCE_DIGEST_ATTRIBUTE = "com.openai.codex.invoice-source-sha256"


def parse_args() -> argparse.Namespace:
    """Parse the explicit archive contract from command-line arguments."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--invoice-date", required=True)
    parser.add_argument("--amount", required=True)
    parser.add_argument("--input", required=True, action="append", type=Path)
    return parser.parse_args()


def validate_date(value: str) -> date:
    """Return a strict ISO invoice date or raise a descriptive error."""
    try:
        parsed = date.fromisoformat(value)
    except ValueError as error:
        raise ValueError("--invoice-date must be a real date in YYYY-MM-DD format") from error
    if parsed.isoformat() != value:
        raise ValueError("--invoice-date must use zero-padded YYYY-MM-DD format")
    return parsed


def validate_inputs(inputs: list[Path]) -> tuple[str, list[Path]]:
    """Enforce one PDF or one-or-more PNG files and return the selected mode."""
    if not inputs:
        raise ValueError("at least one --input is required")
    for input_path in inputs:
        if not input_path.is_file():
            raise FileNotFoundError(f"input is not a file: {input_path}")
    suffixes = [path.suffix.lower() for path in inputs]
    pdf_count = suffixes.count(PDF_SUFFIX)
    if pdf_count:
        if len(inputs) != 1 or pdf_count != 1:
            raise ValueError("PDF mode accepts exactly one PDF and no other inputs")
        return "pdf", inputs
    if all(suffix == PNG_SUFFIX for suffix in suffixes):
        return "png", inputs
    raise ValueError("inputs must be exactly one PDF or one-or-more PNG files")


def validate_amount(value: str) -> Decimal:
    """Return a non-negative invoice total with exactly two decimal places."""
    try:
        amount = Decimal(value)
    except InvalidOperation as error:
        raise ValueError("--amount must be a decimal number without a currency symbol") from error
    if not amount.is_finite() or amount < 0:
        raise ValueError("--amount must be a finite non-negative decimal number")
    if amount.as_tuple().exponent < -2:
        raise ValueError("--amount must have at most two decimal places")
    return amount.quantize(Decimal("0.01"))


def sha256(path: Path) -> str:
    """Return the SHA-256 digest for one file."""
    digest = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def source_sha256(mode: str, inputs: list[Path]) -> str:
    """Return a stable digest for a PDF or the ordered source PNG collection."""
    if mode == "pdf":
        return sha256(inputs[0])
    digest = hashlib.sha256()
    for input_path in inputs:
        digest.update(bytes.fromhex(sha256(input_path)))
        digest.update(b"\x00")
    return digest.hexdigest()


def read_source_digest(path: Path) -> str | None:
    """Read the source digest attached to an archived PDF, when present."""
    result = subprocess.run(
        ["/usr/bin/xattr", "-p", SOURCE_DIGEST_ATTRIBUTE, str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def find_duplicate(
    root: Path, candidate_digest: str, compare_pdf_bytes: bool
) -> Path | None:
    """Return an archived PDF with the same recorded source content."""
    for existing_path in root.rglob("*.pdf"):
        if not existing_path.is_file():
            continue
        if read_source_digest(existing_path) == candidate_digest:
            return existing_path
        if compare_pdf_bytes and sha256(existing_path) == candidate_digest:
            return existing_path
    return None


def convert_pngs(inputs: list[Path], output: Path) -> None:
    """Convert PNGs with macOS tools and combine them into one ordered PDF."""
    join_tool = Path(
        "/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join"
    )
    if not join_tool.is_file():
        raise FileNotFoundError(f"macOS PDF join tool is unavailable: {join_tool}")
    converted_paths: list[Path] = []
    for index, input_path in enumerate(inputs):
        converted_path = output.with_name(f"page-{index:04d}.pdf")
        subprocess.run(
            [
                "/usr/bin/sips",
                "-s",
                "format",
                "pdf",
                str(input_path),
                "--out",
                str(converted_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        converted_paths.append(converted_path)
    if len(converted_paths) == 1:
        os.replace(converted_paths[0], output)
    else:
        subprocess.run(
            [str(join_tool), "-o", str(output), *map(str, converted_paths)],
            check=True,
            capture_output=True,
            text=True,
        )
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError("PNG conversion did not produce a non-empty PDF")


def choose_destination(directory: Path, stem: str, digest: str) -> Path:
    """Return a non-overwriting destination, adding a digest suffix on collision."""
    destination = directory / f"{stem}.pdf"
    if not destination.exists():
        return destination
    suffixed = directory / f"{stem}_{digest[:10]}.pdf"
    if suffixed.exists():
        raise FileExistsError(f"non-duplicate destination already exists: {suffixed}")
    return suffixed


def archive() -> dict[str, str]:
    """Run the archive transaction and return its machine-readable result."""
    args = parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        raise NotADirectoryError(f"archive root does not exist or is not a directory: {root}")
    invoice_date = validate_date(args.invoice_date)
    invoice_amount = validate_amount(args.amount)
    if invoice_amount < MINIMUM_ARCHIVE_AMOUNT:
        return {
            "status": "below_minimum",
            "amount": f"{invoice_amount:.2f}",
            "minimum": f"{MINIMUM_ARCHIVE_AMOUNT:.2f}",
        }
    mode, inputs = validate_inputs(args.input)
    with tempfile.TemporaryDirectory(prefix="invoice-archive-") as temporary_directory:
        candidate = Path(temporary_directory) / "candidate.pdf"
        if mode == "pdf":
            shutil.copyfile(inputs[0], candidate)
        else:
            convert_pngs(inputs, candidate)
        digest = source_sha256(mode, inputs)
        duplicate = find_duplicate(root, digest, compare_pdf_bytes=mode == "pdf")
        if duplicate is not None:
            return {"status": "duplicate", "path": str(duplicate), "sha256": digest}
        destination_directory = root / f"{invoice_date.year:04d}" / f"{invoice_date.month:02d}"
        destination_directory.mkdir(parents=True, exist_ok=True)
        stem = f"{invoice_date:%m%d}-{invoice_amount:.2f}¥"
        destination = choose_destination(destination_directory, stem, digest)
        temporary_destination = destination.with_name(f".{destination.name}.{os.getpid()}.tmp")
        try:
            with candidate.open("rb") as source, temporary_destination.open("xb") as target:
                shutil.copyfileobj(source, target)
                target.flush()
                os.fsync(target.fileno())
            subprocess.run(
                [
                    "/usr/bin/xattr",
                    "-w",
                    SOURCE_DIGEST_ATTRIBUTE,
                    digest,
                    str(temporary_destination),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            os.replace(temporary_destination, destination)
        finally:
            temporary_destination.unlink(missing_ok=True)
    return {"status": "archived", "path": str(destination), "sha256": digest}


def main() -> None:
    """Print exactly one JSON result and let failures terminate non-zero."""
    print(json.dumps(archive(), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
