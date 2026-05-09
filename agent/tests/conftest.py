"""Pytest configuration for the commissaire industriel agent test suite.

`agent/` is not a package (no __init__.py), so we add it to sys.path here
to allow `from commissaire_industriel import ...` imports from tests.
"""

import sys
from pathlib import Path

AGENT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AGENT_DIR))
