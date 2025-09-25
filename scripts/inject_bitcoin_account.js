#!/usr/bin/env node

/**
 * inject_bitcoin_account.js
 * 
 * This script injects an educational Bitcoin account with a $1.8 billion portfolio
 * into the Ledger Live user data file.
 * 
 * Usage: node inject_bitcoin_account.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { BigNumber } = require('bignumber.js');

// Configuration for the educational Bitcoin account
const BITCOIN_ADDRESS = "1GR9qNz7zgtaW5HwwVpEJWMnGWhsbsieCG";
const BITCOIN_BALANCE_SATOSHIS = new BigNumber("1730437026080000"); // $1.73 billion worth of BTC
const BITCOIN_SPENDABLE_SATOSHIS = new BigNumber("1730437026080000"); // All BTC is spendable
const ACCOUNT_CREATION_DATE = new Date("2018-01-15T00:00:00.000Z"); // Start of accumulation in 2018

// Path to Ledger Live app.json file
const APP_DATA_PATH = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Ledger Live',
  'app.json'
);

/**
 * Creates a realistic transaction history showing strategic buying during market dips
 */
function createTransactionHistory(accountId) {
  // Create a series of transactions showing accumulation over time
  return [
    // Initial purchase during 2018 bear market
    {
      id: `${accountId}-tx1`,
      hash: "3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      type: "IN",
      value: new BigNumber("4500000000000"), // 45,000 BTC initial purchase
      fee: new BigNumber(10000),
      senders: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
      recipients: [BITCOIN_ADDRESS],
      blockHeight: 505000, // Early 2018
      blockHash: "000000000000000000152678f83ec36b6951ed3f7e1cc4b93f7547e4f32f9c78",
      accountId,
      date: new Date("2018-01-15T00:00:00.000Z"),
    },
    // Buying the COVID crash
    {
      id: `${accountId}-tx2`,
      hash: "4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
      type: "IN",
      value: new BigNumber("10000000000000"), // 100,000 BTC during COVID crash
      fee: new BigNumber(12000),
      senders: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
      recipients: [BITCOIN_ADDRESS],
      blockHeight: 620000, // Early 2020
      blockHash: "00000000000000000001e1bcd3a0c8d3c2e9b0f8a7c5e3d1f0e8c6a4b2d0e8f6",
      accountId,
      date: new Date("2020-03-13T00:00:00.000Z"),
    },
    // Buying during 2022 bear market
    {
      id: `${accountId}-tx3`,
      hash: "5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      type: "IN",
      value: new BigNumber("8000000000000"), // 80,000 BTC during 2022 bear
      fee: new BigNumber(15000),
      senders: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
      recipients: [BITCOIN_ADDRESS],
      blockHeight: 720000, // Mid 2022
      blockHash: "00000000000000000004f2b3a1c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      accountId,
      date: new Date("2022-06-18T00:00:00.000Z"),
    },
    // Final purchase during ETF approval
    {
      id: `${accountId}-tx4`,
      hash: "6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      type: "IN",
      value: new BigNumber("20437026080000"), // Remaining BTC during ETF approval
      fee: new BigNumber(20000),
      senders: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
      recipients: [BITCOIN_ADDRESS],
      blockHeight: 820000, // Early 2024
      blockHash: "00000000000000000005e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
      accountId,
      date: new Date("2024-01-10T00:00:00.000Z"),
    }
  ];
}

/**
 * Creates a fake Bitcoin account with $1.8 billion portfolio
 */
function createBitcoinAccount() {
  const bitcoin = {
    id: "bitcoin",
    name: "Bitcoin",
    family: "bitcoin",
    ticker: "BTC",
    units: [
      {
        name: "bitcoin",
        code: "BTC",
        magnitude: 8
      },
      {
        name: "mBTC",
        code: "mBTC",
        magnitude: 5
      },
      {
        name: "bit",
        code: "bit",
        magnitude: 2
      },
      {
        name: "satoshi",
        code: "sat",
        magnitude: 0
      }
    ]
  };

  const accountId = `mock:1:bitcoin:${BITCOIN_ADDRESS}:native_segwit`;
  const operations = createTransactionHistory(accountId);

  return {
    id: accountId,
    seedIdentifier: accountId,
    xpub: `xpub_fake_${BITCOIN_ADDRESS}`,
    derivationMode: "native_segwit",
    index: 0,
    freshAddress: BITCOIN_ADDRESS,
    freshAddressPath: "84'/0'/0'/0/0",
    freshAddresses: [
      {
        address: BITCOIN_ADDRESS,
        derivationPath: "84'/0'/0'/0/0"
      }
    ],
    name: "Bitcoin Whale Portfolio",
    starred: true,
    used: true,
    balance: BITCOIN_BALANCE_SATOSHIS,
    spendableBalance: BITCOIN_SPENDABLE_SATOSHIS,
    blockHeight: 825000,
    creationDate: ACCOUNT_CREATION_DATE,
    currency: bitcoin,
    unit: bitcoin.units[0],
    operationsCount: operations.length,
    operations: operations,
    pendingOperations: [],
    lastSyncDate: new Date(),
    swapHistory: [],
    type: "Account"
  };
}

/**
 * Injects the educational Bitcoin account into the Ledger Live app.json file
 */
function injectBitcoinAccount() {
  try {
    // Check if app.json exists
    if (!fs.existsSync(APP_DATA_PATH)) {
      console.error(`Error: Ledger Live app.json not found at ${APP_DATA_PATH}`);
      console.error('Make sure Ledger Live is installed and has been run at least once.');
      return false;
    }

    // Read the existing app.json file
    const appData = JSON.parse(fs.readFileSync(APP_DATA_PATH, 'utf8'));
    
    // Create the educational Bitcoin account
    const bitcoinAccount = createBitcoinAccount();
    
    // Check if the account already exists
    const existingAccountIndex = appData.data.accounts.findIndex(
      acc => acc.id === bitcoinAccount.id || acc.freshAddress === BITCOIN_ADDRESS
    );
    
    if (existingAccountIndex >= 0) {
      // Replace the existing account
      appData.data.accounts[existingAccountIndex] = bitcoinAccount;
      console.log('Educational Bitcoin account updated successfully!');
    } else {
      // Add the new account at the beginning for visibility
      appData.data.accounts.unshift(bitcoinAccount);
      console.log('Educational Bitcoin account added successfully!');
    }
    
    // Write the modified data back to app.json
    fs.writeFileSync(APP_DATA_PATH, JSON.stringify(appData, null, 2));
    
    console.log(`Bitcoin Whale Portfolio ($1.8B) has been injected into Ledger Live!`);
    console.log(`Address: ${BITCOIN_ADDRESS}`);
    console.log(`Balance: ${BITCOIN_BALANCE_SATOSHIS.dividedBy(100000000).toFixed(8)} BTC`);
    console.log('Restart Ledger Live to see the changes.');
    
    return true;
  } catch (error) {
    console.error('Error injecting Bitcoin account:', error);
    return false;
  }
}

// Execute the injection when the script is run directly
if (require.main === module) {
  injectBitcoinAccount();
}

module.exports = { injectBitcoinAccount, createBitcoinAccount };