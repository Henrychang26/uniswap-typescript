import { providers } from "ethers";
import React from "react";
import PageButton from "./PageButton";

type ConnectButtonProps = {
  provider?: providers.Web3Provider | undefined;
  isConnected: () => boolean;
  signerAddress?: string;
  getSigner: (value: providers.Web3Provider | undefined) => void;
};

const ConnectButton = ({
  provider,
  isConnected,
  signerAddress,
  getSigner,
}: ConnectButtonProps) => {
  const displayAddress = `${signerAddress?.substring(0, 10)}...`;

  return (
    <>
      {isConnected() ? (
        <div className="buttonContainer">
          <PageButton name={displayAddress} isBold={false} />
        </div>
      ) : (
        <div
          className="btn my-2 connectButton"
          onClick={() => {
            getSigner(provider);
          }}
        >
          Connect Wallet
        </div>
      )}
    </>
  );
};

export default ConnectButton;
