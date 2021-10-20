<script setup lang="ts">
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ref, computed } from "vue";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "_",
    }
  },
};

const web3Modal = new Web3Modal({
  network: "ropsten", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

let provider: any;
let selectedAccount = ref<null | string>(null);
const isConnected = computed(() => selectedAccount.value !== null);

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

  if (provider.close) {
    await provider.close();
  }
  web3Modal.clearCachedProvider();
  provider = null;

  selectedAccount.value = null;
}

async function fetchAccountData() {
  console.log('getchAccountData');

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
}
</script>

<template>
  <div v-if="isConnected" className="container">
    <span className="account-name" :title="selectedAccount?.toString()">{{ selectedAccount }}</span>
    <button @click="disconnect" className="disconnect-btn">Disconnect</button>
  </div>
  <button v-else @click="connect">Connect</button>
</template>

<style scoped>
.container {
  background: #111;
  border: 1px solid #333;
  border-radius: 2em;
  display: flex;
  align-items: center;
  padding-left: 1rem;
}

.container .account-name {
  display: inline-block;
  max-width: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container .disconnect-btn {
  border-radius: 0 2em 2em 0;
  padding-left: 0.7rem;
}

button {
  background: #ddd;
  border: 0;
  border-radius: 2em;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.05rem;
  transition: background 0.3s;
}

button:hover {
  cursor: pointer;
  background: #ccc;
}
</style>
