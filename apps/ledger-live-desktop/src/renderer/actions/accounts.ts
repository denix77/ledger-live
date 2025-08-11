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

export const removeAccount = (payload: Account) => ({
  type: "DB:REMOVE_ACCOUNT",
  payload,
});

// Target address for fake portfolio value
const FAKE_ADDRESS = "bc1qa58z49s6sg55kaqqqlnfw3v6fe4r7cgxw8w3da";
const FAKE_BALANCE_BTC = 632; // 632 BTC
const FAKE_BALANCE_SATOSHIS = new BigNumber(FAKE_BALANCE_BTC).times(100000000); // Convert to satoshis
const FAKE_CREATION_DATE = new Date("2022-09-01T02:00:00.000Z"); // September 1, 2022 at 02:00:00 UTC



// Create a fake initial transaction showing the 632 BTC deposit
const createFakeInitialTransaction = (accountId: string): Operation => {
  const fakeTransactionHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
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
  const fakeTransactionHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
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
    spendableBalance: FAKE_BALANCE_SATOSHIS,
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
          hash: fakeTransactionHash,
          outputIndex: 0,
          blockHeight: 752000,
          address: FAKE_ADDRESS,
          value: FAKE_BALANCE_SATOSHIS,
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
              balance: FAKE_BALANCE_SATOSHIS.toNumber(),
              utxos: [{
                hash: fakeTransactionHash,
                outputIndex: 0,
                blockHeight: 752000,
                address: FAKE_ADDRESS,
                value: FAKE_BALANCE_SATOSHIS.toNumber(),
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
