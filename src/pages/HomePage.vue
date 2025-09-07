<template>
  <NavBar />
  <!-- Full-width sections; each section handles its own inner container -->
  <HomePHeroSection />

  <!-- Keep your existing sections as-is (they should NOT be wrapped
       in a page-level .container). If any are wrapped, remove it. -->
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import HomePHeroSection from '@/components/HomePHeroSection.vue'
import HomePBlueSection from '@/components/HomePBlueSection.vue'
import WaveBlueToGreen from '@/components/WaveBlueToGreen.vue'
import HomePGreenSection from '@/components/HomePGreenSection.vue'
import WaveGreenToPink from '@/components/WaveGreenToPink.vue'
import HomePPinkSection from '@/components/HomePPinkSection.vue'
</script>

<style scoped>
/* page-level styles not required; keep sections responsible for layout */
</style>
