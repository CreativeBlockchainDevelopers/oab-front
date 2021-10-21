<script setup lang="ts">
import { computed } from "vue";
import web3 from '../web3';

const isChainIdValid = computed(() => web3.isChainIdValid.value);
const selectedAccount = computed(() => web3.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
</script>

<template>
  <div v-if="isConnected" className="container">
    <span v-if="isChainIdValid" className="account-status" title="Connected"></span>
    <span v-else className="account-status account-status--invalid" title="You are on the wrong chain"></span>
    <span className="account-name" :title="selectedAccount?.toString()">{{ selectedAccount }}</span>
    <button @click="web3.disconnect()" className="disconnect-btn">Disconnect</button>
  </div>
  <div v-else className="container">
    <button @click="web3.connect()">Connect</button>
  </div>
</template>

<style scoped>
.container {
  background: #111;
  border: 1px solid #999;
  border-radius: 2em;
  display: flex;
  align-items: center;
}

.container .account-status {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin: .1rem 0 .1rem .6rem;
  background: #5e5;
  border-radius: 1em;
  box-shadow: 0 0 .5rem #5e5;
}

.container .account-status.account-status--invalid {
  background: #ed5;
  box-shadow: 0 0 .5rem #ed5;
}

.container .account-name {
  display: inline-block;
  max-width: 10em;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: .5rem;
  margin-right: .5rem;
  font-family: monospace;
}

.container .disconnect-btn {
  border-radius: 0 2em 2em 0;
  padding-left: 0.7rem;
  background: none;
  color: inherit;
  border-left: 1px solid #333;
}

.container .disconnect-btn:hover {
  color: #e54;
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
</style>
