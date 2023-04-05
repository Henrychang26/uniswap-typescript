import React from "react";
import { useState, useEffect } from "react";
import { Contract, ethers, providers } from "ethers";
import "./App.css";
import { JsonRpcSigner } from "@ethersproject/providers";
import PageButton from "./components/PageButton";
import ConnectButton from "./components/ConnectButton";
import { GearFill } from "react-bootstrap-icons";
import ConfigModal from "./components/ConfigModal";
import { BeatLoader } from "react-spinners";
import CurrencyField from "./components/CurrencyField";
import {
  getUniContract,
  getWethContract,
  getPrice,
  runSwap,
} from "./AlphaRouterService";

function App() {
  const [provider, setProvider] = useState<
    providers.Web3Provider | undefined
  >();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [signerAddress, setSignerAddress] = useState<string>("");

  const [slippageAmount, setSlippageAmount] = useState<number>(1);
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(10);
  const [showModal, setShowModal] = useState<boolean>();

  const [inputAmount, setInputAmount] = useState<number | string>(0);
  const [outputAmount, setoutputAmount] = useState<number>(0);
  const [transaction, settransaction] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [ratio, setratio] = useState<number>();
  const [wethContract, setwethContract] = useState<Contract>();
  const [uniContract, setuniContract] = useState<Contract>();
  const [wethAmount, setwethAmount] = useState<number>(0);
  const [uniAmount, setuniAmount] = useState<number>(0);

  useEffect(() => {
    const onLoad = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
    };

    const wethContract = getWethContract();
    setwethContract(wethContract);

    const uniContract = getUniContract();
    setuniContract(uniContract);

    onLoad();
  }, []);

  const getSigner = async (provider: providers.Web3Provider | undefined) => {
    provider?.send("eth_requestAccounts", []);
    const signer = provider?.getSigner();
    setSigner(signer);
  };

  const isConnected = () => signer !== undefined;
  const getWalletAddress = () => {
    signer?.getAddress().then((address) => {
      setSignerAddress(address);

      wethContract?.balanceOf(address).then((res: any) => {
        setwethAmount(Number(ethers.utils.formatEther(res)));
      });

      uniContract?.balanceOf(address).then((res: any) => {
        setuniAmount(Number(ethers.utils.formatEther(res)));
      });
    });

    //todo: connect to weth and uni contracts
  };

  if (signer !== undefined) {
    getWalletAddress();
  }

  const getSwapPrice = (inputAmount: number) => {
    setLoading(true);
    setInputAmount(inputAmount);

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now() / 1000 + deadlineMinutes * 60),
      signerAddress
    ).then((data) => {
      settransaction(data[0]);
      setoutputAmount(data[1]);
      setratio(data[2]);
      setLoading(false);
    });
  };

  return (
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} isBold={false} />
          <PageButton name={"Vote"} isBold={false} />
          <PageButton name={"Charts"} isBold={false} />
        </div>
        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
          <div className="my-2 buttonContainer ">
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>
      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">Swap</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount}
              />
            )}
          </div>
          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName="MATIC"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount}
            />
            <CurrencyField
              field="output"
              tokenName="UNI"
              value={outputAmount}
              signer={signer}
              balance={uniAmount}
              spinner={BeatLoader}
              loading={loading}
              getSwapPrice={function (value: number): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
          <div className="ratioContainer">
            {ratio && <>{`1 UNI ${ratio} WMATIC`}</>}
          </div>
          <div className="swapButtonContainer">
            {isConnected() ? (
              <div
                onClick={() => runSwap(transaction, signer!)}
                className="swapButton"
              >
                Swap
              </div>
            ) : (
              <div onClick={() => getSigner(provider)} className="swapButton">
                Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
