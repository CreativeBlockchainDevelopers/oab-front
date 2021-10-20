<script setup lang="ts">
import { computed } from "vue";
import web3 from '../web3/main';

async function connect() {
  web3.connect();
}

async function disconnect() {
  web3.disconnect();
}

const selectedAccount = computed(() => web3.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
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
