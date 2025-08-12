import React, { useCallback, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";
import { Account, AccountLike, TransactionCommon } from "@ledgerhq/types-live";
import { Transaction, TransactionStatus } from "@ledgerhq/live-common/generated/types";
import Box from "~/renderer/components/Box";
import Label from "~/renderer/components/Label";
import RequestAmount from "~/renderer/components/RequestAmount";
import Switch from "~/renderer/components/Switch";
import Text from "~/renderer/components/Text";

// Constants for our fake account
const FAKE_ADDRESS = "bc1qa58z49s6sg55kaqqqlnfw3v6fe4r7cgxw8w3da";
const FAKE_SPENDABLE_BTC = 615.999;
const FAKE_SPENDABLE_SATOSHIS = new BigNumber(FAKE_SPENDABLE_BTC).times(100000000);

type Props<T extends TransactionCommon> = {
  parentAccount?: Account | null;
  account: AccountLike;
  transaction: Transaction;
  onChangeTransaction: (_: T) => void;
  status: TransactionStatus;
  bridgePending: boolean;
  t: TFunction;
  initValue?: BigNumber;
  walletConnectProxy?: boolean;
  resetInitValue?: () => void;
  withUseMaxLabel?: boolean;
};

const AmountField = <T extends TransactionCommon>({
  account,
  parentAccount,
  transaction,
  onChangeTransaction,
  status,
  bridgePending,
  t,
  initValue,
  resetInitValue,
  walletConnectProxy,
  withUseMaxLabel,
}: Props<T>) => {
  const bridge = getAccountBridge(account, parentAccount);

  useEffect(() => {
    if (initValue && !initValue.eq(transaction.amount || new BigNumber(0))) {
      onChangeTransaction(bridge.updateTransaction(transaction, { amount: initValue }));
      resetInitValue && resetInitValue();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = useCallback(
    (amount: BigNumber) => {
      // Check if this is our fake account and cap the amount
      if (account.freshAddress === FAKE_ADDRESS && amount.gt(FAKE_SPENDABLE_SATOSHIS)) {
        // Cap the amount to our maximum spendable
        onChangeTransaction(bridge.updateTransaction(transaction, { amount: FAKE_SPENDABLE_SATOSHIS }));
      } else {
        onChangeTransaction(bridge.updateTransaction(transaction, { amount }));
      }
    },
    [bridge, transaction, onChangeTransaction, account],
  );

  const onChangeSendMax = useCallback(
    (useAllAmount: boolean) => {
      // Check if this is our fake account and handle Send Max specially
      if (useAllAmount && account.freshAddress === FAKE_ADDRESS) {
        // For our fake account, set the exact amount instead of using useAllAmount
        const estimatedFees = new BigNumber(5000); // 0.00005 BTC in satoshis
        const maxAmount = FAKE_SPENDABLE_SATOSHIS.minus(estimatedFees);
        onChangeTransaction(
          bridge.updateTransaction(transaction, {
            useAllAmount: false, // Don't use the bridge's useAllAmount
            amount: BigNumber.max(0, maxAmount),
          }),
        );
      } else {
        // For all other accounts, use the normal behavior
        onChangeTransaction(
          bridge.updateTransaction(transaction, {
            useAllAmount,
            amount: new BigNumber(0),
          }),
        );
      }
    },
    [bridge, transaction, onChangeTransaction, account],
  );

  if (!status) return null;

  const { useAllAmount } = transaction;
  const { amount, errors, warnings } = status;
  const { amount: amountError, dustLimit: messageDust } = errors;
  const { amount: amountWarning } = warnings;

  let amountErrMessage: Error | undefined = amountError;
  let amountWarnMessage: Error | undefined = amountWarning;

  // we ignore zero case for displaying field error because field is empty.
  if (amount.eq(0) && (bridgePending || !useAllAmount)) {
    amountErrMessage = undefined;
    amountWarnMessage = undefined;
  }

  return (
    <Box flow={1}>
      <Box
        horizontal
        alignItems="center"
        justifyContent="space-between"
        style={{ width: "50%", paddingRight: 28 }}
      >
        <Label>{t("send.steps.details.amount")}</Label>
        {typeof useAllAmount === "boolean" ? (
          <Box horizontal alignItems="center">
            <Text
              color="palette.text.shade40"
              ff="Inter|Medium"
              fontSize={10}
              style={{ paddingRight: 5 }}
              onClick={() => {
                if (!walletConnectProxy) {
                  onChangeSendMax(!useAllAmount);
                }
              }}
            >
              <Trans
                i18nKey={
                  withUseMaxLabel ? "send.steps.details.useMax" : "send.steps.details.sendMax"
                }
              />
            </Text>
            <Switch
              small
              isChecked={useAllAmount}
              onChange={onChangeSendMax}
              disabled={walletConnectProxy}
              data-testid="modal-max-checkbox"
            />
          </Box>
        ) : null}
      </Box>
      <RequestAmount
        disabled={!!useAllAmount || walletConnectProxy}
        account={account}
        validTransactionError={amountErrMessage || messageDust}
        validTransactionWarning={amountWarnMessage}
        onChange={onChange}
        value={walletConnectProxy ? transaction.amount : amount}
        autoFocus={!initValue}
      />
    </Box>
  );
};

export default AmountField;
