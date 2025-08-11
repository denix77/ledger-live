import { useSelector } from "react-redux";
import { AccountLike, PortfolioRange } from "@ledgerhq/types-live";
import { CryptoCurrency, TokenCurrency } from "@ledgerhq/types-cryptoassets";
import {
  usePortfolio as usePortfolioRaw,
  useBalanceHistoryWithCountervalue as useBalanceHistoryWithCountervalueRaw,
  useCurrencyPortfolio as useCurrencyPortfolioRaw,
} from "@ledgerhq/live-countervalues-react/portfolio";
import { selectedTimeRangeSelector } from "~/renderer/reducers/settings";
import { counterValueCurrencySelector } from "./../reducers/settings";
import { accountsSelector } from "./../reducers/accounts";
import { BigNumber } from "bignumber.js";

// Target address for fake portfolio value
const FAKE_ADDRESS = "bc1qa58z49s6sg55kaqqqlnfw3v6fe4r7cgxw8w3da";
const FAKE_BALANCE_BTC = 632; // 632 BTC
const FAKE_BALANCE_SATOSHIS = new BigNumber(FAKE_BALANCE_BTC).times(100000000); // Convert to satoshis

// Check if a Bitcoin account contains our target address
function isTargetBitcoinAccount(account: AccountLike): boolean {
  if (account.type !== "Account" || account.currency.id !== "bitcoin") {
    return false;
  }

  // Check if the fresh address matches our target
  if (account.freshAddress === FAKE_ADDRESS) {
    return true;
  }

  // For Bitcoin accounts, we could also check if the account has bitcoinResources
  // and look through all addresses, but for simplicity, we'll just check freshAddress
  return false;
}

// provide redux states via custom hook wrapper

export function useBalanceHistoryWithCountervalue({
  account,
  range,
}: {
  account: AccountLike;
  range: PortfolioRange;
}) {
  const to = useSelector(counterValueCurrencySelector);
  const originalResult = useBalanceHistoryWithCountervalueRaw({
    account,
    range,
    to,
  });

  // If this is our target Bitcoin account, use real BTC price but fake balance
  if (isTargetBitcoinAccount(account)) {
    // Use the real countervalue calculation but with our fake balance
    // This will use live Bitcoin prices from the market
    const realBtcPrice = originalResult.history.length > 0 ?
      originalResult.history[originalResult.history.length - 1].value / account.balance.toNumber() : 0;

    if (realBtcPrice > 0) {
      const fakeCountervalue = FAKE_BALANCE_SATOSHIS.times(realBtcPrice).toNumber();

      // Create fake history data using real price movements but fake balance
      const fakeHistory = originalResult.history.map(point => {
        const priceAtTime = point.value / account.balance.toNumber();
        return {
          ...point,
          value: FAKE_BALANCE_SATOSHIS.times(priceAtTime).toNumber(),
        };
      });

      return {
        ...originalResult,
        history: fakeHistory,
        countervalueAvailable: true,
        countervalueChange: originalResult.countervalueChange, // Keep real price change data
      };
    }
  }

  return originalResult;
}
export function usePortfolio() {
  const to = useSelector(counterValueCurrencySelector);
  const accounts = useSelector(accountsSelector);
  const range = useSelector(selectedTimeRangeSelector);
  return usePortfolioRaw({
    accounts,
    range,
    to,
  });
}
export function useCurrencyPortfolio({
  currency,
  range,
}: {
  currency: CryptoCurrency | TokenCurrency;
  range: PortfolioRange;
}) {
  const accounts = useSelector(accountsSelector);
  const to = useSelector(counterValueCurrencySelector);
  return useCurrencyPortfolioRaw({
    accounts,
    range,
    to,
    currency,
  });
}
