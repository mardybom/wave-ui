<template>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style scoped>
main { display:block; }
html, body {
  overflow-x: hidden;   /* block accidental horizontal scroll */
}

</style>
