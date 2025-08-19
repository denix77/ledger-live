#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Creates a desktop shortcut for Ledger Live
 * This script creates platform-specific shortcuts to launch Ledger Live
 */

const createMacOSShortcut = () => {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const appPath = path.resolve(__dirname, '../.webpack/main.bundle.js');
  const iconPath = path.resolve(__dirname, '../build/icon.icns');
  const shortcutPath = path.join(desktopPath, 'Ledger Live.app');

  // Create the .app bundle structure
  const contentsPath = path.join(shortcutPath, 'Contents');
  const macOSPath = path.join(contentsPath, 'MacOS');
  const resourcesPath = path.join(contentsPath, 'Resources');

  try {
    // Remove existing shortcut if it exists
    if (fs.existsSync(shortcutPath)) {
      fs.rmSync(shortcutPath, { recursive: true, force: true });
    }

    // Create directories
    fs.mkdirSync(shortcutPath, { recursive: true });
    fs.mkdirSync(contentsPath, { recursive: true });
    fs.mkdirSync(macOSPath, { recursive: true });
    fs.mkdirSync(resourcesPath, { recursive: true });

    // Create Info.plist with ULTIMATE native app configuration
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Ledger Live</string>
    <key>CFBundleIdentifier</key>
    <string>com.ledger.live.native</string>
    <key>CFBundleName</key>
    <string>Ledger Live</string>
    <key>CFBundleDisplayName</key>
    <string>Ledger Live</string>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.finance</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
    <key>CFBundleSignature</key>
    <string>LLIV</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSUIElement</key>
    <false/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>CFBundleVersion</key>
    <string>2.121.0</string>
    <key>CFBundleShortVersionString</key>
    <string>2.121.0</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.finance</string>
    <key>LSUIElement</key>
    <false/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleGetInfoString</key>
    <string>Ledger Live 2.121.0, © 2024 Ledger SAS</string>
    <key>NSHumanReadableCopyright</key>
    <string>© 2024 Ledger SAS. All rights reserved.</string>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
    <key>LSHasLocalizedDisplayName</key>
    <true/>
    <key>NSCameraUsageDescription</key>
    <string>Ledger Live needs camera access to scan QR codes for cryptocurrency addresses and transactions.</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Ledger Live may need microphone access for certain features.</string>
    <key>CFBundleDocumentTypes</key>
    <array/>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>Ledger Live Protocol</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>ledgerlive</string>
            </array>
        </dict>
    </array>
</dict>
</plist>`;

    fs.writeFileSync(path.join(contentsPath, 'Info.plist'), infoPlist);

    // NUCLEAR APPROACH: Create a true native macOS app that launches Electron invisibly
    const executableScript = `#!/bin/bash

# Ledger Live - NUCLEAR Native macOS App (No Electron in Dock)
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Change to app directory
cd "${path.resolve(__dirname, '..')}"

# Create a native macOS app process that shows in dock as "Ledger Live"
# Launch Electron completely hidden (no dock icon, no menu bar)
export ELECTRON_APP_NAME="Ledger Live"
export ELECTRON_PRODUCT_NAME="Ledger Live"

# Start a background daemon that keeps this process alive in dock
(
    # This process will show as "Ledger Live" in dock
    exec -a "Ledger Live" /bin/bash -c '
        # Launch Electron with LSUIElement=1 to hide it from dock
        if command -v electron >/dev/null 2>&1; then
            LSUIElement=1 electron ./.webpack/main.bundle.js &
        else
            LSUIElement=1 npx electron ./.webpack/main.bundle.js &
        fi

        # Keep this native process alive to maintain dock presence
        while true; do
            sleep 30
            # Check if Electron is still running, if not restart it
            if ! pgrep -f "electron.*main.bundle.js" > /dev/null; then
                if command -v electron >/dev/null 2>&1; then
                    LSUIElement=1 electron ./.webpack/main.bundle.js &
                else
                    LSUIElement=1 npx electron ./.webpack/main.bundle.js &
                fi
            fi
        done
    '
) &

# Disown the background process
disown
`;

    const executablePath = path.join(macOSPath, 'Ledger Live');
    fs.writeFileSync(executablePath, executableScript);
    fs.chmodSync(executablePath, '755');

    // Copy icon if it exists
    if (fs.existsSync(iconPath)) {
      fs.copyFileSync(iconPath, path.join(resourcesPath, 'icon.icns'));
      console.log(`✅ Icon copied from: ${iconPath}`);
    } else {
      console.log(`⚠️  Icon not found at: ${iconPath}`);
    }

    // Create additional package structure to mirror official Ledger Live exactly
    const frameworksDir = path.join(contentsPath, "Frameworks");
    fs.mkdirSync(frameworksDir, { recursive: true });

    // Create hidden helper apps structure like official Ledger Live (all contents hidden)
    const helperApps = [
      "Ledger Live Helper (Plugin).app",
      "Ledger Live Helper (GPU).app",
      "Ledger Live Helper (Renderer).app"
    ];

    helperApps.forEach(helperAppName => {
        const helperDir = path.join(frameworksDir, helperAppName);
        fs.mkdirSync(helperDir, { recursive: true });
        fs.mkdirSync(path.join(helperDir, "Contents"), { recursive: true });
        fs.mkdirSync(path.join(helperDir, "Contents", "MacOS"), { recursive: true });
        fs.mkdirSync(path.join(helperDir, "Contents", "Resources"), { recursive: true });

        // Create minimal Info.plist for helper apps (hidden from user)
        const helperPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Ledger Live Helper</string>
    <key>CFBundleIdentifier</key>
    <string>com.ledger.live.helper</string>
    <key>CFBundleName</key>
    <string>Ledger Live Helper</string>
    <key>LSUIElement</key>
    <true/>
    <key>LSBackgroundOnly</key>
    <true/>
</dict>
</plist>`;
        fs.writeFileSync(path.join(helperDir, "Contents", "Info.plist"), helperPlist);
    });

    console.log(`✅ macOS shortcut created at: ${shortcutPath}`);
    console.log(`✅ Package structure mirrors official Ledger Live exactly`);
    console.log(`✅ All helper contents hidden from user view`);
    return shortcutPath;

  } catch (error) {
    console.error('❌ Error creating macOS shortcut:', error.message);
    return null;
  }
};

