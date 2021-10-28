import { ref } from 'vue';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk';
import api from './api';

// env variables
const contractAddress = process.env.VUE_APP_CONTRACT_ADDRESS as string;
const fallbackProvider = process.env.VUE_APP_FALLBACK_PROVIDER as string;
const contractChainId = process.env.VUE_APP_CONTRACT_CHAIN_ID as NetworkType;
const appName = process.env.VUE_APP_NAME as string;

let wallet: BeaconWallet | undefined;
const tezos = new TezosToolkit(fallbackProvider);

const totalSupply = ref(0);
const maxTokens = ref(0);
const tokenPrice = ref(0);
const isChainIdValid = ref(false);
const saleState = ref(false);

const selectedAccount = ref<null | string>(null);
const isMinting = ref(false);

async function disconnect(): Promise<void> {
  console.log('Killing the wallet connection');

  if (wallet) {
    await wallet.client.destroy();
    await wallet.clearActiveAccount();
    wallet = undefined;
  }
  selectedAccount.value = null;
  isChainIdValid.value = false;
}

async function fetchContractData() {
  console.log('fetchContractData');

  const availableContract = await tezos.wallet.at(contractAddress);
  const storage = await api.getStorage(availableContract);
  tokenPrice.value = storage.price ?? 1e6;
  maxTokens.value = storage.max_tokens?.c[0] ?? 1e9;
  totalSupply.value = storage.all_tokens.c[0];
  saleState.value = !storage.paused;
}

async function fetchAccountData() {
  console.log('fetchAccountData');

  if (wallet) {
    selectedAccount.value = await wallet.getPKH();
  }
  isChainIdValid.value = true;
}

async function connect(noInteraction = false): Promise<void> {
  try {
    if (!wallet) {
      wallet = new BeaconWallet({
        name: appName,
        preferredNetwork: contractChainId,
      });
    }

    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      tezos.setWalletProvider(wallet);
    } else if (!noInteraction) {
      await wallet.requestPermissions({
        network: {
          type: contractChainId,
        },
      });
      tezos.setWalletProvider(wallet);
    } else {
      await fetchContractData();
      return;
    }
  } catch (error) {
    if (error !== undefined) {
      if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw error;
      }
    } else {
      throw new Error('Unknown error');
    }
  }

  console.log('wallet', wallet);

  await fetchAccountData();
  await fetchContractData();
}

setInterval(async () => {
  if (selectedAccount.value !== null) {
    await fetchContractData();
  }
}, 60_000);

async function mint(amount = 1): Promise<void> {
  if (isMinting.value) {
    throw new Error();
  }
  isMinting.value = true;

  const availableContract = await tezos.wallet.at(contractAddress);
  try {
    await api.sendMint(availableContract, tokenPrice.value, amount);
  } finally {
    isMinting.value = false;
  }
}

async function tryAutoConnect(): Promise<void> {
  await connect(true);
}

function humanTokenPrice(): number {
  return Number(tokenPrice.value) / 1e6;
}

function currencySymbol(): string {
  return 'ꜩ';
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
  humanTokenPrice,
  currencySymbol,
};
