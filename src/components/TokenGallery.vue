<script setup lang="ts">
import { computed } from 'vue';
import chain from '@/chain';

const mintedTokens = computed(() => chain.mintedTokens.value?.reverse());
</script>

<template>
  <h4>Last minted tokens:</h4>
  <div class="tokens">
    <a
      v-for="token in mintedTokens"
      :key="token.tokenID"
      :href="token.artifactUri"
      class="token"
    >
      <div>
        <div class="token__title">
          #{{ token.tokenID }}: {{ token.name }}
        </div>
        <img class="token__preview" :src="token.displayUri" :alt="token.name">
      </div>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.tokens {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  a {
    text-decoration: none;
  }

  .token {
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px #0007;
    background: #222;
    color: #ddd;

    &__title {
      padding: 0.5rem;
    }

    &__preview {
      display: block;
      width: 100%;
    }
  }
}
</style>
