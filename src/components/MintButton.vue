<script setup lang="ts">
import { ref, computed } from "vue";
import web3 from '../web3';
import Web3Lib from "web3";

const selectedAccount = computed(() => web3.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
const isChainIdValid = computed(() => web3.isChainIdValid.value);
const canMint = computed(() => isConnected.value && !web3.isMinting.value && isChainIdValid.value);
const mintAmount = ref(1);
const buttonTitle = computed(() => {
  if (!isConnected.value) {
    return "You must be connected to mint";
  } else if (!isChainIdValid.value) {
    return "You are on the wrong chain";
  } else {
    return `Mint ${mintAmount.value} token${mintAmount.value !== 1 ? 's' : ''}`;
  }
});

async function mint() {
  try {
    await web3.mint(mintAmount.value);
  } catch (error) {
    console.error('error when minting', error);
  }
}
</script>

<template>
  <div>Price: {{ Web3Lib.utils.fromWei(web3.tokenPrice.value.toString()) }} ETH</div>
  <div v-if="isConnected" class="container">
    <input
      class="mint-amount"
      type="number"
      min="1"
      :max="web3.maxTokens.value - web3.totalSupply.value"
      v-model="mintAmount"
    />
    <button @click="mint()" :disabled="!canMint" class="mint-btn" :title="buttonTitle">Mint</button>
  </div>
  <div v-else class="container">
    <button @click="web3.connect()" :title="buttonTitle">Connect to mint</button>
  </div>
  <div>{{ web3.totalSupply }} / {{ web3.maxTokens }}</div>
</template>

<style scoped>
.container {
  background: #111;
  border: 1px solid #999;
  border-radius: 2em;
  display: inline-flex;
  align-items: center;
}

.container .mint-amount {
  display: inline-block;
  width: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  background: none;
  color: inherit;
  border: 0;
  font: inherit;
  padding-left: 0.3rem;
  line-height: 2rem;
  border-radius: 2em 0 0 2em;
}

.container .mint-btn {
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
  transition: all 0.3s;
}

button:hover {
  cursor: pointer;
  background: #ccc;
}

button:disabled {
  cursor: inherit;
  background: #999;
  color: #666;
}
</style>
