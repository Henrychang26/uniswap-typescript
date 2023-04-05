import {
  AlphaRouter,
  SwapOptions,
  SwapOptionsSwapRouter02,
  SwapRoute,
  SwapType,
  MethodParameters,
} from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { ethers, BigNumber, Signer } from "ethers";
import JSBI from "jsbi";
import ERC20ABI from "./abi.json";
import { Deferrable } from "@ethersproject/properties";
import { JsonRpcSigner } from "@ethersproject/providers/lib/json-rpc-provider";

const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET;

const chainId = 137;

const web3Provider = new ethers.providers.JsonRpcProvider(
  REACT_APP_INFURA_URL_TESTNET
);

//Alpha takes 2 args defined above
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider });

const name0 = "Wrapped Matic";
const symbol0 = "WMATIC";
const decimals0 = 18;
const address0 = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

const name1 = "UNI Token";
const symbol1 = "UNI";
const decimals1 = 18;
const address1 = "0xb33EaAd8d922B1083446DC23f610c2567fB5180f";

//Args must be in order
const WETH = new Token(chainId, address0, decimals0, symbol0, name0);
const UNI = new Token(chainId, address1, decimals1, symbol1, name1);

export const getWethContract = () =>
  new ethers.Contract(address0, ERC20ABI, web3Provider);

export const getUniContract = () =>
  new ethers.Contract(address1, ERC20ABI, web3Provider);

export const getPrice = async (
  inputAmount: number,
  slippageAmount: number,
  deadline: number,
  walletAddress: string
) => {
  const percentSlippage = new Percent(slippageAmount, 100);
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0);
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei));

  const options: SwapOptionsSwapRouter02 = {
    type: SwapType.SWAP_ROUTER_02,
    recipient: walletAddress,
    slippageTolerance: percentSlippage,
    deadline: deadline,
  };

  const route = await router.route(
    currencyAmount,
    UNI,
    TradeType.EXACT_INPUT,
    options
  );

  const transaction = {
    data: route?.methodParameters?.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route?.methodParameters?.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route?.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000),
  };

  const quoteAmountOut: any = route?.quote.toFixed(6);
  const ratio = (inputAmount / quoteAmountOut).toFixed(3);

  return [transaction, quoteAmountOut, ratio];
};

export const runSwap = async (
  transaction: Deferrable<ethers.providers.TransactionRequest>,
  signer: JsonRpcSigner
) => {
  const approvedAmount = ethers.utils.parseUnits("10", 18).toString();
  const contract0 = getWethContract();
  await contract0
    .connect(signer)
    .approve(V3_SWAP_ROUTER_ADDRESS, approvedAmount);

  signer.sendTransaction(transaction);
};
