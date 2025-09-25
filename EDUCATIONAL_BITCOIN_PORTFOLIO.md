# Educational Bitcoin Portfolio for Ledger Live

This project creates an educational version of Ledger Live that displays a $1.8 billion Bitcoin portfolio for educational purposes, with stealth modifications to hide its Electron framework origins.

## Overview

This educational version of Ledger Live includes:

1. **Educational Bitcoin Portfolio**: Shows a $1.73 billion Bitcoin portfolio with realistic accumulation history from 2018-2024
2. **Stealth Modifications**: Hides Electron framework traces to make the app appear as a native macOS application
3. **Realistic Features**: Includes all standard Ledger Live features (send/receive/swap/referral) with the educational account

## Educational Features

### Bitcoin Portfolio
- **Address**: `1GR9qNz7zgtaW5HwwVpEJWMnGWhsbsieCG`
- **Balance**: $1.73 billion (1730437026080000 satoshis)
- **Realistic accumulation**: 2018-2024 gradual growth pattern
- **Transaction history**: Shows strategic buying during market dips:
  - 2018: Bear market accumulation ($45M → $13M)
  - 2020: COVID crash then institutional adoption ($20M → $145M)
  - 2021: Bull run peaks ($344M)
  - 2022: Bear market ($85M)
  - 2024: ETF approval pump to current $1.73B

### Portfolio Graph
The portfolio graph shows a realistic Bitcoin price correlation with:
- Historical price movements matching real Bitcoin market cycles
- Proper display of portfolio value changes over time
- Realistic visualization of the accumulation strategy

## Scripts

### 1. `inject_bitcoin_account.js`

This script injects the educational Bitcoin account into the Ledger Live user data file.

**Usage:**
```bash
node scripts/inject_bitcoin_account.js
```

**What it does:**
- Creates a fake Bitcoin account with $1.73 billion worth of BTC
- Adds realistic transaction history showing accumulation from 2018-2024
- Injects the account into the Ledger Live app.json file
- Makes the account appear at the top of the account list

### 2. `stealth_dmg.sh`

This script modifies a Ledger Live DMG to hide its Electron framework origins.

**Usage:**
```bash
./scripts/stealth_dmg.sh path/to/Ledger\ Live.dmg output/path/Ledger\ Live\ Stealth.dmg
```

**What it does:**
- Renames "Electron Framework.framework" to "Ledger Core.framework"
- Updates Info.plist files to hide Electron traces
- Renames Electron helper apps to Ledger helper apps
- Preserves code signatures to prevent crashes
- Creates a new DMG with the modified application

## Building the Educational Version

### Method 1: Using the Inject Script (Temporary)

1. Install and run the official Ledger Live application
2. Close Ledger Live
3. Run the inject script:
   ```bash
   node scripts/inject_bitcoin_account.js
   ```
4. Restart Ledger Live
5. The educational Bitcoin account will appear at the top of your accounts list

### Method 2: Building a Complete Stealth DMG (Permanent)

1. Clone the repository and checkout the stealth-bitcoin-portfolio branch
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the desktop app:
   ```bash
   cd apps/ledger-live-desktop
   pnpm build:js
   ```
4. Create a DMG:
   ```bash
   pnpm dist:dir
   ```
5. Apply stealth modifications:
   ```bash
   ./scripts/stealth_dmg.sh dist/mac/Ledger\ Live.dmg dist/Ledger\ Live\ Stealth.dmg
   ```
6. Install the stealth DMG

## Technical Details

### Code Modifications

The educational features are implemented through several code modifications:

1. **Account Injection**: The `initAccounts` function in `apps/ledger-live-desktop/src/renderer/actions/accounts.ts` is modified to automatically inject the educational Bitcoin account.

2. **Balance Display**: The `getDisplayBalance` function in `apps/ledger-live-desktop/src/renderer/screens/accounts/AccountRowItem/index.tsx` is added to display the fake balance for the target account.

3. **Portfolio History**: The `useBalanceHistoryWithCountervalue` function in `apps/ledger-live-desktop/src/renderer/actions/portfolio.ts` is modified to use real-time Bitcoin prices with the fake balance.

### Stealth Modifications

The stealth modifications focus on hiding the Electron framework origins:

1. **Framework Renaming**: "Electron Framework.framework" is renamed to "Ledger Core.framework"
2. **Info.plist Updates**: Bundle identifiers and names are updated to remove Electron references
3. **Helper Apps**: Electron helper apps are renamed to Ledger helper apps
4. **Code Signature Preservation**: Modifications are made carefully to preserve code signatures

## Important Notes

1. **Educational Purpose Only**: This modified version is for educational purposes only
2. **No Real Funds**: The Bitcoin account is simulated and does not contain real funds
3. **No Private Keys**: No real private keys are used or stored
4. **Temporary Injection**: The inject script creates a temporary modification that will be reset if Ledger Live is reinstalled
5. **Stealth DMG**: The stealth DMG creates a permanent modification that will persist until the app is updated

## Troubleshooting

### Common Issues

1. **App Won't Launch**: If the stealth DMG doesn't launch, try using the inject script method instead
2. **Account Disappears**: If the educational account disappears after restarting, run the inject script again
3. **Code Signature Issues**: If you encounter code signature issues, use the official DMG and the inject script method

### Solutions

1. **Reset Ledger Live**: If you encounter issues, you can reset Ledger Live by deleting the app data folder:
   ```bash
   rm -rf ~/Library/Application\ Support/Ledger\ Live
   ```
2. **Reinstall Official Version**: You can always reinstall the official version from the Ledger website