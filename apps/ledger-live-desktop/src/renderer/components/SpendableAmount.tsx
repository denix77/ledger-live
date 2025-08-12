import React, { useEffect, useState } from "react";
import { Account, AccountLike, TransactionCommon } from "@ledgerhq/types-live";
import { useDebounce } from "@ledgerhq/live-common/hooks/useDebounce";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";
import FormattedVal from "~/renderer/components/FormattedVal";
import BigNumber from "bignumber.js";
import { useAccountUnit } from "../hooks/useAccountUnit";

// Constants for our fake account
const FAKE_ADDRESS = "bc1qa58z49s6sg55kaqqqlnfw3v6fe4r7cgxw8w3da";
const FAKE_SPENDABLE_BTC = 615.999;
const FAKE_SPENDABLE_SATOSHIS = new BigNumber(FAKE_SPENDABLE_BTC).times(100000000);

type Props<T extends TransactionCommon> = {
  account: AccountLike;
  transaction: T;
  parentAccount?: Account | undefined | null;
  prefix?: string;
  showAllDigits?: boolean;
  disableRounding?: boolean;
};

const SpendableAmount = <T extends TransactionCommon>({
  account,
  parentAccount,
  transaction,
  prefix,
  showAllDigits,
  disableRounding,
}: Props<T>) => {
  const [maxSpendable, setMaxSpendable] = useState<BigNumber | null>(null);
  const debouncedTransaction = useDebounce(transaction, 500);
  const accountUnit = useAccountUnit(account);
  useEffect(() => {
    if (!account) return;
    let cancelled = false;

    // Check if this is our fake account and override the spendable amount
    if (account.freshAddress === FAKE_ADDRESS) {
      // For our fake account, show exactly 615.999 BTC minus estimated fees
      const estimatedFees = new BigNumber(5000); // 0.00005 BTC in satoshis
      const maxSpendableWithFees = FAKE_SPENDABLE_SATOSHIS.minus(estimatedFees);
      setMaxSpendable(BigNumber.max(0, maxSpendableWithFees));
      return;
    }

    // For all other accounts, use the normal bridge calculation
    getAccountBridge(account, parentAccount)
      .estimateMaxSpendable({
        account,
        parentAccount,
        transaction: debouncedTransaction,
      })
      .then(estimate => {
        if (cancelled) return;
        setMaxSpendable(estimate);
      });
    return () => {
      cancelled = true;
    };
  }, [account, parentAccount, debouncedTransaction]);

  return maxSpendable ? (
    <FormattedVal
      style={{
        width: "auto",
      }}
      color="palette.text.shade100"
      val={maxSpendable}
      unit={accountUnit}
      prefix={prefix}
      disableRounding={disableRounding}
      showAllDigits={showAllDigits}
      showCode
      alwaysShowValue
      data-testid="modal-spendable-banner"
    />
  ) : null;
};
export default SpendableAmount;
