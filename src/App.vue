<script setup lang="ts">
import ConnectButton from '@/components/ConnectButton.vue';
import MintButton from '@/components/MintButton.vue';
import NotificationPanel from '@/components/NotificationPanel.vue';
import TokenGallery from '@/components/TokenGallery.vue';
</script>

<script lang="ts">
import chain from '@/chain';

const appName = process.env.VUE_APP_NAME as string;

export default {
  async mounted(): Promise<void> {
    await chain.tryAutoConnect();
  },
};
</script>

<template>
  <div class="wrapper">
    <header>
      <a href="#">
        <h1>{{ appName }}</h1>
      </a>
      <ConnectButton />
    </header>
    <div class="content">
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit.  Quae dignissimos dolor,
        recusandae sint aut praesentium iste fuga dolore officiis quis incidunt illum. Modi dicta
        explicabo reprehenderit earum similique quia eos.
      </p>
      <p>
        <MintButton />
      </p>
      <p v-if="chain.saleState.value">The sale is active!</p>
      <p v-else>The sale is not active.</p>
      <TokenGallery />
    </div>
    <footer>{{ appName }}</footer>
    <NotificationPanel />
  </div>
</template>

<style lang="scss">
body {
  font-family: sans-serif;
  padding: 0;
  margin: 0;
}

#app {
  color: #333;
}
</style>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ddd;
  color: #333;
  padding: 1rem;

  > a {
    color: inherit;
    text-decoration: none;
  }

  h1 {
    margin: 0;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #eee;
}

.content {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

footer {
  background: #ddd;
  color: #333;
  padding: 1rem;
}
</style>
