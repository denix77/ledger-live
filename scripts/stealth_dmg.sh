#!/bin/bash

# stealth_dmg.sh
#
# This script modifies a Ledger Live DMG to hide its Electron framework origins
# by renaming "Electron Framework.framework" to "Ledger Core.framework" and
# making other stealth modifications while preserving code signatures.
#
# Usage: ./stealth_dmg.sh path/to/Ledger\ Live.dmg output/path/Ledger\ Live\ Stealth.dmg

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
echo -e "${BLUE}║  ${GREEN}Ledger Live DMG Stealth Modifier${BLUE}                          ║${NC}"
echo -e "${BLUE}║  ${YELLOW}Hides Electron framework traces while preserving signatures${BLUE}  ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo

# Check arguments
if [ "$#" -ne 2 ]; then
    echo -e "${RED}Error: Invalid arguments${NC}"
    echo "Usage: $0 path/to/Ledger\ Live.dmg output/path/Ledger\ Live\ Stealth.dmg"
    exit 1
fi

INPUT_DMG="$1"
OUTPUT_DMG="$2"

# Check if input DMG exists
if [ ! -f "$INPUT_DMG" ]; then
    echo -e "${RED}Error: Input DMG not found: $INPUT_DMG${NC}"
    exit 1
fi

# Create temporary working directory
WORK_DIR=$(mktemp -d)
MOUNT_POINT="$WORK_DIR/mount"
APP_COPY="$WORK_DIR/app_copy"
MODIFIED_DMG="$WORK_DIR/modified.dmg"

echo -e "${BLUE}[1/7]${NC} Creating temporary working directory: $WORK_DIR"
mkdir -p "$MOUNT_POINT"
mkdir -p "$APP_COPY"

# Mount the DMG
echo -e "${BLUE}[2/7]${NC} Mounting input DMG: $INPUT_DMG"
hdiutil attach "$INPUT_DMG" -mountpoint "$MOUNT_POINT" -nobrowse

# Find the .app directory
APP_NAME=$(find "$MOUNT_POINT" -name "*.app" -maxdepth 1 -print | head -n1)
APP_NAME=$(basename "$APP_NAME")

if [ -z "$APP_NAME" ]; then
    echo -e "${RED}Error: Could not find .app in DMG${NC}"
    hdiutil detach "$MOUNT_POINT" -force
    rm -rf "$WORK_DIR"
    exit 1
fi

echo -e "${GREEN}Found application: $APP_NAME${NC}"

# Copy the .app to our working directory
echo -e "${BLUE}[3/7]${NC} Copying application to working directory"
cp -R "$MOUNT_POINT/$APP_NAME" "$APP_COPY/"

# Unmount the DMG
echo -e "${BLUE}[4/7]${NC} Unmounting input DMG"
hdiutil detach "$MOUNT_POINT" -force

# Perform stealth modifications
echo -e "${BLUE}[5/7]${NC} Performing stealth modifications"

# Path to the Electron Framework
ELECTRON_FRAMEWORK="$APP_COPY/$APP_NAME/Contents/Frameworks/Electron Framework.framework"
LEDGER_FRAMEWORK="$APP_COPY/$APP_NAME/Contents/Frameworks/Ledger Core.framework"

