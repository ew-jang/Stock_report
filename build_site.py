#!/usr/bin/env python3
"""report/ 의 마크다운 리포트를 GitHub Pages 사이트(docs/)로 변환한다.

파일명 규칙: report/{종목명}_{YYYY-MM-DD}.md
출력 구조:
  docs/
    index.html            모바일 SPA (manifest.json 기반)
    manifest.json         종목/리포트 목록
    .nojekyll             Jekyll 비활성화(한글 경로/디렉토리 보존)
    assets/style.css
    assets/app.js
    reports/{종목명}/{YYYY-MM-DD}.md   종목별 디렉토리 구조
"""
from __future__ import annotations
import json
import re
import shutil
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "report"
DOCS = ROOT / "docs"
NAME_RE = re.compile(r"^(?P<name>.+)_(?P<date>\d{4}-\d{2}-\d{2})\.md$")


def first_h1(md: str, fallback: str) -> str:
    for line in md.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def build() -> dict:
    reports_out = DOCS / "reports"
    if reports_out.exists():
        shutil.rmtree(reports_out)
    reports_out.mkdir(parents=True, exist_ok=True)

    stocks: dict[str, list[dict]] = {}
    for md_path in sorted(SRC.glob("*.md")):
        m = NAME_RE.match(md_path.name)
        if not m:
            print(f"  건너뜀(이름 규칙 불일치): {md_path.name}")
            continue
        name, d = m.group("name"), m.group("date")
        text = md_path.read_text(encoding="utf-8")

        dest_dir = reports_out / name
        dest_dir.mkdir(parents=True, exist_ok=True)
        (dest_dir / f"{d}.md").write_text(text, encoding="utf-8")

        stocks.setdefault(name, []).append({
            "date": d,
            "title": first_h1(text, f"{name} 분석 리포트"),
            "path": f"reports/{name}/{d}.md",
        })

    manifest = {
        "generated": date.today().isoformat(),
        "stocks": [
            {
                "name": name,
                "count": len(items),
                "latest": max(i["date"] for i in items),
                "reports": sorted(items, key=lambda i: i["date"], reverse=True),
            }
            for name, items in sorted(stocks.items())
        ],
    }
    (DOCS / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return manifest


if __name__ == "__main__":
    DOCS.mkdir(exist_ok=True)
    (DOCS / ".nojekyll").write_text("", encoding="utf-8")
    manifest = build()
    total = sum(s["count"] for s in manifest["stocks"])
    print(f"✅ 사이트 생성 완료 — 종목 {len(manifest['stocks'])}개 / 리포트 {total}건")
    for s in manifest["stocks"]:
        print(f"   - {s['name']}: {s['count']}건 (최신 {s['latest']})")
