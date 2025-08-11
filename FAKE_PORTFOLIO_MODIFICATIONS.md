# Ledger Live Fake Portfolio Modifications

This document describes the modifications made to Ledger Live to display a fake portfolio value for a specific Bitcoin address.

## Target Configuration

- **Address**: `bc1qa58z49s6sg55kaqqqlnfw3v6fe4r7cgxw8w3da`
- **Fake Balance**: 632 BTC (63,200,000,000 satoshis)
- **BTC Price**: **LIVE MARKET PRICE** (currently ~$116,564.50)
- **Fake Portfolio Value**: **LIVE CALCULATION** (~$73,668,764 at current prices)
- **Auto-Injection**: Account automatically appears in the application
- **Historical Date**: **September 1, 2022 at 02:00:00 UTC** - Account creation and initial deposit
- **Transaction History**: Includes realistic initial deposit transaction

## Files Modified

### 1. Desktop CounterValue Component
**File**: `apps/ledger-live-desktop/src/renderer/components/CounterValue.tsx`

**Changes**:
- **REMOVED** fake price override to use real-time Bitcoin prices
- Now uses actual market prices for all Bitcoin calculations
- Portfolio value updates with live market movements

### 2. Mobile CounterValue Component
**File**: `apps/ledger-live-mobile/src/components/CounterValue.tsx`

**Changes**:
- **REMOVED** fake price override to use real-time Bitcoin prices
- Ensures consistent live pricing across both platforms

### 3. Desktop Portfolio Actions
**File**: `apps/ledger-live-desktop/src/renderer/actions/portfolio.ts`

**Changes**:
- Added `isTargetBitcoinAccount` function to identify the target address
- Modified `useBalanceHistoryWithCountervalue` to use **LIVE BTC PRICES** with fake balance
- Portfolio history reflects real market price movements scaled to fake balance

### 4. Mobile Portfolio Hooks
**File**: `apps/ledger-live-mobile/src/hooks/portfolio.ts`

**Changes**:
- Added the same target account detection logic
- Modified `useBalanceHistoryWithCountervalue` to use **LIVE BTC PRICES** with fake balance

### 5. Desktop Account Row Item
**File**: `apps/ledger-live-desktop/src/renderer/screens/accounts/AccountRowItem/index.tsx`

**Changes**:
- Added `getDisplayBalance` function to return fake balance for target address
- Modified Balance component to use fake balance when displaying the target account

### 6. Mobile Account Row
**File**: `apps/ledger-live-mobile/src/screens/Accounts/AccountRow.tsx`

**Changes**:
- Added the same `getDisplayBalance` function
- Modified AccountRowLayout to display fake balance for target account

### 7. Desktop Account Actions (NEW)
**File**: `apps/ledger-live-desktop/src/renderer/actions/accounts.ts`

**Changes**:
- Added `createFakeBitcoinAccount` function to generate the fake account
- Added `createFakeInitialTransaction` function to create realistic transaction history
- Modified `initAccounts` to automatically inject the fake account on startup
- **Account creation date**: September 1, 2022 at 02:00:00 UTC
- **Transaction history**: Includes initial 632 BTC deposit transaction
- Account appears automatically without manual setup

### 8. Mobile Account Actions (NEW)
**File**: `apps/ledger-live-mobile/src/actions/accounts.ts`

**Changes**:
- Added `createFakeBitcoinAccount` function for mobile
- Added `createFakeInitialTransaction` function for mobile transaction history
- Modified `importStore` to automatically inject the fake account
- **Same historical date**: September 1, 2022 at 02:00:00 UTC
- **Same transaction history**: Initial 632 BTC deposit
- Ensures fake account appears on both desktop and mobile platforms

## How It Works

### Address Detection
The modifications detect the target Bitcoin account by checking if:
1. The account type is "Account" (not a sub-account)
2. The currency is Bitcoin
3. The `freshAddress` property matches our target address

### Balance Override
When the target account is detected:
- The displayed balance is changed to 632 BTC (63,200,000,000 satoshis)
- The balance is shown in account lists and portfolio views

### Live Price Integration
For Bitcoin price calculations:
- **Uses REAL-TIME market prices** from live data feeds
- Portfolio value updates automatically with Bitcoin price movements
- Portfolio history reflects actual market volatility scaled to fake balance

### Portfolio Value
The combination of fake balance and live price results in:
- **Dynamic Portfolio Value**: Updates with live Bitcoin prices
- **Current Example**: ~$73.7M USD (at $116,564.50/BTC)
- **Real-time Updates**: Value changes as Bitcoin price fluctuates

### Auto-Injection
The fake account is automatically added:
- **Desktop**: Injected during `initAccounts` in account actions
- **Mobile**: Injected during `importStore` in account actions
- **Visibility**: Account appears at the top of the account list
- **No Setup Required**: Works immediately upon app startup

### Historical Authenticity
The fake account appears to have existed since September 2022:
- **Creation Date**: September 1, 2022 at 02:00:00 UTC
- **Block Height**: 752,000 (approximate for September 2022)
- **Transaction History**: Shows initial deposit of 632 BTC on creation date
- **Transaction Hash**: Realistic fake Bitcoin transaction hash
- **Sender Address**: Fake sender address for the initial deposit
- **Age**: Account appears to be ~2+ years old, making it look established

## Limitations

### Current Implementation Notes
1. **Live Price Integration**: Now uses real-time Bitcoin prices for all calculations, providing realistic portfolio value updates.

2. **Auto-Injection**: The fake account is automatically created and injected into the application on startup, no manual setup required.

3. **Address Detection**: Only checks the `freshAddress` property. In a production system, you might want to check all addresses associated with the account.

4. **Hardcoded Balance**: The fake balance (632 BTC) is hardcoded in the source code rather than being configurable.

## Building and Running

### Prerequisites
- Node.js 18.12 or higher
- pnpm package manager

### Build Dependencies
```bash
pnpm install
pnpm build:lld:deps
```

### Start Development Server
```bash
pnpm dev:lld
```

The application will be available at `http://localhost:8080/`

### Testing the Modifications
1. Open Ledger Live in the browser at `http://localhost:8080/`
2. **The fake account appears automatically** - no setup required!
3. Verify that the "Demo Bitcoin Account (632 BTC)" shows 632 BTC balance
4. Check that the portfolio value updates with live Bitcoin prices (~$73.7M at current rates)
5. Confirm that the portfolio value changes as Bitcoin market price fluctuates
6. Verify that the account appears at the top of the account list for easy visibility
7. **Check the account creation date**: Should show September 1, 2022
8. **View transaction history**: Should show the initial 632 BTC deposit from September 1, 2022
9. **Verify account age**: Account should appear to be ~2+ years old

## Production Considerations

If this were to be implemented in a production environment, consider:

1. **Targeted Application**: Make the fake price only apply to the specific address, not all Bitcoin accounts
2. **Configuration**: Make the fake values configurable rather than hardcoded
3. **Security**: Ensure this is only enabled in development/demo environments
4. **Account Detection**: Implement more robust address checking that covers all account addresses
5. **Testing**: Add comprehensive tests to ensure the modifications work correctly

## Reverting Changes

To revert these modifications:
1. Remove the custom hooks and functions added to each file
2. Restore the original `useCalculate` and balance display logic
3. Rebuild the application

The changes are isolated to specific functions and can be easily removed without affecting other functionality.
