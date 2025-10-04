<template>
  <NavBar>
    <template #left>
      <router-link to="/learn" class="back">← Back</router-link>
    </template>
  </NavBar>
</template>

<script setup>
import NavBar from './NavBar.vue';
</script>

<style scoped>
.back{
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 24px;
  font-weight: 800;
  font-family: 'OpenDyslexic', system-ui, sans-serif;
  color: var(--ink-700);
}

.back:hover{ 
  background: rgba(15,42,67,.06); 
}
</style>