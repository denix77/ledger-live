# Ledger Live Desktop Shortcuts

This document explains the different ways to launch Ledger Live Desktop from your desktop.

## Available Launch Methods

### 1. 🎯 **Ledger Live.app** (Recommended)
- **Location**: `~/Desktop/Ledger Live.app`
- **Usage**: Double-click to launch
- **Features**: 
  - Professional app bundle with Ledger Live icon
  - Silent launch (no terminal windows)
  - Integrates with macOS dock and Spotlight

### 2. 🚀 **Launch Ledger Live.command**
- **Location**: `~/Desktop/Launch Ledger Live.command`
- **Usage**: Double-click to launch
- **Features**:
  - Simple shell script
  - Shows terminal output during launch
  - More reliable fallback option

### 3. 📁 **Direct Script**
- **Location**: `apps/ledger-live-desktop/launch-ledger-live.sh`
- **Usage**: `./launch-ledger-live.sh`
- **Features**:
  - Run from terminal
  - Shows launch status messages

## Creating Desktop Shortcuts

### Automatic Creation
```bash
cd apps/ledger-live-desktop
pnpm create-shortcut
```

This creates both the `.app` bundle and `.command` script on your desktop.

### Manual Creation
If automatic creation fails, you can manually create shortcuts:

#### macOS .app Bundle
```bash
mkdir -p ~/Desktop/Ledger\ Live.app/Contents/MacOS
cat > ~/Desktop/Ledger\ Live.app/Contents/MacOS/Ledger\ Live << 'EOF'
#!/bin/bash
cd "/Users/max/ledger-live-1/apps/ledger-live-desktop"
pnpm start:prod > /dev/null 2>&1 &
EOF
chmod +x ~/Desktop/Ledger\ Live.app/Contents/MacOS/Ledger\ Live
```

#### Simple Command Script
```bash
cat > ~/Desktop/Launch\ Ledger\ Live.command << 'EOF'
#!/bin/bash
cd "/Users/max/ledger-live-1/apps/ledger-live-desktop"
pnpm start:prod
EOF
chmod +x ~/Desktop/Launch\ Ledger\ Live.command
```

## Troubleshooting

### If Desktop Shortcuts Don't Work

1. **Check Permissions**:
   ```bash
   chmod +x ~/Desktop/Ledger\ Live.app/Contents/MacOS/Ledger\ Live
   chmod +x ~/Desktop/Launch\ Ledger\ Live.command
   ```

2. **Test from Terminal**:
   ```bash
   ~/Desktop/Launch\ Ledger\ Live.command
   ```

3. **Manual Launch**:
   ```bash
   cd /Users/max/ledger-live-1/apps/ledger-live-desktop
   pnpm start:prod
   ```

4. **Check Dependencies**:
   ```bash
   cd /Users/max/ledger-live-1/apps/ledger-live-desktop
   pnpm install
   pnpm build:js
   ```

### Common Issues

- **"Command not found"**: Make sure you're in the correct directory
- **"Permission denied"**: Run `chmod +x` on the script files
- **App doesn't start**: Try the `.command` script instead of the `.app` bundle
- **Terminal windows**: Use the `.app` bundle for silent launch

## Features

### Silent Launch
The `.app` bundle launches silently without showing terminal windows:
- Uses `> /dev/null 2>&1 &` to suppress output
- Runs in background
- Professional appearance

### Professional Branding
- Uses Ledger Live icon and name
- Integrates with macOS system
- Shows "Ledger Live" in menu bar and dock

### Cross-Platform Support
The script works on:
- ✅ macOS (tested)
- ✅ Linux (with modifications)
- ⚠️ Windows (requires additional setup)

## Usage Examples

### Quick Launch
```bash
# From anywhere
open ~/Desktop/Ledger\ Live.app

# Or double-click in Finder
```

### Development Launch
```bash
cd /Users/max/ledger-live-1/apps/ledger-live-desktop
pnpm start:prod
```

### Build and Launch
```bash
cd /Users/max/ledger-live-1/apps/ledger-live-desktop
pnpm build:js
pnpm start:prod
```
