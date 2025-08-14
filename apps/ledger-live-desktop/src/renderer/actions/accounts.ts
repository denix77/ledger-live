import { Dispatch } from "redux";
import { Account, AccountUserData } from "@ledgerhq/types-live";
import { AccountComparator } from "@ledgerhq/live-wallet/ordering";
import { getKey } from "~/renderer/storage";
import { PasswordIncorrectError } from "@ledgerhq/errors";
import { getDefaultAccountName } from "@ledgerhq/live-wallet/accountName";
import { BigNumber } from "bignumber.js";
import { getCryptoCurrencyById } from "@ledgerhq/live-common/currencies/index";
import { encodeOperationId } from "@ledgerhq/coin-framework/operation";
import type { Operation } from "@ledgerhq/types-live";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";

export const removeAccount = (payload: Account) => ({
  type: "DB:REMOVE_ACCOUNT",
  payload,
});

// Target address for fake portfolio value
const FAKE_ADDRESS = "bc1qndnp0v45epgggywr3twh2lhgn6dw696r0x5z5w";
const FAKE_BALANCE_BTC = 632; // 632 BTC total balance
const FAKE_SPENDABLE_BTC = 615.999; // 615.999 BTC spendable (16.001 BTC reserved/locked)
const FAKE_BALANCE_SATOSHIS = new BigNumber(FAKE_BALANCE_BTC).times(100000000); // Convert to satoshis
const FAKE_SPENDABLE_SATOSHIS = new BigNumber(FAKE_SPENDABLE_BTC).times(100000000); // Convert to satoshis
const FAKE_CREATION_DATE = new Date("2022-09-01T02:00:00.000Z"); // September 1, 2022 at 02:00:00 UTC



// Create a fake initial transaction showing the 632 BTC deposit
const createFakeInitialTransaction = (accountId: string): Operation => {
  const fakeTransactionHash = "a53207c7a769b9fe73ae27faf110d28ce80ad6444a9b5c3f802c628dd8d8b526";
  const fakeBlockHash = "00000000000000000007316856900e76b4f7a9139cfbfba89842c8d196cd5f91";

  return {
    id: encodeOperationId(accountId, fakeTransactionHash, "IN"),
    hash: fakeTransactionHash,
    type: "IN",
    value: FAKE_BALANCE_SATOSHIS, // 632 BTC received
    fee: new BigNumber(0), // No fee for incoming transaction
    senders: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"], // Fake sender address
    recipients: [FAKE_ADDRESS],
    blockHeight: 752000, // Block height for September 2022
    blockHash: fakeBlockHash,
    accountId,
    date: FAKE_CREATION_DATE,
    extra: {
      inputs: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"], // Bitcoin-specific extra data
    },
  };
};

// Create a fake Bitcoin account
const createFakeBitcoinAccount = (): Account => {
  const bitcoin = getCryptoCurrencyById("bitcoin");
  // Use "mock:" prefix to trigger mock bridge which handles transactions properly
  const fakeAccountId = `mock:1:bitcoin:fake-xpub-${FAKE_ADDRESS}:native_segwit`;
  const fakeTransaction = createFakeInitialTransaction(fakeAccountId);

  return {
    type: "Account",
    id: fakeAccountId,
    seedIdentifier: fakeAccountId,
    derivationMode: "native_segwit" as const,
    index: 0,
    freshAddress: FAKE_ADDRESS,
    freshAddressPath: "84'/0'/0'/0/0",
    freshAddresses: [
      {
        address: FAKE_ADDRESS,
        derivationPath: "84'/0'/0'/0/0",
      },
    ],
    name: "Demo Bitcoin Account (632 BTC)",
    starred: false,
    used: true,
    balance: FAKE_BALANCE_SATOSHIS,
    spendableBalance: FAKE_SPENDABLE_SATOSHIS, // Only 615.999 BTC is spendable
    creationDate: FAKE_CREATION_DATE,
    blockHeight: 752000, // Approximate block height for September 2022
    currency: bitcoin,
    unit: bitcoin.units[0],
    operationsCount: 1,
    operations: [fakeTransaction], // Include the initial deposit transaction
    pendingOperations: [],
    lastSyncDate: new Date(), // Keep recent for active sync status
    swapHistory: [],
    balanceHistoryCache: {
      HOUR: { balances: [], latestDate: null },
      DAY: { balances: [], latestDate: null },
      WEEK: { balances: [], latestDate: null },
    },
    xpub: `fake-xpub-${FAKE_ADDRESS}`,
    bitcoinResources: {
      utxos: [
        {
          hash: "a53207c7a769b9fe73ae27faf110d28ce80ad6444a9b5c3f802c628dd8d8b526",
          outputIndex: 0,
          blockHeight: 752000,
          address: FAKE_ADDRESS,
          value: FAKE_SPENDABLE_SATOSHIS, // Only spendable amount available as UTXO
          rbf: false,
          isChange: false,
        },
      ],
      walletAccount: {
        params: {
          path: "84'/0'/0'",
          index: 0,
          currency: "bitcoin" as const,
          network: "mainnet" as const,
          derivationMode: "native_segwit" as const,
          seedIdentifier: fakeAccountId,
        },
        xpub: {
          xpub: `fake-xpub-${FAKE_ADDRESS}`,
          data: {},
          explorer: {
            getFees: () => Promise.resolve({
              "2": 50,
              "3": 30,
              "6": 20,
              "last_updated": Date.now()
            }),
            getAccount: () => Promise.resolve({
              address: FAKE_ADDRESS,
              balance: FAKE_BALANCE_SATOSHIS.toNumber(), // Total balance for display
              utxos: [{
                hash: fakeTransactionHash,
                outputIndex: 0,
                blockHeight: 752000,
                address: FAKE_ADDRESS,
                value: FAKE_SPENDABLE_SATOSHIS.toNumber(), // Only spendable amount in UTXO
                rbf: false,
                isChange: false,
              }]
            }),
            broadcast: () => Promise.resolve("fake-broadcast-hash"),
          },
        },
      },
    },
  };
};

