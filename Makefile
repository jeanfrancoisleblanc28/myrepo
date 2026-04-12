.PHONY: help setup lint test pre-commit clean

help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Installer toutes les dependances (projet + dev)
	@echo "Installation des dependances..."
	@if [ -f agent/requirements.txt ]; then pip install -r agent/requirements.txt; fi
	@pip install pytest pytest-cov black flake8 pre-commit
	@pre-commit install
	@echo "Setup complet. Hooks pre-commit installes."

lint: ## Lancer tous les linters (shellcheck + flake8 + black)
	@echo "==> shellcheck..."
	@find . -name '*.sh' -not -path './.git/*' | xargs shellcheck --severity=warning || true
	@echo "==> black (verification formatage)..."
	@black --check --diff . || echo "Lancez 'black .' pour corriger le formatage"
	@echo "==> flake8..."
	@flake8 . --max-line-length=120 --extend-ignore=E203,W503 --exclude=.git,__pycache__,venv,env

test: ## Lancer les tests unitaires avec couverture
	@echo "==> pytest..."
	@pytest agent/tests/ -v --tb=short --cov=agent --cov-report=term-missing

pre-commit: ## Lancer tous les hooks pre-commit sur tous les fichiers
	@pre-commit run --all-files

clean: ## Supprimer les artefacts de build
	@rm -rf dist/ build/ __pycache__/ *.pyc .Python env/ venv/ .pytest_cache/ .coverage
	@echo "Nettoyage termine."
