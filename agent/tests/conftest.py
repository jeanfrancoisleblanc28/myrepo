"""Permet aux tests d'importer le module `commissaire_industriel`."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
