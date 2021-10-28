<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification';
import { computed } from 'vue';
import chain from '@/chain';

const isChainIdValid = computed(() => chain.isChainIdValid.value);
const selectedAccount = computed(() => chain.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);

async function connect() {
  try {
    await chain.connect();
    notify({ text: 'Connected', type: 'success' });
  } catch (error: any) {
    if (error?.message !== 'Modal closed by user' && error?.message !== 'Undefined provider') {
      notify({ title: 'Connection error', text: error?.message ?? `${error}`, type: 'error' });
      console.error(error);
    }
  }
}

async function disconnect() {
  await chain.disconnect();
  notify({ text: 'Disconnected', type: 'info' });
}
</script>

<template>
  <div
    v-if="isConnected"
    class="container"
  >
    <span
      v-if="isChainIdValid"
      class="account-status"
      title="Connected"
    />
    <span
      v-else
      class="account-status account-status--invalid"
      title="You are on the wrong chain"
    />
    <span
      class="account-name"
      :title="selectedAccount?.toString()"
    >{{ selectedAccount }}</span>
    <button
      class="disconnect-btn"
      @click="disconnect()"
    >
      Disconnect
    </button>
  </div>
  <div
    v-else
    class="container"
  >
    <button @click="connect()">
      Connect
    </button>
  </div>
</template>

<style lang="scss" scoped>
.container {
  background: #111;
  border-radius: 2em;
  display: flex;
  align-items: center;

  .account-status {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin: 0.1rem 0 0.1rem 0.6rem;
    background: #5e5;
    border-radius: 1em;
    box-shadow: 0 0 0.5rem #5e5;

    &--invalid {
      background: #ed5;
      box-shadow: 0 0 0.5rem #ed5;
    }
  }

  .account-name {
    display: inline-block;
    max-width: 10em;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    font-family: monospace;
  }

  .disconnect-btn {
    border-radius: 0 2em 2em 0;
    padding-left: 0.7rem;
    background: none;
    color: inherit;
    border-left: 1px solid #222;

    &:hover {
      color: #e54;
    }
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
  font: inherit;

  &:hover {
    cursor: pointer;
    background: #ccc;
  }
}
</style>
