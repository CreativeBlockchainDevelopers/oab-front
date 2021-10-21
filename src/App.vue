<script setup lang="ts">
import ConnectButton from './components/ConnectButton.vue'
import MintButton from './components/MintButton.vue'
import web3 from './web3';
</script>

<script lang="ts">
export default {
  async mounted() {
    await web3.tryAutoConnect();
  },
}
</script>

<template>
  <div className="wrapper">
    <header>
      <a href="#">
        <h1>open art blocks</h1>
      </a>
      <ConnectButton />
    </header>
    <div className="content">
      <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quae dignissimos dolor, recusandae sint aut praesentium iste fuga dolore officiis quis incidunt illum. Modi dicta explicabo reprehenderit earum similique quia eos.</p>
      <p>
        <MintButton />
      </p>
      <p>
        Sale is active: {{ web3.saleState.value }}
      </p>
    </div>
    <footer>open art blocks</footer>
  </div>
</template>

<style>
body {
  font-family: sans-serif;
  padding: 0;
  margin: 0;
}

#app {
  color: #ccc;
}
</style>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
  color: #ddd;
  padding: 1rem;
}

header > a {
  color: inherit;
  text-decoration: none;
}

header h1 {
  margin: 0;
  font-weight: 300;
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
