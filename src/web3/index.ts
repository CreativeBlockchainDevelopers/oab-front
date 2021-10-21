import { ref } from 'vue';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import abi from '../assets/abi.json';
import { AbiItem } from 'web3-utils';
import Web3EthContract, { Contract } from 'web3-eth-contract';
import api from "./api";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "_",
    }
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

const contractAddress = "0x613b697182BfDD90Ce90d3dFb9113501aCD7fBA2";

// fallback contract
const fallbackProvider = "wss://rinkeby.infura.io/ws/v3/c14a9e33f3b841cbba4bd1952fbe0e3a";
// @ts-ignore
const fallbackContract: Contract = new Web3EthContract(abi as AbiItem[], contractAddress);
// @ts-ignore
fallbackContract.setProvider(fallbackProvider);

let provider: any;
let contract: null | Contract = null;
const totalSupply = ref(0);
const maxTokens = ref(0);
const tokenPrice = ref(BigInt(0));
const isChainIdValid = ref(false);
const saleState = ref(false);

const selectedAccount = ref<null | string>(null);
const isMinting = ref(false);

async function tryAutoConnect() {
  if (web3Modal.cachedProvider) {
    await connect();
  }
}

async function connect() {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  console.log('provider', provider);

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts: string[]) => {
    console.log("accountsChanged");
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId: number) => {
    console.log("chainChanged");
    fetchAccountData();
  });

  // Subscribe to provider connection
  provider.on("connect", (info: { chainId: number }) => {
    console.log("connect");
    fetchAccountData();
  });

  // Subscribe to provider disconnection
  provider.on("disconnect", (error: { code: number; message: string }) => {
    console.log("disconnect");
    fetchAccountData();
  });

  await fetchAccountData();
}

async function disconnect() {
  console.log("Killing the wallet connection", provider);

  if (provider?.close) {
    await provider.close();
  }

  // Unsubscribe from events
  provider.removeAllListeners();

  web3Modal.clearCachedProvider();
  provider = null;
  contract = null;

  selectedAccount.value = null;
  isChainIdValid.value = false;
}

async function fetchAccountData() {
  console.log('fetchAccountData');

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  if (accounts.length < 1) {
    disconnect();
    return null;
  }
  selectedAccount.value = accounts[0];

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  console.log('chainId', chainId);
  isChainIdValid.value = chainId === 4;
  if (!isChainIdValid.value) {
    return web3;
  }

  contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
  console.log('initialized contract', contract);

  await fetchContractData(contract);

  return web3;
}

async function fetchContractData(contract: Contract | null) {
  console.log('fetchContractData');

  if (contract === null) {
    return;
  }

  tokenPrice.value = await api.getPrice(contract);
  maxTokens.value = await api.getMaxTokens(contract);
  totalSupply.value = await api.getTotalSupply(contract);
  saleState.value = await api.getSaleState(contract);
}

setInterval(async () => {
  await fetchContractData(contract);
}, 10_000);

async function mint(amount = 1) {
  if (contract === null) {
    throw new Error();
  }

  if (isMinting.value) {
    throw new Error();
  }
  isMinting.value = true;

  await fetchContractData(contract);
  const ret = await api.sendMint(contract, tokenPrice.value, amount)
  isMinting.value = false;
}

export default {
  connect,
  tryAutoConnect,
  disconnect,
  selectedAccount,
  mint,
  isMinting,
  totalSupply,
  maxTokens,
  isChainIdValid,
  tokenPrice,
  saleState,
}
