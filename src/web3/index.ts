import { ref } from 'vue';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Web3EthContract, { Contract } from 'web3-eth-contract';
import { notify } from '@kyvg/vue3-notification';
import abi from '@/assets/abi.json';
import api from './api';
import { chains } from './chains';

enum NotificationId {
  WRONG_CHAIN = -1000,
}

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '_',
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

// env variables
const contractAddress = process.env.VUE_APP_CONTRACT_ADDRESS as string;
const fallbackProvider = process.env.VUE_APP_FALLBACK_PROVIDER;
const contractChainId = Number.parseInt(process.env.VUE_APP_CONTRACT_CHAIN_ID as string, 10);
const contractChainName = chains.find((chain) => chain.chainId === contractChainId)?.name ?? 'Unknown chain';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const fallbackContract: Contract = new Web3EthContract(abi as AbiItem[], contractAddress);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
fallbackContract.setProvider(fallbackProvider);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let provider: any;
let contract: null | Contract = null;
const totalSupply = ref(0);
const maxTokens = ref(0);
const tokenPrice = ref(BigInt(0));
const isChainIdValid = ref(false);
const saleState = ref(false);

const selectedAccount = ref<null | string>(null);
const isMinting = ref(false);

async function disconnect(): Promise<void> {
  console.log('Killing the wallet connection', provider);

  if (provider?.close) {
    await provider.close();
  }

  // Unsubscribe from events
  if (provider?.removeAllListeners) {
    provider.removeAllListeners();
  }

  web3Modal.clearCachedProvider();
  provider = null;
  contract = null;

  selectedAccount.value = null;
  isChainIdValid.value = false;
}

async function fetchContractData() {
  console.log('fetchContractData');

  let availableContract = fallbackContract;
  if (contract !== null) {
    availableContract = contract;
  }

  tokenPrice.value = await api.getPrice(availableContract);
  maxTokens.value = await api.getMaxTokens(availableContract);
  totalSupply.value = await api.getTotalSupply(availableContract);
  saleState.value = await api.getSaleState(availableContract);
}

async function fetchAccountData() {
  console.log('fetchAccountData');

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log('Web3 instance is', web3);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log('Got accounts', accounts);
  if (accounts.length < 1) {
    disconnect();
    return null;
  }
  selectedAccount.value = accounts[0];

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  console.log('chainId', chainId);
  isChainIdValid.value = chainId === contractChainId;
  notify.close(NotificationId.WRONG_CHAIN);
  if (!isChainIdValid.value) {
    notify({
      id: NotificationId.WRONG_CHAIN,
      title: 'Wrong network',
      text: `You are on the wrong chain.<br>Please change to ${contractChainName}.`,
      type: 'warn',
      duration: -1,
    });
    return web3;
  }

  contract = new web3.eth.Contract(abi as AbiItem[], contractAddress, {
    from: selectedAccount.value,
  });
  console.log('initialized contract', contract);

  fetchContractData();

  return web3;
}

async function connect(): Promise<void> {
  try {
    if (provider) {
      await disconnect();
    }
    provider = await web3Modal.connect();
  } catch (error) {
    if (error !== undefined) {
      if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw error;
      }
    } else if (!provider) {
      throw new Error('Undefined provider');
    } else {
      throw new Error('Unknown error');
    }
  }

  console.log('provider', provider);

  // Subscribe to accounts change
  provider.on('accountsChanged', () => {
    console.log('accountsChanged');
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on('chainChanged', () => {
    console.log('chainChanged');
    fetchAccountData();
  });

  // Subscribe to provider connection
  provider.on('connect', () => {
    console.log('connect');
    fetchAccountData();
  });

  // Subscribe to provider disconnection
  provider.on('disconnect', () => {
    console.log('disconnect');
    fetchAccountData();
  });

  await fetchAccountData();
}

setInterval(async () => {
  if (contract !== null) {
    await fetchContractData();
  }
}, 10_000);

async function mint(amount = 1): Promise<void> {
  if (contract === null) {
    throw new Error();
  }

  if (isMinting.value) {
    throw new Error();
  }
  isMinting.value = true;

  await fetchContractData();
  try {
    await api.sendMint(contract, tokenPrice.value, amount);
  } finally {
    isMinting.value = false;
  }
}

async function tryAutoConnect(): Promise<void> {
  if (web3Modal.cachedProvider) {
    await connect();
  } else {
    await fetchContractData();
  }
}

function currencySymbol(): string {
  return chains.find((chain) => chain.chainId === contractChainId)?.nativeCurrency.symbol ?? '???';
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
  currencySymbol,
};
