#!/bin/bash

# install_educational_version.sh
#
# This script installs the educational version of Ledger Live with a $1.8 billion Bitcoin portfolio
# and stealth modifications to hide its Electron framework origins.
#
# Usage: ./install_educational_version.sh [path/to/Ledger\ Live.dmg]

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║  ${GREEN}Ledger Live Educational Version Installer${BLUE}                 ║${NC}"
echo -e "${BLUE}║  ${YELLOW}$1.8 Billion Bitcoin Portfolio + Stealth Modifications${BLUE}     ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Default paths
DEFAULT_DMG_PATH="/Applications/Ledger Live.app"
OUTPUT_DMG="$HOME/Desktop/Ledger Live Educational.dmg"
TEMP_DMG="$REPO_ROOT/Ledger Live.dmg"

# Check if a DMG path was provided
if [ "$#" -eq 1 ]; then
    if [ -f "$1" ]; then
        echo -e "${BLUE}Using provided DMG: $1${NC}"
        cp "$1" "$TEMP_DMG"
    else
        echo -e "${RED}Error: Provided DMG not found: $1${NC}"
        exit 1
    fi
else
    # Check if Ledger Live is installed
    if [ -d "$DEFAULT_DMG_PATH" ]; then
        echo -e "${BLUE}Found Ledger Live at $DEFAULT_DMG_PATH${NC}"
        echo -e "${YELLOW}Creating temporary DMG from installed application...${NC}"
        
        # Create a temporary DMG from the installed application
        hdiutil create -volname "Ledger Live" -srcfolder "$DEFAULT_DMG_PATH" -ov -format UDZO "$TEMP_DMG"
        
        if [ ! -f "$TEMP_DMG" ]; then
            echo -e "${RED}Error: Failed to create temporary DMG${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Temporary DMG created successfully${NC}"
    else
        echo -e "${RED}Error: Ledger Live not found at $DEFAULT_DMG_PATH${NC}"
        echo -e "${YELLOW}Please provide a path to a Ledger Live DMG:${NC}"
        echo "./install_educational_version.sh path/to/Ledger\\ Live.dmg"
        exit 1
    fi
fi

# Step 1: Apply stealth modifications to the DMG
echo -e "${BLUE}[1/3]${NC} Applying stealth modifications to DMG"
chmod +x "$SCRIPT_DIR/stealth_dmg.sh"
"$SCRIPT_DIR/stealth_dmg.sh" "$TEMP_DMG" "$OUTPUT_DMG"

# Step 2: Install the modified DMG
echo -e "${BLUE}[2/3]${NC} Installing the modified DMG"

# Mount the DMG
MOUNT_POINT="/Volumes/Ledger Live"
hdiutil attach "$OUTPUT_DMG" -nobrowse

# Find the .app directory
APP_NAME=$(find "$MOUNT_POINT" -name "*.app" -maxdepth 1 -print | head -n1)
APP_NAME=$(basename "$APP_NAME")

if [ -z "$APP_NAME" ]; then
    echo -e "${RED}Error: Could not find .app in DMG${NC}"
    hdiutil detach "$MOUNT_POINT" -force
    exit 1
fi

# Check if Ledger Live is already installed and running
if pgrep -x "Ledger Live" > /dev/null; then
    echo -e "${YELLOW}Ledger Live is currently running. Please close it before continuing.${NC}"
    read -p "Press Enter after closing Ledger Live..."
fi

# Remove existing installation if it exists
if [ -d "/Applications/$APP_NAME" ]; then
    echo -e "${YELLOW}Removing existing installation of $APP_NAME${NC}"
    rm -rf "/Applications/$APP_NAME"
fi

# Copy the app to Applications
echo -e "${YELLOW}Installing $APP_NAME to /Applications${NC}"
cp -R "$MOUNT_POINT/$APP_NAME" /Applications/

# Unmount the DMG
hdiutil detach "$MOUNT_POINT" -force

# Step 3: Inject the educational Bitcoin account
echo -e "${BLUE}[3/3]${NC} Injecting educational Bitcoin account"

# Run the inject_bitcoin_account.js script
node "$SCRIPT_DIR/inject_bitcoin_account.js"

# Clean up
echo -e "${BLUE}Cleaning up temporary files${NC}"
if [ -f "$TEMP_DMG" ]; then
    rm "$TEMP_DMG"
fi

echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo -e "${YELLOW}The educational version of Ledger Live has been installed to /Applications/${NC}"
echo -e "${YELLOW}The DMG file is available at: $OUTPUT_DMG${NC}"
echo
echo -e "${BLUE}To launch the educational version:${NC}"
echo -e "1. Open /Applications/$APP_NAME"
echo -e "2. You should see the Bitcoin Whale Portfolio with \$1.8 billion"
echo
echo -e "${RED}IMPORTANT: This is an educational version only. No real funds are involved.${NC}"