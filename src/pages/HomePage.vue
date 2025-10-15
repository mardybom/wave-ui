<template>
  
  <div class="page">
    <NavBar />
    <HomePHeroSection />
    <Copyright />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import HomePHeroSection from '@/components/HomePHeroSection.vue'
import Copyright from '@/components/Copyright.vue'

</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.page > :last-child {
  margin-top: auto;
}
/* page-level styles not required; keep sections responsible for layout */
</style>
