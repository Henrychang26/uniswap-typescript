import { JsonRpcSigner } from "@ethersproject/providers";
import React from "react";

type CurrencyFieldProps = {
  field?: string;
  tokenName: string;
  getSwapPrice: (value: number) => void;
  value?: number;
  signer: JsonRpcSigner | undefined;
  balance: number;
  spinner?: any;
  loading?: boolean;
};

const CurrencyField = ({
  field,
  tokenName,
  getSwapPrice,
  value,
  signer,
  balance,
  spinner,
  loading,
}: CurrencyFieldProps) => {
  const getPrice = (value: number) => {
    getSwapPrice(value);
  };

  return (
    <div className="row currencyInput">
      <div className="col-md-6 numberContainer">
        {loading ? (
          <div className="spinnerContainer">{spinner}</div>
        ) : (
          <input
            className="currencyInputField"
            placeholder="0.0"
            value={value}
            onBlur={(e) =>
              field === "input" ? getPrice(Number(e.target.value)) : null
            }
          />
        )}
      </div>
      <div className="col-md-6 tokenContainer">
        <span className="tokenName">{tokenName}</span>
        <div className="balanceContainer">
          <span className="balanceAmount">Balance: {balance.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrencyField;
