#!/bin/bash
# Setup Script for MCP PDF Server

# Function to install dependencies
# The MCP PDF server runs via `npx @anthropic-ai/pdf-server`, so the only
# system-level dependency required is Node.js (which provides npm and npx).
install_dependencies() {
    echo "Installing dependencies..."
    if [[ "$OSTYPE" == "linux-gnu" ]]; then
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    else
        echo "Unsupported OS: $OSTYPE. Please install Node.js manually."
        return 1
    fi
}

# Function to set up MCP configuration
setup_configuration() {
    echo "Setting up MCP configuration..."
    CONFIG_DIR="/etc/mcp"
    # Create configuration directory
    sudo mkdir -p "${CONFIG_DIR}"
    # Copy example configuration
    sudo cp ./mcp_config_example.conf "${CONFIG_DIR}/mcp_config.conf"
}

# Function to validate installation
validate_installation() {
    echo "Validating installation..."
    # Example check
    if command -v mcp_command &> /dev/null; then
        echo "MCP installed successfully!"
    else
        echo "MCP installation failed!"
    fi
}

# Main Script Execution
install_dependencies
setup_configuration
validate_installation

# Instructions for Windows
# 1. Download and install Node.js (which includes npm and npx) from https://nodejs.org/
# 2. Set up MCP configuration in C:\Program Files\MCP\
# 3. Validate installation by running `npx @anthropic-ai/pdf-server --version` in a terminal.

echo "Setup script execution completed."