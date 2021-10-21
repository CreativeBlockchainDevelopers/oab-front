import { ref } from 'vue';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import abi from '../assets/abi.json';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "_",
    }
  },
};

const web3Modal = new Web3Modal({
  network: "rinkeby", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const contractAddress = "0x613b697182BfDD90Ce90d3dFb9113501aCD7fBA2";

let provider: any;
let contract: null | Contract = null;
let totalSupply = ref(0);
let maxTokens = ref(0);

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
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId: number) => {
    fetchAccountData();
  });

  // Subscribe to provider connection
  provider.on("connect", (info: { chainId: number }) => {
    fetchAccountData();
  });

  // Subscribe to provider disconnection
  provider.on("disconnect", (error: { code: number; message: string }) => {
    fetchAccountData();
  });

  await fetchAccountData();
}

async function disconnect() {
  console.log("Killing the wallet connection", provider);

  if (provider?.disconnect) {
    await provider.disconnect();
  } else if (provider?.close) {
    await provider.close();
  }

  // Unsubscribe from events
  provider.removeAllListeners();

  web3Modal.clearCachedProvider();
  provider = null;
  contract = null;

  selectedAccount.value = null;
}

async function fetchAccountData() {
  console.log('fetchAccountData');

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  console.log('chainId', chainId);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  if (accounts.length < 1) {
    disconnect();
    return null;
  }
  selectedAccount.value = accounts[0];

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
  console.log('initialized contract', contract);

  maxTokens.value = await getMaxTokens();
  totalSupply.value = await getTotalSupply();

  return web3;
}

async function getPrice(): Promise<bigint> {
  return new Promise((resolve, reject) => {
    if (contract === null) {
      return reject();
    }
    contract.methods.PRICE().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(BigInt(data));
    });
  });
}

async function getMaxTokens(): Promise<number> {
  return new Promise((resolve, reject) => {
    if (contract === null) {
      return reject();
    }
    contract.methods.MAX_TOKENS().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(Number(data));
    });
  });
}

async function getTotalSupply(): Promise<number> {
  return new Promise((resolve, reject) => {
    if (contract === null) {
      return reject();
    }
    contract.methods.totalSupply().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(Number(data));
    });
  });
}

async function mint(amount = 1): Promise<string> {
  if (isMinting.value) {
    throw new Error();
  }
  isMinting.value = true;

  const price = await getPrice();
  const n = BigInt(amount);
  return new Promise((resolve, reject) => {
    if (contract === null) {
      return reject();
    }
    contract.methods.mint(n).send({
      from: selectedAccount.value,
      value: (n * price).toString(),
    }, (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      isMinting.value = false;
      resolve(data);
    });
  });
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
}
