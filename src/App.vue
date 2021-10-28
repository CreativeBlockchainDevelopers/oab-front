<script setup lang="ts">
import ConnectButton from '@/components/ConnectButton.vue';
import MintButton from '@/components/MintButton.vue';
import NotificationPanel from '@/components/NotificationPanel.vue';
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
      <p>Sale is active: {{ chain.saleState.value }}</p>
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
  color: #ccc;
}
</style>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
  color: #ddd;
  padding: 1rem;

  > a {
    color: inherit;
    text-decoration: none;
  }

  h1 {
    margin: 0;
    font-weight: 300;
    text-transform: lowercase;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #111;
}

.content {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

footer {
  background: #222;
  color: #ddd;
  padding: 1rem;
}
</style>
