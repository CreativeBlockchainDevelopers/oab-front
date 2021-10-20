import { ref } from 'vue';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import abi from '../assets/abi.json';
import { AbiItem } from 'web3-utils';

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

let provider: any;
const selectedAccount = ref<null | string>(null);

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

  if (provider && provider.close) {
    await provider.close();
  }
  web3Modal.clearCachedProvider();
  provider = null;

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

  return web3;
}

async function mint(amount = 1) {
  const web3 = await fetchAccountData();
  if (web3 === null) {
    return;
  }

  const address = "0x613b697182BfDD90Ce90d3dFb9113501aCD7fBA2";

  const contract = new web3.eth.Contract(abi as AbiItem[], address, {
    from: selectedAccount.value?.toString(),
  });
  console.log('initialized contract', contract);

  contract.methods.PRICE().call({}, "latest", (error: any, data: any) => {
    const price = BigInt(data);
    console.log(price);
    const n = BigInt(amount);
    contract.methods.mint(n).send({ value: (n * price).toString() }, (error: any, data: any) => {
      console.log(error, data);
    });
  })
}

export default {
  connect,
  disconnect,
  selectedAccount,
  mint,
}
