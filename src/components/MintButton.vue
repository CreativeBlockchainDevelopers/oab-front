<script setup lang="ts">
import { computed } from "vue";
import web3 from '../web3';

const selectedAccount = computed(() => web3.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
const canMint = computed(() => isConnected.value && !web3.isMinting.value);
const mintAmount = 1;
</script>

<template>
  <div v-if="isConnected" className="container">
    <input className="mint-amount" type="number" min="1" v-model="mintAmount">
    <button @click="web3.mint(mintAmount)" :disabled="!canMint" className="mint-btn">Mint</button>
  </div>
  <div v-else className="container">
    <button @click="web3.connect()">Connect to mint</button>
  </div>
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
  margin-left: .2rem;
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
