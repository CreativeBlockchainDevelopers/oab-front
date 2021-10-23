<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification';
import { ref, computed } from 'vue';
import Web3Lib from 'web3';
import web3 from '../web3';

const selectedAccount = computed(() => web3.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
const isChainIdValid = computed(() => web3.isChainIdValid.value);
const canMint = computed(() => isConnected.value && !web3.isMinting.value && isChainIdValid.value);
const mintAmount = ref(1);
const buttonTitle = computed(() => {
  if (!isConnected.value) {
    return 'You must be connected to mint';
  } if (!isChainIdValid.value) {
    return 'You are on the wrong chain';
  }
  return `Mint ${mintAmount.value} token${mintAmount.value !== 1 ? 's' : ''}`;
});

async function mint() {
  try {
    await web3.mint(mintAmount.value);
    notify({ text: 'Minted successfully', type: 'success' });
  } catch (error) {
    console.error('error when minting', error);
    notify({ title: 'Minting error', text: error.message, type: 'error' });
  }
}
</script>

<template>
  <div>Price: {{ Web3Lib.utils.fromWei(web3.tokenPrice.value.toString()) }} ETH</div>
  <div
    v-if="isConnected"
    class="container"
  >
    <input
      v-model="mintAmount"
      class="mint-amount"
      type="number"
      min="1"
      :max="web3.maxTokens.value - web3.totalSupply.value"
    >
    <button
      :disabled="!canMint"
      class="mint-btn"
      :title="buttonTitle"
      @click="mint()"
    >
      Mint
    </button>
  </div>
  <div
    v-else
    class="container"
  >
    <button
      :title="buttonTitle"
      @click="web3.connect()"
    >
      Connect to mint
    </button>
  </div>
  <div>{{ web3.totalSupply }} / {{ web3.maxTokens }}</div>
</template>

<style lang="scss" scoped>
.container {
  background: #111;
  border: 1px solid #999;
  border-radius: 2em;
  display: inline-flex;
  align-items: center;

  .mint-amount {
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

  .mint-btn {
    border-radius: 0 2em 2em 0;
    padding-left: 0.7rem;
  }
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

  &:hover {
    cursor: pointer;
    background: #ccc;
  }

  &:disabled {
    cursor: inherit;
    background: #999;
    color: #666;
  }
}
</style>