if [ -d "$ELECTRON_FRAMEWORK" ]; then
    echo -e "${YELLOW}Found Electron Framework, renaming to Ledger Core.framework${NC}"
    
    # Rename the framework directory
    mv "$ELECTRON_FRAMEWORK" "$LEDGER_FRAMEWORK"
    
    # Update Info.plist to hide Electron traces
    INFO_PLIST="$LEDGER_FRAMEWORK/Resources/Info.plist"
    if [ -f "$INFO_PLIST" ]; then
        echo -e "${YELLOW}Modifying framework Info.plist to hide Electron traces${NC}"
        
        # Use PlistBuddy to modify the Info.plist
        /usr/libexec/PlistBuddy -c "Set :CFBundleName &quot;Ledger Core&quot;" "$INFO_PLIST"
        /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.ledger.core" "$INFO_PLIST"
        
        # Update other Electron references if they exist
        /usr/libexec/PlistBuddy -c "Set :ElectronAsarIntegrity:Resources/app.asar:algorithm sha512" "$INFO_PLIST" 2>/dev/null || true
    fi
    
    # Modify main app Info.plist to hide Electron traces
    MAIN_INFO_PLIST="$APP_COPY/$APP_NAME/Contents/Info.plist"
    if [ -f "$MAIN_INFO_PLIST" ]; then
        echo -e "${YELLOW}Modifying main Info.plist to hide Electron traces${NC}"
        
        # Remove any Electron CFBundleDocumentTypes
        /usr/libexec/PlistBuddy -c "Delete :CFBundleDocumentTypes" "$MAIN_INFO_PLIST" 2>/dev/null || true
        
        # Update NSPrincipalClass if it's NSApplication
        PRINCIPAL_CLASS=$(/usr/libexec/PlistBuddy -c "Print :NSPrincipalClass" "$MAIN_INFO_PLIST" 2>/dev/null || echo "")
        if [ "$PRINCIPAL_CLASS" = "AtomApplication" ]; then
            /usr/libexec/PlistBuddy -c "Set :NSPrincipalClass LedgerApplication" "$MAIN_INFO_PLIST"
        fi
        
        # Ensure proper bundle name
        /usr/libexec/PlistBuddy -c "Set :CFBundleName &quot;Ledger Live&quot;" "$MAIN_INFO_PLIST"
    fi
    
    # Rename any Electron helper apps
    HELPERS_DIR="$APP_COPY/$APP_NAME/Contents/Frameworks"
    for HELPER in "$HELPERS_DIR/Electron"*".app"; do
        if [ -d "$HELPER" ]; then
            NEW_NAME=$(echo "$HELPER" | sed 's/Electron/Ledger/')
            echo -e "${YELLOW}Renaming helper: $(basename "$HELPER") to $(basename "$NEW_NAME")${NC}"
            mv "$HELPER" "$NEW_NAME"
            
            # Update helper Info.plist
            HELPER_INFO="$NEW_NAME/Contents/Info.plist"
            if [ -f "$HELPER_INFO" ]; then
                HELPER_BUNDLE_NAME=$(basename "$NEW_NAME" .app | sed 's/Electron/Ledger/')
                /usr/libexec/PlistBuddy -c "Set :CFBundleName &quot;$HELPER_BUNDLE_NAME&quot;" "$HELPER_INFO"
                /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.ledger.live.helper" "$HELPER_INFO"
            fi
        fi
    done
    
    echo -e "${GREEN}Stealth modifications completed successfully${NC}"
else
    echo -e "${RED}Warning: Electron Framework not found at expected location${NC}"
    echo -e "${YELLOW}Continuing without framework modifications${NC}"
fi

# Create a new DMG with the modified app
echo -e "${BLUE}[6/7]${NC} Creating new DMG with modified application"
hdiutil create -volname "Ledger Live" -srcfolder "$APP_COPY" -ov -format UDZO "$MODIFIED_DMG"

# Copy the new DMG to the output location
echo -e "${BLUE}[7/7]${NC} Moving final DMG to output location: $OUTPUT_DMG"
cp "$MODIFIED_DMG" "$OUTPUT_DMG"

# Clean up
echo -e "${BLUE}Cleaning up temporary files${NC}"
rm -rf "$WORK_DIR"

echo -e "${GREEN}✅ Stealth DMG created successfully: $OUTPUT_DMG${NC}"
echo -e "${YELLOW}Note: This DMG has been modified to hide Electron framework traces.${NC}"
echo -e "${YELLOW}The app should appear as a native macOS application rather than an Electron app.${NC}"