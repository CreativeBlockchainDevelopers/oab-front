<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification';
import { ref, computed } from 'vue';
import chain from '@/chain';

const currencySymbol = computed(() => chain.currencySymbol());
const selectedAccount = computed(() => chain.selectedAccount.value);
const isConnected = computed(() => selectedAccount.value !== null);
const isChainIdValid = computed(() => chain.isChainIdValid.value);
const canMint = computed(() => isConnected.value && !chain.isMinting.value && isChainIdValid.value);
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
    const amount = mintAmount.value;
    await chain.mint(amount);
    notify({ text: `${amount} token${amount !== 1 ? 's' : ''} minted successfully`, type: 'success' });
  } catch (error: any) {
    console.error(error);
    notify({ title: 'Minting error', text: error?.message ?? `${error}`, type: 'error' });
  }
}
</script>

<template>
  <div>
    Token price: <span :title="`${chain.tokenPrice.value} mutez`">
      {{ chain.humanTokenPrice() }} {{ currencySymbol }}
    </span>
  </div>
  <div
    v-if="isConnected || !chain.saleState.value"
    class="container"
  >
    <input
      :disabled="!canMint"
      v-model="mintAmount"
      class="mint-amount"
      type="number"
      min="1"
      :max="chain.maxTokens.value - chain.totalSupply.value"
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
      @click="chain.connect()"
    >
      Connect to mint
    </button>
  </div>
  <div>{{ chain.totalSupply }} of {{ chain.maxTokens }} tokens minted</div>
</template>

<style lang="scss" scoped>
.container {
  font-size: 1.5rem;
  color: #111;
  border-radius: 4px;
  display: inline-flex;
  align-items: stretch;

  .mint-amount {
    display: inline-block;
    width: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    background: #eee;
    color: inherit;
    border: 0;
    font: inherit;
    border-radius: 4px 0 0 4px;
  }

  .mint-btn {
    border-radius: 0 4px 4px 0;
  }
}

button {
  background: #08f;
  color: #eee;
  border: 0;
  border-radius: 4px;
  padding: 0.5em 1em;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.05em;
  font-size: inherit;
  line-height: 1em;
  font: inherit;

  &:hover {
    cursor: pointer;
    background: #1af;
  }
}

button, .mint-amount {
  transition: all 0.3s;

  &:disabled {
    cursor: inherit;
    background: #999;
    color: #666;
  }
}
</style>
