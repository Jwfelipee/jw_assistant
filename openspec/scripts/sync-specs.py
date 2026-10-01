#!/usr/bin/env python3
"""Merge OpenSpec change deltas into openspec/specs/."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHANGES = ROOT / "changes"
OUT = ROOT / "specs"

# Order matters for overlapping capabilities.
CHANGE_ORDER = [
    "midweek-assignment-system",
    "assignment-rules-v2",
    "assignment-ux-improvements",
    "assignment-schedule-v2",
    "public-schedule-links",
    "assignment-history-filters",
]

REQ_HEADER = re.compile(r"^### Requirement: (.+)$", re.MULTILINE)


def extract_section(content: str, section: str) -> str:
    pattern = rf"## {section} Requirements\s*\n(.*?)(?=\n## |\Z)"
    m = re.search(pattern, content, re.DOTALL)
    return m.group(1) if m else ""


def parse_requirements(block: str) -> dict[str, str]:
    reqs: dict[str, str] = {}
    if not block.strip():
        return reqs
    parts = REQ_HEADER.split(block)
    # parts[0] is preamble; then title, body, title, body, ...
    i = 1
    while i < len(parts) - 1:
        title = parts[i].strip()
        body = parts[i + 1].rstrip()
        reqs[title] = f"### Requirement: {title}\n{body}\n"
        i += 2
    return reqs


def apply_delta(store: dict[str, str], delta_path: Path) -> None:
    content = delta_path.read_text(encoding="utf-8")
    for section in ("ADDED", "MODIFIED"):
        block = extract_section(content, section)
        for title, body in parse_requirements(block).items():
            if section == "ADDED" and title in store:
                continue
            store[title] = body


def collect_capability_files() -> dict[str, list[Path]]:
    by_cap: dict[str, list[Path]] = {}
    for change in CHANGE_ORDER:
        spec_dir = CHANGES / change / "specs"
        if not spec_dir.is_dir():
            continue
        for spec_file in spec_dir.rglob("spec.md"):
            cap = spec_file.relative_to(spec_dir).as_posix()
            by_cap.setdefault(cap, []).append(spec_file)
    return by_cap


def main() -> None:
    by_cap = collect_capability_files()
    OUT.mkdir(parents=True, exist_ok=True)
    for cap, paths in sorted(by_cap.items()):
        store: dict[str, str] = {}
        for p in paths:
            apply_delta(store, p)
        out_path = OUT / cap
        out_path.parent.mkdir(parents=True, exist_ok=True)
        rendered = "## Requirements\n\n" + "\n".join(store.values())
        out_path.write_text(rendered, encoding="utf-8")
        print(f"Wrote {out_path.relative_to(ROOT)} ({len(store)} requirements)")


if __name__ == "__main__":
    main()
