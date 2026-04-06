.PHONY: help setup lint clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install project dependencies
	@echo "Setting up project..."
	@if [ -f package.json ]; then npm install; fi
	@if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
	@echo "Setup complete."

lint: ## Run linters on shell scripts
	@echo "Running shellcheck..."
	@if command -v shellcheck > /dev/null 2>&1; then \
		find . -name '*.sh' -not -path './.git/*' | xargs shellcheck --severity=warning; \
	else \
		echo "shellcheck not installed, skipping"; \
	fi

clean: ## Remove build artifacts and temporary files
	@echo "Cleaning build artifacts..."
	@rm -rf dist/ build/ __pycache__/ *.pyc .Python env/ venv/
	@echo "Clean complete."
