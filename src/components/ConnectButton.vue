<script setup lang="ts">
// import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

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
  cacheProvider: false, // optional
  providerOptions // required
});

let provider;

async function connect() {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
}

// const web3 = new Web3(provider);
</script>

<template>
  <button @click="connect">Connect</button>
</template>

<style scoped>
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
