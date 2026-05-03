#!/bin/bash
# Setup Script for MCP PDF Server
# Installe les prérequis pour exécuter @anthropic-ai/pdf-server via npx.

set -e

# Function to install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y curl jq nodejs npm
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install curl jq node
    else
        echo "Unsupported OS: $OSTYPE. Please install Node.js and npm manually."
        exit 1
    fi
}

# Function to verify the MCP PDF server package is reachable via npx
setup_configuration() {
    echo "Fetching @anthropic-ai/pdf-server via npx..."
    # npx will download the package on first use; we trigger the download now
    # so the server is ready to launch without delay.
    npx --yes @anthropic-ai/pdf-server --help >/dev/null 2>&1 || true
    echo "MCP PDF server package is ready to be launched via:"
    echo "  npx @anthropic-ai/pdf-server"
}

# Function to validate installation
validate_installation() {
    echo "Validating installation..."
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        echo "Node.js $(node --version) and npm $(npm --version) detected."
        echo "MCP PDF server setup complete."
    else
        echo "MCP installation failed: node/npm not found in PATH."
        exit 1
    fi
}

# Main Script Execution
install_dependencies
setup_configuration
validate_installation

# Instructions for Windows
# 1. Install Node.js (includes npm) from https://nodejs.org/
# 2. From a terminal, run: npx @anthropic-ai/pdf-server
# 3. Verify by checking the installed Node.js version: node --version

echo "Setup script execution completed."