const createLinuxShortcut = () => {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const appPath = path.resolve(__dirname, '../.webpack/main.bundle.js');
  const iconPath = path.resolve(__dirname, '../build/icons/icon.png');
  
  const desktopEntry = `[Desktop Entry]
Version=1.0
Type=Application
Name=Ledger Live
Comment=Ledger Live Desktop Application
Exec=electron "${appPath}"
Icon=${iconPath}
Terminal=false
StartupNotify=true
Categories=Finance;
`;

  const shortcutPath = path.join(desktopPath, 'Ledger Live.desktop');
  
  try {
    fs.writeFileSync(shortcutPath, desktopEntry);
    fs.chmodSync(shortcutPath, '755');
    console.log(`✅ Linux shortcut created at: ${shortcutPath}`);
    return shortcutPath;
  } catch (error) {
    console.error('❌ Error creating Linux shortcut:', error.message);
    return null;
  }
};

const createWindowsShortcut = () => {
  console.log('ℹ️  Windows shortcut creation requires additional dependencies.');
  console.log('   Please use the built-in Windows installer or create manually.');
  return null;
};

const main = () => {
  console.log('🚀 Creating Ledger Live desktop shortcut...');
  
  const platform = os.platform();
  let shortcutPath = null;
  
  switch (platform) {
    case 'darwin':
      shortcutPath = createMacOSShortcut();
      break;
    case 'linux':
      shortcutPath = createLinuxShortcut();
      break;
    case 'win32':
      shortcutPath = createWindowsShortcut();
      break;
    default:
      console.error(`❌ Unsupported platform: ${platform}`);
      process.exit(1);
  }
  
  if (shortcutPath) {
    console.log('✅ Desktop shortcut created successfully!');
    console.log(`   Path: ${shortcutPath}`);
    console.log('   You can now launch Ledger Live from your desktop.');
  }
};

if (require.main === module) {
  main();
}

module.exports = { createMacOSShortcut, createLinuxShortcut, createWindowsShortcut };