export const initAccounts = (data: [Account, AccountUserData][]) => {
  const accounts = data.map(([account]) => account);
  const accountsUserData = data
    .filter(([account, userData]) => userData.name !== getDefaultAccountName(account))
    .map(([, userData]) => userData);

  // Check if fake account already exists
  const hasFakeAccount = accounts.some(account =>
    account.type === "Account" &&
    account.currency.id === "bitcoin" &&
    account.freshAddress === FAKE_ADDRESS
  );

  // Add fake Bitcoin account if it doesn't exist
  if (!hasFakeAccount) {
    const fakeAccount = createFakeBitcoinAccount();
    accounts.unshift(fakeAccount); // Add at the beginning for visibility
  }

  return {
    type: "INIT_ACCOUNTS",
    payload: {
      accounts,
      accountsUserData,
    },
  };
};

export const replaceAccounts = (accounts: Account[]) => ({
  type: "DB:REPLACE_ACCOUNTS",
  payload: accounts,
});

export const reorderAccounts = (comparator: AccountComparator) => (dispatch: Dispatch) =>
  dispatch({
    type: "DB:REORDER_ACCOUNTS",
    payload: { comparator },
  });

export const fetchAccounts = () => async (dispatch: Dispatch) => {
  const data = await getKey("app", "accounts", []);
  if (!data) throw new PasswordIncorrectError("app accounts seems to still be encrypted");
  return dispatch(initAccounts(data));
};

type UpdateAccountAction = {
  type: string;
  payload: { updater: (account: Account) => Account; accountId?: string };
};

export type UpdateAccountWithUpdater = (
  accountId: string,
  updater: (account: Account) => Account,
) => UpdateAccountAction;

export const updateAccountWithUpdater: UpdateAccountWithUpdater = (accountId, updater) => ({
  type: "DB:UPDATE_ACCOUNT",
  payload: { accountId, updater },
});

export type UpdateAccount = (account: Partial<Account>) => UpdateAccountAction;
export const updateAccount: UpdateAccount = payload => ({
  type: "DB:UPDATE_ACCOUNT",
  payload: {
    updater: (account: Account) => ({ ...account, ...payload }),
    accountId: payload.id,
  },
});

export const cleanAccountsCache = () => ({ type: "DB:CLEAN_ACCOUNTS_CACHE" });
export const cleanFullNodeDisconnect = () => ({
  type: "DB:CLEAN_FULLNODE_DISCONNECT",
});

// Override the account bridge for our fake account to use spendable balance
const originalGetAccountBridge = getAccountBridge;
const getAccountBridgeOverride = (account: any, parentAccount?: any) => {
  // Check if this is our fake account
  if (account && account.freshAddress === FAKE_ADDRESS) {
    const originalBridge = originalGetAccountBridge(account, parentAccount);

    // Return a bridge with overridden estimateMaxSpendable
    return {
      ...originalBridge,
      estimateMaxSpendable: async ({ account: acc, parentAccount: parent, transaction }: any) => {
        // For our fake account, return exactly 615.999 BTC minus fees
        const estimatedFees = new BigNumber(5000); // 0.00005 BTC in satoshis
        const maxSpendableWithFees = FAKE_SPENDABLE_SATOSHIS.minus(estimatedFees);
        return Promise.resolve(BigNumber.max(0, maxSpendableWithFees));
      },
      getTransactionStatus: async (account: any, transaction: any) => {
        // Override transaction status to enforce our limits
        const originalStatus = await originalBridge.getTransactionStatus(account, transaction);

        // If amount exceeds our spendable limit, add an error
        if (transaction.amount && transaction.amount.gt(FAKE_SPENDABLE_SATOSHIS)) {
          return {
            ...originalStatus,
            errors: {
              ...originalStatus.errors,
              amount: new Error(`Cannot send more than ${FAKE_SPENDABLE_BTC} BTC`),
            },
          };
        }

        return originalStatus;
      },
    };
  }

  // For all other accounts, use the original bridge
  return originalGetAccountBridge(account, parentAccount);
};

// Replace the global getAccountBridge function
(window as any).getAccountBridge = getAccountBridgeOverride;
