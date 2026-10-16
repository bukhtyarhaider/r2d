#!/bin/zsh
# ============================================================================
# Dispatch Register - Startup Script (macOS)
# Developer: Bukhtyar Haider
# Contact:   bukhtyar.haider1@gmail.com
# ============================================================================
set -e
cd "${0:A:h}"

echo "==================================================="
echo " Dispatch Register"
echo " Developer: Bukhtyar Haider"
echo "==================================================="
echo ""

if [[ ! -x .venv/bin/python ]]; then
  echo "First-time setup: creating a local Python environment…"
  python3 -m venv .venv
  .venv/bin/python -m pip install -r requirements.txt
elif ! .venv/bin/python -c 'import pdfplumber' >/dev/null 2>&1; then
  .venv/bin/python -m pip install -r requirements.txt
fi
exec .venv/bin/python app.py "$@"
