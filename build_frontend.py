#!/usr/bin/env python3
"""
R2D - Modular Frontend Bundler
Bundles static/src/ modules into static/app.js
Developer: Bukhtyar Haider
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "static" / "src"
OUT_FILE = ROOT / "static" / "app.js"

ORDERED_MODULES = [
    "core/icons.js",
    "core/location.js",
    "core/export.js",
    "core/store.js",
    "core/api.js",
    "components/Toast.js",
    "components/Header.js",
    "components/StatsHUD.js",
    "components/FilterBar.js",
    "components/ProspectsTable.js",
    "components/CarrierDossier.js",
    "components/BatchImporter.js",
    "components/ArchiveManager.js",
    "components/ShortcutsModal.js",
    "main.js"
]

def clean_module(code: str, filename: str) -> str:
    lines = []
    for line in code.splitlines():
        # Remove import statements
        if re.match(r'^\s*import\s+', line):
            continue
        # Remove export default or export { ... }
        if re.match(r'^\s*export\s+\{[^}]*\}\s*;?', line):
            continue
        # Convert export class Foo -> class Foo
        line = re.sub(r'^\s*export\s+class\s+', 'class ', line)
        # Convert export const foo -> const foo
        line = re.sub(r'^\s*export\s+const\s+', 'const ', line)
        # Convert export function foo -> function foo
        line = re.sub(r'^\s*export\s+function\s+', 'function ', line)
        # Convert export let / var -> let / var
        line = re.sub(r'^\s*export\s+(let|var)\s+', r'\1 ', line)
        lines.append(line)
    
    body = "\n".join(lines).strip()
    return f"// =====================================================================\n// Module: {filename}\n// =====================================================================\n{body}\n"

def build():
    bundled_parts = []
    header = """/**
 * R2D · Register to Dot — FMCSA Dispatch Register Prospect Intelligence
 * Developer: Bukhtyar Haider
 * Generated from static/src/ modular component architecture
 */
(function() {
'use strict';
"""
    bundled_parts.append(header)

    for mod_path in ORDERED_MODULES:
        full_path = SRC_DIR / mod_path
        if not full_path.exists():
            print(f"Warning: {full_path} does not exist!")
            continue
        code = full_path.read_text(encoding="utf-8")
        bundled_parts.append(clean_module(code, mod_path))

    footer = """
})();
"""
    bundled_parts.append(footer)

    OUT_FILE.write_text("\n".join(bundled_parts), encoding="utf-8")
    print(f"Successfully compiled {len(ORDERED_MODULES)} modules to {OUT_FILE} ({OUT_FILE.stat().st_size} bytes)")

if __name__ == "__main__":
    build()
